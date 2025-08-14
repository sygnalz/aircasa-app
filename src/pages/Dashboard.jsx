// aircasa-app/src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { callSecure } from "@/api/http";
import { properties } from "@/api/functions";

export default function Dashboard() {
  // Auth/session state
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");

  // /secure tester state
  const [apiResult, setApiResult] = useState(null);
  const [apiError, setApiError] = useState(null);

  // /properties tester state
  const [propsLoading, setPropsLoading] = useState(false);
  const [propsItems, setPropsItems] = useState(null); // array
  const [propsError, setPropsError] = useState(null);

  useEffect(() => {
    let mounted = true;

    // initial session
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setEmail(data.session?.user?.email ?? "");
      setLoading(false);
    });

    // subscribe to auth changes
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, sess) => {
      if (!mounted) return;
      setSession(sess ?? null);
      setEmail(sess?.user?.email ?? "");
    });

    return () => {
      mounted = false;
      // guard in case subscription object shape changes
      if (sub?.subscription?.unsubscribe) sub.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // optional: reload to clear any app state
    window.location.href = "/";
  };

  // /secure tester
  const handleCallApi = async () => {
    setApiError(null);
    setApiResult(null);
    try {
      // callSecure() defaults to GET /secure
      const json = await callSecure();
      setApiResult(json);
      alert(JSON.stringify(json, null, 2)); // quick confirmation
    } catch (err) {
      const msg = err?.message || String(err);
      setApiError(msg);
      alert(msg);
    }
  };

  // /properties tester
  const handleLoadProperties = async () => {
    setPropsError(null);
    setPropsItems(null);
    setPropsLoading(true);
    try {
      const data = await properties.list(); // { items: [...] }
      const arr = Array.isArray(data?.items) ? data.items : [];
      setPropsItems(arr);
      console.log("Loaded properties:", arr);
    } catch (err) {
      setPropsError(err?.message || String(err));
    } finally {
      setPropsLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 24 }}>Loading your dashboard…</div>;
  }

  if (!session) {
    // App routes should have gated this, but just in case
    return (
      <main style={{ padding: 24 }}>
        <h2>Not signed in</h2>
        <a href="/auth">Go to sign in</a>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1>AirCasa Dashboard</h1>
      <p style={{ marginTop: 8 }}>
        Signed in as: <strong>{email}</strong>
      </p>

      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <button onClick={handleSignOut}>Sign out</button>
        <button onClick={handleCallApi}>Call Secure API</button>
        <button onClick={handleLoadProperties} disabled={propsLoading}>
          {propsLoading ? "Loading properties…" : "Load Properties"}
        </button>
      </div>

      {/* /secure tester output */}
      {apiError && (
        <pre style={{ marginTop: 16, color: "crimson", whiteSpace: "pre-wrap" }}>
          Error: {apiError}
        </pre>
      )}
      {apiResult && (
        <pre
          style={{
            marginTop: 16,
            background: "#f6f8fa",
            padding: 12,
            borderRadius: 8,
            overflowX: "auto",
          }}
        >
{JSON.stringify(apiResult, null, 2)}
        </pre>
      )}

      {/* /properties tester output */}
      {propsError && (
        <pre style={{ marginTop: 16, color: "crimson", whiteSpace: "pre-wrap" }}>
          Properties error: {propsError}
        </pre>
      )}
      {propsItems && (
        <pre
          style={{
            marginTop: 16,
            background: "#f6f8fa",
            padding: 12,
            borderRadius: 8,
            overflowX: "auto",
          }}
        >
{JSON.stringify(propsItems, null, 2)}
        </pre>
      )}

      {/* TODO: Replace Base44-backed widgets with new API/Supabase-driven components */}
    </main>
  );
}
