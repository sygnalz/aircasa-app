import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  X, 
  Minimize2, 
  Mic, 
  MicOff, 
  Send, 
  Settings, 
  Volume2, 
  VolumeX,
  Loader2,
  User,
  Bot,
  AlertTriangle
} from 'lucide-react';
import { AI_CHAT_CONFIG, WIDGET_STATES, MESSAGE_TYPES } from '@/config/aiChatConfig';
import { useAuth } from '@/contexts/AuthContext';

const AiChatWidget = () => {
  // State management
  const [widgetState, setWidgetState] = useState(WIDGET_STATES.MINIMIZED);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [voiceMode, setVoiceMode] = useState(AI_CHAT_CONFIG.VOICE_MODES.TEXT_ONLY);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Auth context
  const { user } = useAuth();

  // Initialize chat service with error handling
  useEffect(() => {
    const initializeWithErrorHandling = async () => {
      if (!user) return;
      
      try {
        // Import aiChatService only when needed to avoid initialization errors
        const { default: aiChatService } = await import('@/services/aiChatService');
        
        // Set up event listeners
        aiChatService.on('messageReceived', handleMessageReceived);
        aiChatService.on('messageProcessed', handleMessageProcessed);
        aiChatService.on('processingStarted', () => setIsProcessing(true));
        aiChatService.on('processingCompleted', () => setIsProcessing(false));
        aiChatService.on('listeningStarted', () => setIsListening(true));
        aiChatService.on('listeningStopped', () => setIsListening(false));

        await initializeChat(aiChatService);
        setIsInitialized(true);
        
      } catch (error) {
        console.error('Failed to initialize aiChat:', error);
        setHasError(true);
      }
    };

    initializeWithErrorHandling();
  }, [user]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = async (aiChatService) => {
    if (!user || !aiChatService) return;

    try {
      const propertyId = getCurrentPropertyId();
      const userId = user.id || user.email;
      
      if (!aiChatService.isSessionActive()) {
        await aiChatService.startChatSession(userId, propertyId, voiceMode);
      }
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      setHasError(true);
    }
  };

  const getCurrentPropertyId = () => {
    // Extract property ID from current route if on property page
    const path = window.location.pathname;
    const propertyMatch = path.match(/\/property\/([^\/]+)/);
    return propertyMatch ? propertyMatch[1] : 'dashboard';
  };

  const handleMessageReceived = (message) => {
    setMessages(prev => [...prev, {
      id: `msg_${Date.now()}`,
      type: MESSAGE_TYPES.AI,
      text: message.text,
      timestamp: message.timestamp || new Date().toISOString(),
      audioUrl: message.audioUrl
    }]);
  };

  const handleMessageProcessed = (response) => {
    setMessages(prev => [...prev, {
      id: `msg_${Date.now()}`,
      type: MESSAGE_TYPES.AI,
      text: response.text,
      timestamp: new Date().toISOString(),
      audioUrl: response.audioUrl,
      responseTime: response.responseTime
    }]);

    // Auto-play audio if enabled
    if (response.audioUrl && audioEnabled) {
      playAudioResponse(response.audioUrl);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleWidget = () => {
    if (widgetState === WIDGET_STATES.MINIMIZED) {
      setWidgetState(WIDGET_STATES.EXPANDED);
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setWidgetState(WIDGET_STATES.MINIMIZED);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isProcessing || !isInitialized) return;

    const userMessage = {
      id: `msg_${Date.now()}`,
      type: MESSAGE_TYPES.USER,
      text: inputMessage.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    try {
      const { default: aiChatService } = await import('@/services/aiChatService');
      await aiChatService.processUserMessage(userMessage.text);
    } catch (error) {
      console.error('Failed to process message:', error);
      setMessages(prev => [...prev, {
        id: `msg_${Date.now()}_error`,
        type: MESSAGE_TYPES.AI,
        text: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date().toISOString(),
        error: true
      }]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleVoiceListening = async () => {
    if (!isInitialized) return;
    
    try {
      const { default: aiChatService } = await import('@/services/aiChatService');
      
      if (isListening) {
        aiChatService.stopListening();
      } else {
        try {
          await aiChatService.startListening();
        } catch (error) {
          alert('Microphone access required for voice features');
        }
      }
    } catch (error) {
      console.error('Voice service error:', error);
    }
  };

  const playAudioResponse = (audioUrl) => {
    if (audioUrl === 'browser_tts') {
      // Browser TTS was already played during generation
      console.log('🔊 Browser TTS already played');
      return;
    }
    
    if (audioUrl && audioUrl.startsWith('data:audio/')) {
      // Handle actual audio URL
      const audio = new Audio(audioUrl);
      audio.dataset.aichat = 'true';
      audio.play().catch(error => {
        console.error('Audio playback failed:', error);
      });
    } else {
      console.log('🔊 No audio to play:', audioUrl);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderMessage = (message) => (
    <div
      key={message.id}
      className={`flex gap-3 mb-4 ${
        message.type === MESSAGE_TYPES.USER ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        message.type === MESSAGE_TYPES.USER 
          ? 'bg-blue-600 text-white' 
          : 'bg-green-600 text-white'
      }`}>
        {message.type === MESSAGE_TYPES.USER ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>

      {/* Message bubble */}
      <div className={`max-w-[80%] ${
        message.type === MESSAGE_TYPES.USER ? 'items-end' : 'items-start'
      } flex flex-col`}>
        <div className={`px-4 py-2 rounded-2xl ${
          message.type === MESSAGE_TYPES.USER
            ? 'bg-blue-600 text-white rounded-br-md'
            : message.error
            ? 'bg-red-100 text-red-800 border border-red-200 rounded-bl-md'
            : 'bg-gray-100 text-gray-900 rounded-bl-md'
        }`}>
          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
          
          {/* Audio playback button */}
          {message.audioUrl && (
            <button
              onClick={() => playAudioResponse(message.audioUrl)}
              className="mt-2 flex items-center gap-1 text-xs opacity-75 hover:opacity-100"
            >
              <Volume2 className="h-3 w-3" />
              Play
            </button>
          )}
        </div>
        
        <span className="text-xs text-gray-500 mt-1">
          {formatTimestamp(message.timestamp)}
          {message.responseTime && (
            <span className="ml-2">({message.responseTime}ms)</span>
          )}
        </span>
      </div>
    </div>
  );

  const renderVoiceSettings = () => (
    <div className="p-4 border-t bg-gray-50">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Voice Mode</span>
          <select
            value={voiceMode}
            onChange={(e) => setVoiceMode(e.target.value)}
            className="text-xs border rounded px-2 py-1"
          >
            <option value={AI_CHAT_CONFIG.VOICE_MODES.TEXT_ONLY}>Text Only</option>
            <option value={AI_CHAT_CONFIG.VOICE_MODES.CLICK_TO_TALK}>Click to Talk</option>
            <option value={AI_CHAT_CONFIG.VOICE_MODES.ALWAYS_LISTENING}>Always Listening</option>
          </select>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Auto-play Responses</span>
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`w-10 h-6 rounded-full transition-colors ${
              audioEnabled ? 'bg-green-600' : 'bg-gray-300'
            } relative`}
          >
            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
              audioEnabled ? 'translate-x-5' : 'translate-x-1'
            }`} />
          </button>
        </div>
      </div>
    </div>
  );

  // Don't render if there's an error or not initialized
  if (hasError) {
    return null; // Silently fail to avoid breaking the main app
  }

  // Minimized state
  if (widgetState === WIDGET_STATES.MINIMIZED) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleWidget}
          className={`w-14 h-14 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group ${
            isInitialized ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
          }`}
          disabled={!isInitialized}
        >
          {!isInitialized ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <MessageCircle className="h-6 w-6" />
          )}
          {isProcessing && isInitialized && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse" />
          )}
        </button>
      </div>
    );
  }

  // Expanded state
  return (
    <div className="fixed bottom-6 right-6 w-80 h-96 z-50">
      <Card className="h-full flex flex-col shadow-2xl border-0 bg-white">
        {/* Header */}
        <CardHeader className="bg-blue-600 text-white p-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <CardTitle className="text-sm font-medium">AirCasa AI Assistant</CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-1 hover:bg-blue-700 rounded transition-colors"
              >
                <Settings className="h-4 w-4" />
              </button>
              <button
                onClick={toggleWidget}
                className="p-1 hover:bg-blue-700 rounded transition-colors"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Status indicators */}
          <div className="flex items-center gap-2 mt-2">
            {isListening && (
              <Badge variant="secondary" className="text-xs bg-green-500 text-white">
                <Mic className="h-3 w-3 mr-1" />
                Listening
              </Badge>
            )}
            {isProcessing && (
              <Badge variant="secondary" className="text-xs bg-orange-500 text-white">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Processing
              </Badge>
            )}
          </div>
        </CardHeader>

        {/* Settings panel */}
        {showSettings && renderVoiceSettings()}

        {/* Messages area */}
        <CardContent className="flex-1 overflow-y-auto p-4 bg-white" ref={chatContainerRef}>
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Bot className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p className="text-sm">Start a conversation with your AI assistant!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map(renderMessage)}
              <div ref={messagesEndRef} />
            </div>
          )}
        </CardContent>

        {/* Input area */}
        <div className="p-4 border-t bg-gray-50 rounded-b-lg">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="w-full px-3 py-2 border rounded-lg resize-none text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="1"
                disabled={isProcessing}
              />
            </div>
            
            {/* Voice button */}
            {voiceMode !== AI_CHAT_CONFIG.VOICE_MODES.TEXT_ONLY && (
              <button
                onClick={toggleVoiceListening}
                disabled={isProcessing}
                className={`p-2 rounded-lg transition-colors ${
                  isListening 
                    ? 'bg-red-500 text-white' 
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                } disabled:opacity-50`}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
            )}
            
            {/* Send button */}
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isProcessing}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AiChatWidget;