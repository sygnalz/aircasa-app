import { Routes, Route, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase, isDemoMode } from './lib/supabaseClient';
import RoleBasedLayout from '@/components/layout/RoleBasedLayout';

import Auth from '@/pages/Auth.jsx';
import Home from '@/pages/index.jsx';
import Dashboard from '@/pages/Dashboard.jsx';
import Properties from '@/pages/Properties.jsx';
import PropertyDetails from '@/pages/PropertyDetails.jsx';
import AirtableDebug from '@/pages/AirtableDebug.jsx';
import { UserRoute } from './components/auth/ProtectedRoute';

function AuthGate({ children }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    let unsub = null;

    const initAuth = async () => {
      try {
        // initial session
        const { data } = await supabase.auth.getSession();
        setSession(data.session ?? null);
        setLoading(false);

        // subscribe to auth changes
        const { data: sub } = supabase.auth.onAuthStateChange((_evt, sess) => {
          setSession(sess ?? null);
        });
        // safe cleanup guard
        unsub = sub?.subscription?.unsubscribe;
      } catch (error) {
        console.error('Auth initialization error:', error);
        // In demo mode, auto-authenticate
        if (isDemoMode) {
          setSession({
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
        }
        setLoading(false);
      }
    };

    initAuth();

    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, []);

  const signIn = async () => {
    if (isDemoMode) {
      // Simulate sign in for demo
      setSession({
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
      return;
    }
    
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo:
          typeof window !== "undefined"
            ? window.location.origin + "/auth"
            : undefined,
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span>Loading AirCasa...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground mx-auto mb-4">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 3v18m7-18v18M9 7h6m-6 4h6" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome to AirCasa</h1>
            <p className="text-gray-600 mt-2">Professional Property Management Platform</p>
            {isDemoMode && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  🎬 <strong>Demo Mode</strong> - Click below to explore the platform
                </p>
              </div>
            )}
          </div>
          <button 
            onClick={signIn}
            className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            {isDemoMode ? (
              <>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Explore Demo
              </>
            ) : (
              <>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign in with Google
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return children;
}

function ProtectedShell() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AuthGate>
      <RoleBasedLayout>
        <Outlet />
      </RoleBasedLayout>
    </AuthGate>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public pages */}
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<Auth />} />

      {/* Protected pages */}
      <Route element={<ProtectedShell />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/property/:propertyId" element={<PropertyDetails />} />
        <Route path="/airtable-debug" element={<AirtableDebug />} />
      </Route>

      {/* (optional) catch-all could go here */}
      {/* <Route path="*" element={<NotFound />} /> */}
    </Routes>
  );
}
