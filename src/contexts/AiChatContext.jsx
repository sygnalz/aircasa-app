import React, { createContext, useContext, useState, useEffect } from 'react';
import { AI_CHAT_CONFIG } from '@/config/aiChatConfig';
import aiChatService from '@/services/aiChatService';

const AiChatContext = createContext({});

export const useAiChat = () => {
  const context = useContext(AiChatContext);
  if (!context) {
    throw new Error('useAiChat must be used within an AiChatProvider');
  }
  return context;
};

export const AiChatProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    initializeAiChat();
  }, []);

  const initializeAiChat = async () => {
    try {
      console.log('🤖 Initializing AirCasa aiChat...');
      
      // Set up service event listeners
      aiChatService.on('sessionStarted', (session) => {
        setCurrentSession(session);
        setIsConnected(true);
        console.log('✅ aiChat session started:', session.sessionId);
      });

      aiChatService.on('sessionEnded', () => {
        setCurrentSession(null);
        setIsConnected(false);
        console.log('🔚 aiChat session ended');
      });

      aiChatService.on('error', (error) => {
        setError(error);
        console.error('❌ aiChat error:', error);
      });

      setIsInitialized(true);
      console.log('🚀 AirCasa aiChat initialized successfully');

    } catch (error) {
      console.error('Failed to initialize aiChat:', error);
      setError(error.message);
    }
  };

  const startSession = async (userId, propertyId, voiceMode) => {
    try {
      setError(null);
      const session = await aiChatService.startChatSession(userId, propertyId, voiceMode);
      return session;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const endSession = async () => {
    try {
      await aiChatService.endChatSession();
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const value = {
    // State
    isInitialized,
    currentSession,
    isConnected,
    error,

    // Actions
    startSession,
    endSession,

    // Service access
    aiChatService
  };

  return (
    <AiChatContext.Provider value={value}>
      {children}
    </AiChatContext.Provider>
  );
};

export default AiChatContext;