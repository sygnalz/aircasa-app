// aircasa-app/src/App.jsx
import { Routes, Route, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";

import Auth from "@/pages/Auth.jsx";
import Home from "@/pages/index.jsx";
import Dashboard from "@/pages/Dashboard.jsx";
import Properties from "@/pages/Properties.jsx";

function AuthGate({ children }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    let unsub = null;

    // initial session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      setLoading(false);
    });

    // subscribe to auth changes
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, sess) => {
      setSession(sess ?? null);
    });
    // safe cleanup guard
    unsub = sub?.subscription?.unsubscribe;

    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, []);

  const signIn = async () => {
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

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;

  if (!session) {
    return (
      <main style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
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
      {/* Public pages */}
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<Auth />} />

      {/* Protected pages */}
      <Route element={<ProtectedShell />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/properties" element={<Properties />} />
      </Route>

      {/* (optional) catch-all could go here */}
      {/* <Route path="*" element={<NotFound />} /> */}
    </Routes>
  );
}
