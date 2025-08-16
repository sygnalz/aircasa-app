import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client with error handling
let supabase = null;

try {
  // Check if we have valid Supabase credentials
  if (supabaseUrl && supabaseAnonKey && 
      supabaseUrl !== 'https://demo.supabase.co' && 
      supabaseAnonKey !== 'demo-anon-key-for-development') {
    
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
    
    console.log('✅ Supabase client initialized successfully');
  } else {
    console.log('🗃️ Supabase running in DEMO mode - using mock authentication');
  }
} catch (error) {
  console.error('❌ Failed to initialize Supabase client:', error);
}

// Export the client (will be null in demo mode)
export { supabase };

// Demo mode detection
export const isDemoMode = !supabase;

// Auth helper functions
export const auth = {
  // Sign in with email/password
  async signIn(email, password) {
    if (isDemoMode) {
      return { data: { user: createDemoUser(email) }, error: null };
    }
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Sign in with OAuth provider
  async signInWithOAuth(provider) {
    if (isDemoMode) {
      return { data: { user: createDemoUser(`demo@${provider}.com`) }, error: null };
    }
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Sign up new user
  async signUp(email, password, metadata = {}) {
    if (isDemoMode) {
      return { data: { user: createDemoUser(email, metadata) }, error: null };
    }
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Sign out
  async signOut() {
    if (isDemoMode) {
      return { error: null };
    }
    
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error };
    }
  },

  // Get current session
  async getSession() {
    if (isDemoMode) {
      const storedUser = localStorage.getItem('demo-user');
      return { 
        data: { 
          session: storedUser ? { user: JSON.parse(storedUser) } : null 
        }, 
        error: null 
      };
    }
    
    try {
      const { data, error } = await supabase.auth.getSession();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get current user
  async getUser() {
    if (isDemoMode) {
      const storedUser = localStorage.getItem('demo-user');
      return { 
        data: { 
          user: storedUser ? JSON.parse(storedUser) : null 
        }, 
        error: null 
      };
    }
    
    try {
      const { data, error } = await supabase.auth.getUser();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Listen to auth changes
  onAuthStateChange(callback) {
    if (isDemoMode) {
      // In demo mode, simulate auth state changes
      const storedUser = localStorage.getItem('demo-user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      callback('SIGNED_IN', { user });
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
    
    try {
      const { data } = supabase.auth.onAuthStateChange(callback);
      return { data };
    } catch (error) {
      console.error('Auth state change listener error:', error);
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  }
};

// Create demo user for testing
function createDemoUser(email, metadata = {}) {
  const demoUser = {
    id: `demo-${Date.now()}`,
    email,
    user_metadata: {
      full_name: metadata.full_name || 'Demo User',
      avatar_url: metadata.avatar_url || null,
      ...metadata
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  // Store in localStorage for demo persistence
  localStorage.setItem('demo-user', JSON.stringify(demoUser));
  
  return demoUser;
}

export default supabase;