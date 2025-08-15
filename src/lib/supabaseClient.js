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
try {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} catch (error) {
  console.warn('Supabase client creation failed, using demo mode');
  // Create a mock supabase client for demo purposes
  supabase = {
    auth: {
      getSession: async () => ({ 
        data: { 
          session: {
            user: {
              id: 'demo-user-123',
              email: 'demo@aircasa.com',
              user_metadata: {
                full_name: 'Demo User',
                avatar_url: null
              }
            },
            access_token: 'demo-token-123'
          } 
        }, 
        error: null 
      }),
      onAuthStateChange: (callback) => {
        // Simulate auth state change
        setTimeout(() => {
          callback('SIGNED_IN', {
            user: {
              id: 'demo-user-123',
              email: 'demo@aircasa.com',
              user_metadata: {
                full_name: 'Demo User',
                avatar_url: null
              }
            },
            access_token: 'demo-token-123'
          });
        }, 100);
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
      signInWithOAuth: async () => ({ data: {}, error: null }),
      signOut: async () => ({ error: null })
    }
  };
}

export { supabase, isDemoMode };