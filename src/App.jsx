import { useEffect, useState } from 'react';
import { supabase } from './lib/supabaseClient';
// If your app uses a router, keep your existing imports (e.g., RouterProvider/router)

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
        redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
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

export default function App() {
  // If you already render routes/layout here, keep that JSX inside <AuthGate>
  // Example:
  // return (
  //   <AuthGate>
  //     <RouterProvider router={router} />
  //   </AuthGate>
  // );

  return (
    <AuthGate>
      {/* TODO: keep your current App JSX here (routes/layout). For now, a placeholder: */}
      <div style={{ padding: 24 }}>App content goes here (gated)</div>
    </AuthGate>
  );
}
