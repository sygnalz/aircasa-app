import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-anon-key';

// Demo mode flag
const isDemoMode = !import.meta.env.VITE_SUPABASE_URL || supabaseUrl === 'https://demo.supabase.co';

if (isDemoMode) {
  console.log('🎬 Running in DEMO mode - authentication will be simulated');
}

// Create a demo-friendly Supabase client
let supabase;

if (isDemoMode) {
  console.log('🎬 Creating demo Supabase client...');
  // Create a mock supabase client for demo purposes
  const demoSession = {
    user: {
      id: 'demo-user-123',
      email: 'demo@aircasa.com',
      role: 'authenticated',
      user_metadata: {
        full_name: 'Demo User',
        avatar_url: null
      }
    },
    access_token: 'demo-token-123'
  };

  supabase = {
    auth: {
      getSession: async () => {
        const sessionData = { 
          data: { session: demoSession }, 
          error: null 
        };
        console.log('🎬 Mock getSession returning:', sessionData);
        return sessionData;
      },
      onAuthStateChange: (callback) => {
        console.log('🎬 Mock onAuthStateChange called, will call callback immediately');
        // Call immediately with INITIAL_SESSION
        callback('INITIAL_SESSION', demoSession);
        // Then call with SIGNED_IN after a short delay
        setTimeout(() => {
          console.log('🎬 Mock onAuthStateChange calling callback with SIGNED_IN:', demoSession);
          callback('SIGNED_IN', demoSession);
        }, 50);
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
      signInWithOAuth: async () => ({ data: {}, error: null }),
      signOut: async () => ({ error: null })
    }
  };
} else {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.warn('Supabase client creation failed, falling back to demo mode');
    // Fallback to demo mode if real Supabase fails
    const demoSession = {
      user: {
        id: 'demo-user-123',
        email: 'demo@aircasa.com',
        role: 'authenticated',
        user_metadata: {
          full_name: 'Demo User',
          avatar_url: null
        }
      },
      access_token: 'demo-token-123'
    };

    supabase = {
      auth: {
        getSession: async () => ({ 
          data: { session: demoSession }, 
          error: null 
        }),
        onAuthStateChange: (callback) => {
          callback('INITIAL_SESSION', demoSession);
          setTimeout(() => callback('SIGNED_IN', demoSession), 50);
          return { data: { subscription: { unsubscribe: () => {} } } };
        },
        signInWithOAuth: async () => ({ data: {}, error: null }),
        signOut: async () => ({ error: null })
      }
    };
  }
}

export { supabase, isDemoMode };