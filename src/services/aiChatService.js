/**
 * AirCasa aiChat Service
 * Handles AI processing, ElevenLabs integration, and chat orchestration
 */

import { AI_CHAT_CONFIG, MESSAGE_TYPES, USER_INTENTS, WIDGET_STATES } from '@/config/aiChatConfig';
import aiChatAirtable from './aiChatAirtable';
import voiceService from './voiceService';
import { properties, users } from '@/api/functions'; // Existing AirCasa API functions

class AiChatService {
  constructor() {
    this.currentSession = null;
    this.isListening = false;
    this.isProcessing = false;
    this.audioContext = null;
    this.mediaRecorder = null;
    this.websocket = null;
    this.eventListeners = new Map();
    
    this.initializeAudioContext();
  }

  /**
   * INITIALIZATION
   */

  async initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  /**
   * SESSION MANAGEMENT
   */

  async startChatSession(userId, propertyId, voiceMode = AI_CHAT_CONFIG.VOICE_MODES.TEXT_ONLY) {
    try {
      console.log('🚀 Starting aiChat session:', { userId, propertyId, voiceMode });
      
      this.currentSession = await aiChatAirtable.createChatSession(userId, propertyId, voiceMode);
      
      // Load user context (property data, preferences)
      await this.loadUserContext(userId, propertyId);
      
      // Initialize voice preferences
      const voicePrefs = await aiChatAirtable.getUserVoicePreferences(userId);
      this.voicePreferences = voicePrefs;
      
      // Send welcome message
      await this.sendWelcomeMessage();
      
      this.emit('sessionStarted', this.currentSession);
      return this.currentSession;
      
    } catch (error) {
      console.error('Failed to start chat session:', error);
      throw error;
    }
  }

  async endChatSession() {
    if (!this.currentSession) return;

    try {
      // Stop any ongoing voice activities
      this.stopListening();
      this.stopSpeaking();
      
      // Update session in Airtable
      await aiChatAirtable.endChatSession(this.currentSession.recordId);
      
      // Clean up
      this.currentSession = null;
      this.userContext = null;
      
      this.emit('sessionEnded');
      
    } catch (error) {
      console.error('Error ending chat session:', error);
    }
  }

  /**
   * USER CONTEXT LOADING
   */

  async loadUserContext(userId, propertyId) {
    try {
      // Load property data from existing AirCasa tables
      const propertyData = await properties.get(propertyId);
      
      // Try to get user data - users service has getById method, not get
      let userData;
      try {
        userData = await users.getById(userId);
      } catch (userError) {
        console.log('Could not load user data, using basic info:', userError);
        userData = { id: userId };
      }
      
      this.userContext = {
        user: userData,
        property: propertyData,
        currentPage: this.getCurrentPageContext(),
        taskStatus: this.getTaskCompletionStatus(propertyData)
      };
      
      console.log('📊 User context loaded:', this.userContext);
      
    } catch (error) {
      console.error('Error loading user context:', error);
      this.userContext = { user: { id: userId }, property: { id: propertyId } };
    }
  }

  getCurrentPageContext() {
    const path = window.location.pathname;
    if (path.includes('/property/')) return 'property_details';
    if (path.includes('/dashboard')) return 'dashboard';
    if (path.includes('/packages/')) return 'package_selection';
    if (path.includes('/photo-packages/')) return 'photo_packages';
    return 'general';
  }

  getTaskCompletionStatus(propertyData) {
    if (!propertyData) return {};
    
    return {
      propertyIntake: !!propertyData.completedIntake,
      photosMedia: !!propertyData.photosCompleted,
      agentConsultation: !!propertyData.consultationCompleted,
      homeCriteria: !!propertyData.homeCriteriaCompleted,
      personalFinancials: !!propertyData.personalFinancialCompleted,
      homeBuyingEnabled: !!propertyData.isBuyingHome
    };
  }

  /**
   * MESSAGE PROCESSING
   */

  async processUserMessage(message, messageType = 'text') {
    if (!this.currentSession) {
      throw new Error('No active chat session');
    }

    const startTime = Date.now();
    this.isProcessing = true;
    this.emit('processingStarted');

    try {
      // Save user message to Airtable
      const userIntent = this.classifyUserIntent(message);
      await aiChatAirtable.saveChatMessage(
        this.currentSession.sessionId,
        MESSAGE_TYPES.USER,
        message,
        userIntent
      );

      // Generate AI response
      const aiResponse = await this.generateAIResponse(message, userIntent);
      const responseTime = Date.now() - startTime;

      // Save AI response to Airtable
      await aiChatAirtable.saveChatMessage(
        this.currentSession.sessionId,
        MESSAGE_TYPES.AI,
        aiResponse,
        userIntent,
        responseTime
      );

      // Generate voice if enabled
      let audioUrl = null;
      if (this.shouldGenerateVoice()) {
        audioUrl = await this.generateVoiceResponse(aiResponse);
      }

      const response = {
        text: aiResponse,
        audioUrl,
        responseTime,
        intent: userIntent
      };

      this.emit('messageProcessed', response);
      return response;

    } catch (error) {
      console.error('Error processing message:', error);
      const errorResponse = {
        text: "I'm sorry, I encountered an error processing your message. Please try again.",
        audioUrl: null,
        responseTime: Date.now() - startTime,
        error: true
      };
      
      this.emit('messageProcessed', errorResponse);
      return errorResponse;
      
    } finally {
      this.isProcessing = false;
      this.emit('processingCompleted');
    }
  }

  classifyUserIntent(message) {
    const lowerMessage = message.toLowerCase();
    
    // Property-related keywords
    if (lowerMessage.includes('property') || lowerMessage.includes('house') || 
        lowerMessage.includes('home') || lowerMessage.includes('listing')) {
      return USER_INTENTS.PROPERTY_QUESTION;
    }
    
    // Process guidance keywords
    if (lowerMessage.includes('how to') || lowerMessage.includes('next step') || 
        lowerMessage.includes('what should') || lowerMessage.includes('guide')) {
      return USER_INTENTS.PROCESS_GUIDANCE;
    }
    
    // Task help keywords
    if (lowerMessage.includes('task') || lowerMessage.includes('complete') || 
        lowerMessage.includes('progress') || lowerMessage.includes('setup')) {
      return USER_INTENTS.TASK_HELP;
    }
    
    // Market info keywords
    if (lowerMessage.includes('market') || lowerMessage.includes('price') || 
        lowerMessage.includes('value') || lowerMessage.includes('sell')) {
      return USER_INTENTS.MARKET_INFO;
    }
    
    return USER_INTENTS.GENERAL;
  }

  async generateAIResponse(message, intent) {
    // Build context-aware prompt
    const context = this.buildContextPrompt();
    const prompt = `${context}\n\nUser: ${message}\n\nAI:`;
    
    // For now, return contextual responses based on intent and user data
    // In production, this would integrate with OpenAI API or similar
    return this.generateContextualResponse(message, intent);
  }

  buildContextPrompt() {
    const { user, property, currentPage, taskStatus } = this.userContext || {};
    
    return `You are AirCasa AI, a helpful real estate assistant. 

Current Context:
- User is on the ${currentPage} page
- Property: ${property?.location || 'Unknown location'}
- Property Type: ${property?.propertyType || 'Unknown'}
- Estimated Value: $${property?.marketValue || 'Unknown'}

Task Completion Status:
- Property Intake: ${taskStatus?.propertyIntake ? 'Complete' : 'Pending'}
- Photos & Media: ${taskStatus?.photosMedia ? 'Complete' : 'Pending'}  
- Agent Consultation: ${taskStatus?.agentConsultation ? 'Complete' : 'Pending'}
${taskStatus?.homeBuyingEnabled ? `- Home Criteria: ${taskStatus?.homeCriteria ? 'Complete' : 'Pending'}
- Personal Financials: ${taskStatus?.personalFinancials ? 'Complete' : 'Pending'}` : ''}

Provide helpful, concise responses about real estate, property selling, and using the AirCasa platform.`;
  }

  generateContextualResponse(message, intent) {
    const { property, taskStatus, currentPage } = this.userContext || {};
    
    // Context-aware responses based on current page and property status
    switch (intent) {
      case USER_INTENTS.PROPERTY_QUESTION:
        if (property) {
          return `I can see you're asking about your property at ${property.location || 'your location'}. ${property.propertyType || 'Your property'} is estimated at $${property.marketValue?.toLocaleString() || 'an unknown value'}. What specific information would you like to know?`;
        }
        return "I'd be happy to help with your property questions. What would you like to know?";
        
      case USER_INTENTS.PROCESS_GUIDANCE:
        if (currentPage === 'dashboard') {
          return "From your dashboard, you can see your property setup progress. The next step is usually to complete any pending tasks like property intake, photos, or agent consultation. Would you like me to guide you through any specific task?";
        }
        return "I can help guide you through the home selling process. What step would you like help with?";
        
      case USER_INTENTS.TASK_HELP:
        const incompleteTasks = [];
        if (taskStatus && !taskStatus.propertyIntake) incompleteTasks.push('Property Intake');
        if (taskStatus && !taskStatus.photosMedia) incompleteTasks.push('Photos & Media');
        if (taskStatus && !taskStatus.agentConsultation) incompleteTasks.push('Agent Consultation');
        
        if (incompleteTasks.length > 0) {
          return `You have ${incompleteTasks.length} pending tasks: ${incompleteTasks.join(', ')}. I recommend starting with ${incompleteTasks[0]}. Would you like me to explain how to complete it?`;
        }
        return "Great job! All your main tasks are complete. You should be ready to list your property on the MLS!";
        
      case USER_INTENTS.MARKET_INFO:
        return "I can help with market information. Based on your property details, the current market conditions favor sellers. Would you like specific pricing guidance or market trends for your area?";
        
      default:
        return "I'm here to help with your real estate questions and guide you through selling your home with AirCasa. What can I assist you with today?";
    }
  }

  /**
   * VOICE PROCESSING
   */

  shouldGenerateVoice() {
    return this.voicePreferences?.auto_play_responses && 
           this.voicePreferences?.preferred_voice_mode !== AI_CHAT_CONFIG.VOICE_MODES.TEXT_ONLY;
  }

  async generateVoiceResponse(text) {
    try {
      // Try ElevenLabs first (if configured)
      if (AI_CHAT_CONFIG.ELEVENLABS.API_KEY) {
        const audioUrl = await voiceService.generateElevenLabsAudio(
          text, 
          AI_CHAT_CONFIG.ELEVENLABS.VOICE_ID
        );
        if (audioUrl) {
          return audioUrl;
        }
      }

      // Fallback to browser speech synthesis
      if (voiceService.isSpeechSynthesisSupported() && this.shouldGenerateVoice()) {
        // Use browser TTS as fallback - speak directly
        await voiceService.speak(text, {
          rate: this.voicePreferences?.voice_speed || 1.0,
          volume: 1.0
        });
        
        return 'browser_tts'; // Special indicator for browser TTS
      }
      
      return null;
      
    } catch (error) {
      console.error('Voice generation failed:', error);
      return null;
    }
  }

  async startListening() {
    try {
      // Set up voice service event handlers
      voiceService.onTranscript = (transcript) => {
        console.log('🎤 Voice transcript received:', transcript);
        this.processUserMessage(transcript, 'voice');
      };

      voiceService.onListeningStart = () => {
        this.isListening = true;
        this.emit('listeningStarted');
      };

      voiceService.onListeningEnd = () => {
        this.isListening = false;
        this.emit('listeningStopped');
      };

      voiceService.onError = (error) => {
        this.isListening = false;
        this.emit('listeningError', error);
      };

      await voiceService.startListening();
      
    } catch (error) {
      console.error('Failed to start listening:', error);
      throw error;
    }
  }

  stopListening() {
    voiceService.stopListening();
  }

  stopSpeaking() {
    // Stop browser speech synthesis
    voiceService.stopSpeaking();
    
    // Stop any playing audio elements
    const audioElements = document.querySelectorAll('audio[data-aichat]');
    audioElements.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  }

  /**
   * WELCOME MESSAGE
   */

  async sendWelcomeMessage() {
    const welcomeText = this.generateWelcomeMessage();
    
    await aiChatAirtable.saveChatMessage(
      this.currentSession.sessionId,
      MESSAGE_TYPES.AI,
      welcomeText,
      USER_INTENTS.GENERAL
    );

    this.emit('messageReceived', {
      text: welcomeText,
      type: MESSAGE_TYPES.AI,
      timestamp: new Date().toISOString()
    });
  }

  generateWelcomeMessage() {
    const { property, currentPage } = this.userContext || {};
    
    let contextMessage = '';
    if (currentPage === 'dashboard') {
      contextMessage = " I can see you're on your dashboard - I'm here to help with your property setup progress.";
    } else if (currentPage === 'property_details') {
      contextMessage = " I can help you with your property tasks and answer any questions.";
    }
    
    return `👋 Hi! I'm your AirCasa AI assistant.${contextMessage} How can I help you today?`;
  }

  /**
   * EVENT SYSTEM
   */

  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const callbacks = this.eventListeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Event callback error:', error);
        }
      });
    }
  }

  /**
   * UTILITY METHODS
   */

  isSessionActive() {
    return !!this.currentSession;
  }

  getCurrentSession() {
    return this.currentSession;
  }

  getUserContext() {
    return this.userContext;
  }
}

// Create singleton instance
const aiChatService = new AiChatService();
export default aiChatService;