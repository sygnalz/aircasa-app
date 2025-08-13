import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

export default function Auth() {
  const navigate = useNavigate();
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

  useEffect(() => {
    if (session) {
      // Already signed in → send to app home
      navigate('/', { replace: true });
    }
  }, [session, navigate]);

  const signInGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined' ? window.location.origin + '/auth' : undefined,
      },
    });
  };

  if (loading) {
    return <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>Loading…</main>;
  }

  if (session) {
    return <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>Signed in. Redirecting…</main>;
  }

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginBottom: 12 }}>AirCasa — Sign in</h1>
      <button onClick={signInGoogle} style={{ padding: '8px 14px', cursor: 'pointer' }}>
        Sign in with Google
      </button>
    </main>
  );
}
