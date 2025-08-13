import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

export default function Auth() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  // If a session already exists (or appears), go to /dashboard
  useEffect(() => {
    let unsub = () => {};

    (async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session ?? null);
      setLoading(false);

      if (data.session) {
        navigate("/dashboard", { replace: true });
      }
    })();

    const sub = supabase.auth.onAuthStateChange((_evt, sess) => {
      setSession(sess ?? null);
      if (sess) navigate("/dashboard", { replace: true });
    });

    unsub = () => sub.data.subscription.unsubscribe();
    return unsub;
  }, [navigate]);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // after OAuth, come back to /auth; effect above will redirect to /dashboard
        redirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/auth`
            : undefined,
      },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/", { replace: true });
  };

  // Optional UI tweaks based on querystring (e.g., ?register=true)
  const wantRegister = params.get("register") === "true";

  if (loading) {
    return <main style={{ padding: 24 }}>Checking session…</main>;
  }

  if (session) {
    // Very briefly shown if we landed here and immediately redirect
    return <main style={{ padding: 24 }}>Redirecting to your dashboard…</main>;
  }

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1>AirCasa — {wantRegister ? "Create your account" : "Sign in"}</h1>
      <p style={{ margin: "12px 0 20px" }}>
        Continue with Google to {wantRegister ? "get started" : "access your account"}.
      </p>
      <button onClick={signInWithGoogle}>Continue with Google</button>

      <div style={{ marginTop: 28, opacity: 0.7 }}>
        <small>
          Having trouble?{" "}
          <button
            onClick={signOut}
            style={{
              textDecoration: "underline",
              background: "none",
              border: 0,
              padding: 0,
              cursor: "pointer",
            }}
          >
            Clear session
          </button>
        </small>
      </div>
    </main>
  );
}
