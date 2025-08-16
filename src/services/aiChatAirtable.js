/**
 * AirCasa aiChat Airtable Service
 * Handles all Airtable operations for the aiChat feature
 */

import { AI_CHAT_CONFIG, MESSAGE_TYPES, USER_INTENTS } from '@/config/aiChatConfig';

class AiChatAirtableService {
  constructor() {
    this.baseId = AI_CHAT_CONFIG.BASE_ID;
    this.apiKey = AI_CHAT_CONFIG.API_KEY;
    this.baseUrl = `https://api.airtable.com/v0/${this.baseId}`;
    this.headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Generic Airtable API request handler
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}/${endpoint}`;
    const config = {
      headers: this.headers,
      ...options
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Airtable request failed:', error);
      throw error;
    }
  }

  /**
   * CHAT SESSIONS OPERATIONS
   */
  
  async createChatSession(userId, propertyId, voiceMode = AI_CHAT_CONFIG.VOICE_MODES.TEXT_ONLY) {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const sessionData = {
      fields: {
        session_id: sessionId,
        user_id: userId,
        property_id: propertyId,
        start_time: new Date().toISOString(),
        voice_mode: voiceMode,
        total_messages: 0,
        session_status: 'Active'
      }
    };

    const response = await this.request(AI_CHAT_CONFIG.TABLES.CHAT_SESSIONS, {
      method: 'POST',
      body: JSON.stringify(sessionData)
    });

    return {
      sessionId,
      recordId: response.id,
      ...response.fields
    };
  }

  async updateChatSession(recordId, updates) {
    const updateData = {
      fields: updates
    };

    const response = await this.request(`${AI_CHAT_CONFIG.TABLES.CHAT_SESSIONS}/${recordId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData)
    });

    return response;
  }

  async endChatSession(recordId) {
    return await this.updateChatSession(recordId, {
      end_time: new Date().toISOString(),
      session_status: 'Completed'
    });
  }

  /**
   * CHAT MESSAGES OPERATIONS
   */

  async saveChatMessage(sessionId, messageType, messageText, userIntent = USER_INTENTS.GENERAL, responseTime = null) {
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const messageData = {
      fields: {
        message_id: messageId,
        session_id: sessionId,
        message_type: messageType,
        message_text: messageText,
        timestamp: new Date().toISOString(),
        user_intent: userIntent,
        ...(responseTime && { response_time_ms: responseTime }),
        ...(messageType === MESSAGE_TYPES.AI && { ai_confidence: 0.9 }) // Default confidence
      }
    };

    const response = await this.request(AI_CHAT_CONFIG.TABLES.CHAT_MESSAGES, {
      method: 'POST',
      body: JSON.stringify(messageData)
    });

    return {
      messageId,
      recordId: response.id,
      ...response.fields
    };
  }

  async getChatHistory(sessionId, limit = 50) {
    const filterFormula = `{session_id} = '${sessionId}'`;
    const params = new URLSearchParams({
      filterByFormula: filterFormula,
      sort: JSON.stringify([{ field: 'timestamp', direction: 'asc' }]),
      maxRecords: limit.toString()
    });

    const response = await this.request(`${AI_CHAT_CONFIG.TABLES.CHAT_MESSAGES}?${params}`);
    return response.records.map(record => ({
      recordId: record.id,
      ...record.fields
    }));
  }

  // Alias for OpenAI integration
  async getSessionMessages(sessionId, limit = 50) {
    const messages = await this.getChatHistory(sessionId, limit);
    return messages.map(msg => ({
      type: msg.message_type,
      text: msg.message_text,
      timestamp: msg.timestamp
    }));
  }

  /**
   * USER VOICE PREFERENCES OPERATIONS
   */

  async getUserVoicePreferences(userId) {
    const filterFormula = `{user_id} = '${userId}'`;
    const params = new URLSearchParams({
      filterByFormula: filterFormula,
      maxRecords: '1'
    });

    try {
      const response = await this.request(`${AI_CHAT_CONFIG.TABLES.USER_VOICE_PREFERENCES}?${params}`);
      
      if (response.records.length > 0) {
        return {
          recordId: response.records[0].id,
          ...response.records[0].fields
        };
      }
      
      // Return default preferences if none exist
      return {
        user_id: userId,
        preferred_voice_mode: AI_CHAT_CONFIG.VOICE_MODES.TEXT_ONLY,
        voice_speed: 1.0,
        voice_stability: 0.5,
        voice_clarity: 0.5,
        auto_play_responses: false,
        background_listening: false
      };
    } catch (error) {
      console.error('Error fetching voice preferences:', error);
      return null;
    }
  }

  async saveUserVoicePreferences(userId, preferences) {
    // First, try to find existing preferences
    const existing = await this.getUserVoicePreferences(userId);
    
    const preferenceData = {
      fields: {
        user_id: userId,
        ...preferences
      }
    };

    if (existing && existing.recordId) {
      // Update existing preferences
      const response = await this.request(`${AI_CHAT_CONFIG.TABLES.USER_VOICE_PREFERENCES}/${existing.recordId}`, {
        method: 'PATCH',
        body: JSON.stringify(preferenceData)
      });
      return response;
    } else {
      // Create new preferences
      const response = await this.request(AI_CHAT_CONFIG.TABLES.USER_VOICE_PREFERENCES, {
        method: 'POST',
        body: JSON.stringify(preferenceData)
      });
      return response;
    }
  }

  /**
   * AI KNOWLEDGE BASE OPERATIONS
   */

  async searchKnowledgeBase(keywords, category = null) {
    let filterFormula = keywords.map(keyword => 
      `SEARCH('${keyword.toLowerCase()}', LOWER({question_keywords}))`
    ).join(' OR ');

    if (category) {
      filterFormula = `AND({category} = '${category}', OR(${filterFormula}))`;
    }

    const params = new URLSearchParams({
      filterByFormula: filterFormula,
      sort: JSON.stringify([{ field: 'effectiveness_score', direction: 'desc' }]),
      maxRecords: '10'
    });

    try {
      const response = await this.request(`${AI_CHAT_CONFIG.TABLES.AI_KNOWLEDGE_BASE}?${params}`);
      return response.records.map(record => ({
        recordId: record.id,
        ...record.fields
      }));
    } catch (error) {
      console.error('Error searching knowledge base:', error);
      return [];
    }
  }

  /**
   * SYSTEM PERFORMANCE OPERATIONS
   */

  async recordPerformanceMetrics(metrics) {
    const performanceData = {
      fields: {
        timestamp: new Date().toISOString(),
        ...metrics
      }
    };

    try {
      const response = await this.request(AI_CHAT_CONFIG.TABLES.SYSTEM_PERFORMANCE, {
        method: 'POST',
        body: JSON.stringify(performanceData)
      });
      return response;
    } catch (error) {
      console.error('Error recording performance metrics:', error);
      return null;
    }
  }

  /**
   * UTILITY METHODS
   */

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Create singleton instance
const aiChatAirtable = new AiChatAirtableService();
export default aiChatAirtable;