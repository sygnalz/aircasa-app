/**
 * AirCasa aiChat Configuration
 * Separate configuration for the AI Chat feature with its own Airtable base
 */

// aiChat Airtable Base Configuration
export const AI_CHAT_CONFIG = {
  // Separate Airtable base for aiChat functionality
  BASE_ID: 'appTeT9BZr8gzt7fL',
  API_KEY: 'patUKilQrjCLdlg3R.363c56f2d93a55b041f8b9548162434fe4c73ba83b74ab78affb9832602e12de',
  
  // Main AirCasa Airtable base for property data access
  MAIN_AIRCASA_BASE: {
    BASE_ID: import.meta.env.VITE_AIRTABLE_BASE_ID || 'appPEvLMTmfiUZw14',
    API_KEY: import.meta.env.VITE_AIRTABLE_API_KEY || 'patdhA1oeVPghOiE4.77ed2348b1bc5c4e826ffee2e704ef6eb5be6c2549a3068f57818ef42030cebe',
    TABLES: {
      PROPERTIES: import.meta.env.VITE_AIRTABLE_PROPERTIES_TABLE || 'Properties',
      USERS: import.meta.env.VITE_AIRTABLE_USERS_TABLE || 'Users',
      CONVERSATIONS: import.meta.env.VITE_AIRTABLE_CONVERSATIONS_TABLE || 'Conversations'
    }
  },
  
  // Table names in aiChat base
  TABLES: {
    CHAT_SESSIONS: 'Chat Sessions',
    CHAT_MESSAGES: 'Chat Messages',
    USER_VOICE_PREFERENCES: 'User Voice Preferences',
    AI_KNOWLEDGE_BASE: 'AI Knowledge Base',
    SYSTEM_PERFORMANCE: 'System Performance'
  },

  // Voice mode options
  VOICE_MODES: {
    ALWAYS_LISTENING: 'Always Listening',
    CLICK_TO_TALK: 'Click-to-Talk',
    TEXT_ONLY: 'Text Only'
  },

  // Performance targets
  PERFORMANCE: {
    TARGET_RESPONSE_TIME_MS: 700,
    CACHE_RESPONSE_TIME_MS: 20,
    MAX_SESSION_DURATION_MINUTES: 30
  },

  // WebSocket configuration
  WEBSOCKET: {
    URL: import.meta.env.MODE === 'production' 
      ? 'wss://your-production-websocket-url' 
      : 'ws://localhost:8080',
    RECONNECT_ATTEMPTS: 5,
    RECONNECT_DELAY_MS: 3000
  },

  // ElevenLabs configuration
  ELEVENLABS: {
    API_KEY: import.meta.env.VITE_ELEVENLABS_API_KEY || '',
    VOICE_ID: 'pNInz6obpgDQGcFmaJgB', // Default voice
    MODEL_ID: 'eleven_monolingual_v1',
    DEFAULT_VOICE_SETTINGS: {
      stability: 0.5,
      similarity_boost: 0.5,
      style: 0.0,
      use_speaker_boost: true
    }
  }
};

// Message types
export const MESSAGE_TYPES = {
  USER: 'User',
  AI: 'AI',
  SYSTEM: 'System'
};

// User intents for message classification
export const USER_INTENTS = {
  PROPERTY_QUESTION: 'Property Question',
  PROCESS_GUIDANCE: 'Process Guidance',
  MARKET_INFO: 'Market Info',
  TASK_HELP: 'Task Help',
  GENERAL: 'General'
};

// Chat widget states
export const WIDGET_STATES = {
  MINIMIZED: 'minimized',
  EXPANDED: 'expanded',
  LISTENING: 'listening',
  PROCESSING: 'processing',
  SPEAKING: 'speaking'
};

export default AI_CHAT_CONFIG;