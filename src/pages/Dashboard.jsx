// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { callSecure } from '@/api/http';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [apiResult, setApiResult] = useState(null);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    let mounted = true;

    // initial session
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setEmail(data.session?.user?.email ?? '');
      setLoading(false);
    });

    // subscribe to auth changes
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, sess) => {
      if (!mounted) return;
      setSession(sess ?? null);
      setEmail(sess?.user?.email ?? '');
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // optional: reload to clear any app state
    window.location.href = '/';
  };

  const handleCallApi = async () => {
    setApiError(null);
    setApiResult(null);
    try {
      const json = await callSecure('/secure'); // GET https://aircasa-api.onrender.com/secure
      setApiResult(json);
      alert(JSON.stringify(json, null, 2)); // keep the quick confirmation
    } catch (err) {
      setApiError(err.message || String(err));
      alert(err.message || String(err));
    }
  };

  if (loading) {
    return <div style={{ padding: 24 }}>Loading your dashboard…</div>;
  }

  if (!session) {
    // App routes should have gated this, but just in case:
    return (
      <main style={{ padding: 24 }}>
        <h2>Not signed in</h2>
        <a href="/auth">Go to sign in</a>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>AirCasa Dashboard</h1>
      <p style={{ marginTop: 8 }}>Signed in as: <strong>{email}</strong></p>

      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <button onClick={handleSignOut}>Sign out</button>
        <button onClick={handleCallApi}>Call Secure API</button>
      </div>

      {apiError && (
        <pre style={{ marginTop: 16, color: 'crimson', whiteSpace: 'pre-wrap' }}>
          Error: {apiError}
        </pre>
      )}
      {apiResult && (
        <pre style={{ marginTop: 16, background: '#f6f8fa', padding: 12, borderRadius: 8, overflowX: 'auto' }}>
{JSON.stringify(apiResult, null, 2)}
        </pre>
      )}

      {/* TODO: Replace Base44-backed widgets with your new API/Supabase-driven components, step by step */}
    </main>
  );
}
