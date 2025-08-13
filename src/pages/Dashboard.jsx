import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load current session and subscribe to changes
    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user?.email ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, sess) => {
      setEmail(sess?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate('/', { replace: true }); // go back to marketing page
  }

  if (loading) {
    return <main style={{ padding: 24 }}>Loading…</main>;
  }

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>Dashboard</h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 14, color: '#555' }}>
            {email ? `Signed in as ${email}` : 'Not signed in'}
          </span>
          <Button onClick={handleSignOut}>Sign out</Button>
        </div>
      </header>

      <section style={{ display: 'grid', gap: 16 }}>
        <div style={{ padding: 16, border: '1px solid #eee', borderRadius: 12 }}>
          <h2 style={{ marginTop: 0 }}>Welcome to AirCasa</h2>
          <p style={{ marginBottom: 12 }}>
            This is your protected area. Only authenticated users can see this page.
          </p>
          <p style={{ marginBottom: 0 }}>
            Need to get back to the marketing page?{' '}
            <Link to="/">Go home</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
