/**
 * AirCasa aiChat Service
 * Handles AI processing, ElevenLabs integration, and chat orchestration
 */

import { AI_CHAT_CONFIG, MESSAGE_TYPES, USER_INTENTS, WIDGET_STATES } from '@/config/aiChatConfig';
import aiChatAirtable from './aiChatAirtable';
import aiChatMainAirtable from './aiChatMainAirtable';
import voiceService from './voiceService';
import openAiService from './openAiService';
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
      console.log('📊 Loading user context from both Airtable bases...', { userId, propertyId });
      
      // Load data from both sources in parallel for better performance
      const [propertyData, userData, userProperties] = await Promise.allSettled([
        // Try main Airtable base first, then fallback to API functions
        this.getPropertyData(propertyId),
        this.getUserData(userId),
        aiChatMainAirtable.getUserProperties(userId)
      ]);
      
      this.userContext = {
        user: userData.status === 'fulfilled' ? userData.value : { id: userId, email: userId },
        property: propertyData.status === 'fulfilled' ? propertyData.value : { id: propertyId },
        userProperties: userProperties.status === 'fulfilled' ? userProperties.value : [],
        currentPage: this.getCurrentPageContext(),
        taskStatus: this.getTaskCompletionStatus(propertyData.status === 'fulfilled' ? propertyData.value : null)
      };
      
      console.log('✅ Enhanced user context loaded:', {
        hasUser: !!this.userContext.user.email,
        hasProperty: !!this.userContext.property.location,
        propertyCount: this.userContext.userProperties.length,
        currentPage: this.userContext.currentPage
      });
      
    } catch (error) {
      console.error('Error loading user context:', error);
      this.userContext = { 
        user: { id: userId, email: userId }, 
        property: { id: propertyId },
        userProperties: [],
        currentPage: this.getCurrentPageContext(),
        taskStatus: {}
      };
    }
  }

  async getPropertyData(propertyId) {
    try {
      // Try main Airtable base first
      const propertyData = await aiChatMainAirtable.getProperty(propertyId);
      if (propertyData && !propertyData.error) {
        return propertyData;
      }
    } catch (error) {
      console.log('Main Airtable property fetch failed, trying API functions:', error.message);
    }

    try {
      // Fallback to existing API functions
      const propertyData = await properties.get(propertyId);
      return propertyData;
    } catch (error) {
      console.log('API functions property fetch failed:', error.message);
      return { id: propertyId, location: 'Property data unavailable' };
    }
  }

  async getUserData(userId) {
    try {
      // Try main Airtable base first
      const userData = await aiChatMainAirtable.getUser(userId);
      if (userData && !userData.error) {
        return userData;
      }
    } catch (error) {
      console.log('Main Airtable user fetch failed, trying API functions:', error.message);
    }

    try {
      // Fallback to existing API functions
      const userData = await users.getById(userId);
      return userData;
    } catch (error) {
      console.log('API functions user fetch failed:', error.message);
      return { id: userId, email: userId, name: 'User' };
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
    try {
      // Check if OpenAI is available and use it for intelligent responses
      if (openAiService.isApiAvailable()) {
        console.log('🧠 Using OpenAI for intelligent response generation with enhanced context');
        
        // Format chat history for OpenAI
        const chatHistory = await this.getChatHistory();
        const formattedMessages = openAiService.formatMessages(chatHistory);
        
        // Add current message
        formattedMessages.push({ role: 'user', content: message });
        
        // Enhance context with additional data
        const enhancedContext = {
          ...this.userContext,
          intent: intent,
          currentTime: new Date().toISOString(),
          userProperties: this.userContext.userProperties || [],
          chatHistoryLength: formattedMessages.length - 1 // Exclude current message
        };
        
        // Generate response with full context awareness
        const response = await openAiService.generateResponse(formattedMessages, enhancedContext);
        
        // Log performance metrics
        console.log('✅ OpenAI response generated successfully with enhanced context');
        return response;
        
      } else {
        console.log('💭 OpenAI not available, using enhanced contextual responses');
        // Fallback to enhanced contextual responses when OpenAI is not available
        return this.generateEnhancedContextualResponse(message, intent);
      }
      
    } catch (error) {
      console.error('❌ Error in AI response generation:', error);
      // Always fallback to contextual responses on error
      return this.generateEnhancedContextualResponse(message, intent);
    }
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

  generateEnhancedContextualResponse(message, intent) {
    const { user, property, userProperties, taskStatus, currentPage } = this.userContext || {};
    
    // Enhanced context-aware responses with more detailed information
    switch (intent) {
      case USER_INTENTS.PROPERTY_QUESTION:
        if (property && property.location !== 'Property data unavailable') {
          let response = `I can help with your property at ${property.location}. `;
          if (property.propertyType) response += `This ${property.propertyType.toLowerCase()} `;
          if (property.marketValue) response += `is valued at $${property.marketValue.toLocaleString()}. `;
          if (property.bedrooms && property.bathrooms) {
            response += `It has ${property.bedrooms} bedrooms and ${property.bathrooms} bathrooms. `;
          }
          response += "What specific information would you like to know?";
          return response;
        }
        if (userProperties && userProperties.length > 0) {
          return `I see you have ${userProperties.length} property(ies) in the system. Which property would you like to discuss, or would you like an overview of all your properties?`;
        }
        return "I'd be happy to help with property questions. What would you like to know?";
        
      case USER_INTENTS.PROCESS_GUIDANCE:
        if (currentPage === 'dashboard' && userProperties && userProperties.length > 0) {
          return `From your dashboard, I can see you have ${userProperties.length} property(ies). The next steps typically involve completing property intake, scheduling photos, and arranging agent consultation. Which property would you like to focus on?`;
        }
        return "I can guide you through the home selling process step by step. What aspect would you like help with?";
        
      case USER_INTENTS.TASK_HELP:
        const incompleteTasks = [];
        if (taskStatus) {
          if (!taskStatus.propertyIntake) incompleteTasks.push('Property Intake');
          if (!taskStatus.photosMedia) incompleteTasks.push('Photos & Media');
          if (!taskStatus.agentConsultation) incompleteTasks.push('Agent Consultation');
          if (taskStatus.homeBuyingEnabled && !taskStatus.homeCriteria) incompleteTasks.push('Home Criteria');
          if (taskStatus.homeBuyingEnabled && !taskStatus.personalFinancials) incompleteTasks.push('Personal Financials');
        }
        
        if (incompleteTasks.length > 0) {
          return `You have ${incompleteTasks.length} pending tasks: ${incompleteTasks.join(', ')}. I recommend starting with ${incompleteTasks[0]}. Would you like detailed guidance on completing it?`;
        }
        return "Excellent! All your main tasks are complete. Your property should be ready for MLS listing. Would you like help with the next steps?";
        
      case USER_INTENTS.MARKET_INFO:
        let marketResponse = "I can provide market insights for your area. ";
        if (property && property.location && property.location !== 'Property data unavailable') {
          marketResponse += `Based on your property location at ${property.location}, `;
        }
        marketResponse += "current market conditions are generally favorable for sellers. Would you like specific pricing strategies or local market trends?";
        return marketResponse;
        
      default:
        let greeting = user && user.name && user.name !== 'User' ? `Hi ${user.name}! ` : "Hello! ";
        greeting += "I'm your AirCasa AI assistant with premium features including OpenAI intelligence and ElevenLabs voice synthesis. ";
        if (userProperties && userProperties.length > 0) {
          greeting += `I can help with your ${userProperties.length} property(ies) and guide you through the selling process. `;
        }
        greeting += "How can I assist you today?";
        return greeting;
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
      if (!this.shouldGenerateVoice()) {
        console.log('🔇 Voice generation skipped - not enabled');
        return null;
      }

      console.log('🔊 Generating premium voice response with ElevenLabs/Browser TTS fallback');
      console.log('📝 Text length:', text.length, 'characters');

      // Enhanced voice options with premium settings
      const voiceOptions = {
        voiceId: this.voicePreferences?.preferred_voice_id || AI_CHAT_CONFIG.ELEVENLABS.VOICE_ID,
        rate: this.voicePreferences?.voice_speed || 1.0,
        volume: 1.0,
        // ElevenLabs specific settings
        stability: this.voicePreferences?.voice_stability || AI_CHAT_CONFIG.ELEVENLABS.DEFAULT_VOICE_SETTINGS.stability,
        similarity_boost: this.voicePreferences?.voice_clarity || AI_CHAT_CONFIG.ELEVENLABS.DEFAULT_VOICE_SETTINGS.similarity_boost,
        style: this.voicePreferences?.voice_style || AI_CHAT_CONFIG.ELEVENLABS.DEFAULT_VOICE_SETTINGS.style,
        use_speaker_boost: AI_CHAT_CONFIG.ELEVENLABS.DEFAULT_VOICE_SETTINGS.use_speaker_boost
      };

      // Start voice generation (async - don't wait for completion)
      const success = await voiceService.generateAndPlayVoice(text, voiceOptions);
      
      if (success) {
        console.log('✅ Premium voice response initiated successfully');
        return 'premium_voice_generated';
      } else {
        console.log('⚠️ Voice generation failed, no audio available');
        return null;
      }
      
    } catch (error) {
      console.error('❌ Voice generation error:', error);
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
    const { user, property, userProperties, currentPage } = this.userContext || {};
    const hasOpenAI = import.meta.env.VITE_OPENAI_API_KEY;
    const hasElevenLabs = AI_CHAT_CONFIG.ELEVENLABS.API_KEY;
    
    let greeting = user && user.name && user.name !== 'User' ? `👋 Hi ${user.name}!` : "👋 Hello!";
    
    let welcomeMessage = `${greeting} I'm your premium AirCasa AI assistant with advanced capabilities:\n\n`;
    
    // Premium features status
    welcomeMessage += `🧠 ${hasOpenAI ? 'OpenAI GPT Intelligence' : 'Smart Contextual Responses'}\n`;
    welcomeMessage += `🎵 ${hasElevenLabs ? 'ElevenLabs Premium Voice' : 'Browser Voice Synthesis'}\n`;
    welcomeMessage += `📊 Dual Airtable Integration for complete context\n`;
    welcomeMessage += `🎤 Three Voice Modes: Always Listening, Click-to-Talk, Text Only\n\n`;
    
    // Context-specific information
    if (currentPage === 'dashboard') {
      welcomeMessage += "I can see you're on your dashboard. ";
      if (userProperties && userProperties.length > 0) {
        welcomeMessage += `I have access to your ${userProperties.length} property(ies) and can help with setup progress.`;
      } else {
        welcomeMessage += "I'm ready to help with your property setup and progress tracking.";
      }
    } else if (currentPage === 'property_details' && property && property.location !== 'Property data unavailable') {
      welcomeMessage += `I can help with your property at ${property.location}. `;
      if (property.marketValue) {
        welcomeMessage += `This ${property.propertyType || 'property'} valued at $${property.marketValue.toLocaleString()} `;
      }
      welcomeMessage += "is ready for my assistance with tasks and guidance.";
    } else {
      welcomeMessage += "I'm here to help with property questions, market insights, process guidance, and platform assistance.";
    }
    
    welcomeMessage += "\n\nWhat would you like to know about your real estate journey?";
    
    return welcomeMessage;
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
   * CHAT HISTORY
   */

  async getChatHistory() {
    if (!this.currentSession) {
      return [];
    }

    try {
      // Get recent messages from current session
      const messages = await aiChatAirtable.getSessionMessages(this.currentSession.sessionId, 10); // Last 10 messages
      return messages || [];
    } catch (error) {
      console.error('Error fetching chat history:', error);
      return [];
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

  /**
   * API KEY MANAGEMENT
   */

  setOpenAiApiKey(apiKey) {
    openAiService.setApiKey(apiKey);
    console.log('🔑 OpenAI API key configured');
  }

  setElevenLabsApiKey(apiKey) {
    // Update ElevenLabs configuration
    AI_CHAT_CONFIG.ELEVENLABS.API_KEY = apiKey;
    console.log('🔑 ElevenLabs API key configured');
  }
}

// Create singleton instance
const aiChatService = new AiChatService();
export default aiChatService;