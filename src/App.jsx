import { Routes, Route, Outlet } from 'react-router-dom';
import Auth from '@/pages/Auth.jsx';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabaseClient';

function AuthGate({ children }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, sess) => {
      setSession(sess ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined' ? window.location.origin + '/auth' : undefined,
      },
    });
  };

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;
  if (!session) {
    return (
      <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
        <h2>AirCasa — Sign in</h2>
        <button onClick={signIn}>Sign in with Google</button>
      </main>
    );
  }

  return children;
}

function ProtectedShell() {
  return (
    <AuthGate>
      <Outlet />
    </AuthGate>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public route: real Supabase login screen */}
      <Route path="/auth" element={<Auth />} />

      {/* Protected routes go under this wrapper */}
      <Route element={<ProtectedShell />}>
        {/* Example protected home; add your real routes here */}
        {/* <Route path="/" element={<Home />} /> */}
        <Route path="/" element={<div style={{ padding: 24 }}>App content goes here (gated)</div>} />
      </Route>
    </Routes>
  );
}
