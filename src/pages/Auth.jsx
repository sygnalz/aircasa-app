import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { properties } from "@/api/functions";

export default function Auth() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  // If a session exists, check if user has properties to determine where to redirect
  useEffect(() => {
    let unsub = () => {};

    const handleUserRedirection = async (session) => {
      if (!session?.user) return;
      
      try {
        // Check if user has any properties
        console.log('🔍 Checking user properties for redirection...');
        const propertiesData = await properties.list();
        
        if (propertiesData?.items) {
          const userProperties = propertiesData.items.filter(property => {
            return (
              property.ownerEmail === session.user.email ||
              property.app_email === session.user.email ||
              property.app_owner_user_id === session.user.id
            );
          });
          
          console.log('📊 User properties found:', userProperties.length);
          
          // If user has properties, go to dashboard; otherwise go to onboarding
          if (userProperties.length > 0) {
            console.log('➡️ Redirecting to dashboard (existing user with properties)');
            navigate("/dashboard", { replace: true });
          } else {
            console.log('➡️ Redirecting to onboarding (new user or no properties)');
            navigate("/onboarding", { replace: true });
          }
        } else {
          // If we can't check properties, default to onboarding for safety
          console.log('➡️ Redirecting to onboarding (unable to check properties)');
          navigate("/onboarding", { replace: true });
        }
      } catch (error) {
        console.error('Error checking user properties:', error);
        // On error, redirect to onboarding to be safe
        navigate("/onboarding", { replace: true });
      }
    };

    (async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session ?? null);
      setLoading(false);

      if (data.session) {
        await handleUserRedirection(data.session);
      }
    })();

    const sub = supabase.auth.onAuthStateChange(async (_evt, sess) => {
      setSession(sess ?? null);
      if (sess) {
        await handleUserRedirection(sess);
      }
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
