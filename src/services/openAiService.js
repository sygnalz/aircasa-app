/**
 * OpenAI Service for AirCasa aiChat
 * Handles AI response generation using OpenAI API
 */

class OpenAiService {
  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    this.baseUrl = 'https://api.openai.com/v1';
    this.model = 'gpt-3.5-turbo';
    this.isAvailable = !!this.apiKey;
  }

  /**
   * Generate AI response using OpenAI
   */
  async generateResponse(messages, context = {}) {
    if (!this.isAvailable) {
      console.log('OpenAI API key not available, using fallback responses');
      return this.getFallbackResponse(messages[messages.length - 1]?.content || '');
    }

    try {
      const systemPrompt = this.buildSystemPrompt(context);
      const formattedMessages = [
        { role: 'system', content: systemPrompt },
        ...messages
      ];

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: formattedMessages,
          max_tokens: 500,
          temperature: 0.7,
          presence_penalty: 0.1,
          frequency_penalty: 0.1
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'I apologize, but I encountered an issue generating a response.';

    } catch (error) {
      console.error('OpenAI API error:', error);
      // Fallback to simple responses
      return this.getFallbackResponse(messages[messages.length - 1]?.content || '');
    }
  }

  /**
   * Build system prompt with context
   */
  buildSystemPrompt(context) {
    const { user, property, userProperties, currentPage, taskStatus, intent, chatHistoryLength } = context;
    
    let systemPrompt = `You are AirCasa AI, a sophisticated real estate assistant powered by OpenAI with premium ElevenLabs voice capabilities. You specialize in helping people sell their homes through the AirCasa platform and have access to comprehensive user and property data.

CORE CAPABILITIES:
- Real-time property analysis and market insights
- Step-by-step guidance through the home selling process
- Personalized recommendations based on user's specific situation
- Voice interaction with Always Listening, Click-to-Talk, and premium voice synthesis
- Access to multiple property data sources and user context

RESPONSE GUIDELINES:
- Be conversational, knowledgeable, and encouraging
- Provide specific, actionable advice tailored to the user's situation
- Reference actual property data and user progress when available
- Keep responses focused and practical (2-4 sentences typically)
- Use a warm, professional tone that builds confidence
- Prioritize next steps and immediate value

CURRENT SESSION CONTEXT:`;

    if (user && user.name && user.name !== 'User') {
      systemPrompt += `\n- User: ${user.name} (${user.email || user.id})`;
      if (user.role) systemPrompt += ` - Role: ${user.role}`;
    }

    if (currentPage) {
      systemPrompt += `\n- Current Page: ${currentPage}`;
    }

    if (chatHistoryLength !== undefined) {
      systemPrompt += `\n- Conversation Length: ${chatHistoryLength} previous messages`;
    }

    if (intent) {
      systemPrompt += `\n- User Intent: ${intent}`;
    }

    if (property && property.location !== 'Property data unavailable') {
      systemPrompt += `\n\nPRIMARY PROPERTY:`;
      systemPrompt += `\n- Location: ${property.location || 'Unknown'}`;
      systemPrompt += `\n- Type: ${property.propertyType || 'Unknown'}`;
      if (property.marketValue) {
        systemPrompt += `\n- Market Value: $${property.marketValue.toLocaleString()}`;
      }
      if (property.bedrooms && property.bathrooms) {
        systemPrompt += `\n- Layout: ${property.bedrooms} bed, ${property.bathrooms} bath`;
      }
      if (property.squareFootage) {
        systemPrompt += `\n- Size: ${property.squareFootage.toLocaleString()} sq ft`;
      }
    }

    if (userProperties && userProperties.length > 1) {
      systemPrompt += `\n\nADDITIONAL PROPERTIES: User has ${userProperties.length - 1} other properties in the system`;
    }

    if (taskStatus) {
      const incompleteTasks = [];
      const completedTasks = [];
      
      if (taskStatus.propertyIntake) completedTasks.push('Property Intake');
      else incompleteTasks.push('Property Intake');
      
      if (taskStatus.photosMedia) completedTasks.push('Photos & Media');
      else incompleteTasks.push('Photos & Media');
      
      if (taskStatus.agentConsultation) completedTasks.push('Agent Consultation');
      else incompleteTasks.push('Agent Consultation');
      
      if (taskStatus.homeBuyingEnabled) {
        if (taskStatus.homeCriteria) completedTasks.push('Home Criteria');
        else incompleteTasks.push('Home Criteria');
        
        if (taskStatus.personalFinancials) completedTasks.push('Personal Financials');
        else incompleteTasks.push('Personal Financials');
      }

      systemPrompt += `\n\nTASK STATUS:`;
      if (completedTasks.length > 0) {
        systemPrompt += `\n- Completed: ${completedTasks.join(', ')}`;
      }
      if (incompleteTasks.length > 0) {
        systemPrompt += `\n- Pending: ${incompleteTasks.join(', ')}`;
        systemPrompt += `\n- Next Priority: ${incompleteTasks[0]}`;
      } else {
        systemPrompt += `\n- Status: All tasks completed! Ready for MLS listing`;
      }
    }

    systemPrompt += `\n\nINSTRUCTIONS: Respond helpfully and naturally based on this comprehensive context. Reference specific details when relevant, provide actionable guidance, and maintain a supportive tone that builds user confidence in their home selling journey.`;

    return systemPrompt;
  }

  /**
   * Fallback responses when OpenAI is not available
   */
  getFallbackResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    
    // Property-related questions
    if (lowerMessage.includes('property') || lowerMessage.includes('house') || lowerMessage.includes('home')) {
      return "I can help you with property-related questions! I have access to your property information and can guide you through the selling process. What specific aspect would you like to discuss?";
    }
    
    // Task and progress questions
    if (lowerMessage.includes('task') || lowerMessage.includes('progress') || lowerMessage.includes('complete') || lowerMessage.includes('next step')) {
      return "I can help you track your property setup progress! Check your Property Setup Progress panel to see which tasks need attention. Would you like me to guide you through completing any specific task?";
    }
    
    // Market and pricing questions
    if (lowerMessage.includes('market') || lowerMessage.includes('price') || lowerMessage.includes('value') || lowerMessage.includes('sell')) {
      return "I can provide guidance on market conditions and pricing strategies. Based on your property information, I can help you understand the current market and next steps for listing. What would you like to know?";
    }
    
    // Process guidance
    if (lowerMessage.includes('how') || lowerMessage.includes('guide') || lowerMessage.includes('help')) {
      return "I'm here to guide you through the entire home selling process! From completing your property setup to listing on the MLS, I can provide step-by-step assistance. What part of the process would you like help with?";
    }
    
    // Greetings
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return "Hello! I'm your AirCasa AI assistant, here to help you sell your home successfully. I can guide you through property tasks, answer market questions, and provide personalized advice. How can I help you today?";
    }
    
    // Default response
    return "I'm your AirCasa AI assistant! I can help with property setup tasks, market insights, pricing guidance, and step-by-step selling advice. What would you like to know about your home selling journey?";
  }

  /**
   * Convert chat messages to OpenAI format
   */
  formatMessages(chatHistory) {
    return chatHistory.map(msg => ({
      role: msg.type === 'USER' ? 'user' : 'assistant',
      content: msg.text
    }));
  }

  /**
   * Check if OpenAI is available
   */
  isApiAvailable() {
    return this.isAvailable;
  }

  /**
   * Set API key (for when user provides it)
   */
  setApiKey(apiKey) {
    this.apiKey = apiKey;
    this.isAvailable = !!apiKey;
  }
}

// Create singleton instance
const openAiService = new OpenAiService();
export default openAiService;