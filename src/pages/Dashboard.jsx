import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

// Lightweight inline “ReferralModal” (so we don’t depend on old Base44 components)
function ReferralModal({ open, onClose, referralLink }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "grid",
        placeItems: "center",
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 480,
          maxWidth: "90vw",
          background: "#fff",
          borderRadius: 12,
          padding: 20,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ marginTop: 0, marginBottom: 12 }}>Invite a friend</h3>
        <p style={{ margin: "0 0 12px" }}>
          Share this link and get credit when they sign up:
        </p>
        <div
          style={{
            border: "1px solid #eee",
            borderRadius: 8,
            padding: 12,
            background: "#fafafa",
            wordBreak: "break-all",
            marginBottom: 12,
          }}
        >
          {referralLink}
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button
            onClick={() => {
              navigator.clipboard.writeText(referralLink);
            }}
          >
            Copy link
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState(null);
  const [referralOpen, setReferralOpen] = useState(false);
  const [referralLink, setReferralLink] = useState("");

  // Load current session and keep email in state
  useEffect(() => {
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
    navigate("/", { replace: true }); // back to marketing page
  }

  async function callSecureApi() {
    try {
      setApiStatus("Calling…");
      // Minimal client that forwards Supabase JWT lives in src/api/http.js
      const { callSecure } = await import("@/api/http");
      const json = await callSecure("/secure");
      setApiStatus(JSON.stringify(json, null, 2));
      alert(JSON.stringify(json, null, 2));
    } catch (err) {
      const msg = err?.message || String(err);
      setApiStatus(`Error: ${msg}`);
      alert(msg);
    }
  }

  // --- Placeholders to replace Base44 behavior with your API ---
  // TODO: implement these in your Render API and call them here.
  async function fetchReferralLink() {
    // EXAMPLE: GET /referral-id -> { id: "..."} then construct URL
    // const res = await fetch(`${import.meta.env.VITE_API_URL}/referral-id`, { headers: { Authorization: `Bearer ${token}` }})
    // const { id } = await res.json();
    const demoId = "demo-ref-123"; // placeholder
    const url = `${window.location.origin}/?ref=${demoId}`;
    setReferralLink(url);
    setReferralOpen(true);
  }

  async function syncUserWithAirtable() {
    // EXAMPLE: POST /sync-user
    alert("Sync user with Airtable → TODO (wire to your API)");
  }

  async function exportConversationLog() {
    // EXAMPLE: GET /conversations/export -> triggers download
    alert("Export conversation log → TODO (wire to your API)");
  }

  if (loading) {
    return <main style={{ padding: 24 }}>Loading…</main>;
  }

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Dashboard</h1>
          <p style={{ margin: "6px 0 0", color: "#666" }}>
            {email ? `Signed in as ${email}` : "Not signed in"}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button onClick={handleSignOut}>Sign out</Button>
          <Link to="/">
            <Button variant="secondary">Go to site</Button>
          </Link>
        </div>
      </header>

      {/* Quick Actions */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
          <h3 style={{ marginTop: 0, marginBottom: 8 }}>Secure API</h3>
          <p style={{ marginTop: 0, marginBottom: 12, color: "#555" }}>
            Test your authenticated API on Render using your Supabase JWT.
          </p>
          <Button onClick={callSecureApi}>Call /secure</Button>
          {apiStatus && (
            <pre
              style={{
                marginTop: 12,
                border: "1px solid #eee",
                background: "#fafafa",
                padding: 12,
                borderRadius: 8,
                maxHeight: 200,
                overflow: "auto",
                whiteSpace: "pre-wrap",
              }}
            >
              {apiStatus}
            </pre>
          )}
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
          <h3 style={{ marginTop: 0, marginBottom: 8 }}>Referral</h3>
          <p style={{ marginTop: 0, marginBottom: 12, color: "#555" }}>
            Generate a personal referral link to share with friends.
          </p>
          <Button onClick={fetchReferralLink}>Get referral link</Button>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
          <h3 style={{ marginTop: 0, marginBottom: 8 }}>Airtable</h3>
          <p style={{ marginTop: 0, marginBottom: 12, color: "#555" }}>
            Keep your user profile synced with Airtable (custom API).
          </p>
          <Button onClick={syncUserWithAirtable}>Sync user</Button>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
          <h3 style={{ marginTop: 0, marginBottom: 8 }}>Conversations</h3>
          <p style={{ marginTop: 0, marginBottom: 12, color: "#555" }}>
            Export your conversation log (custom API).
          </p>
          <Button onClick={exportConversationLog}>Export log</Button>
        </div>
      </section>

      {/* Getting Started / Navigation */}
      <section
        style={{
          border: "1px solid #eee",
          borderRadius: 12,
          padding: 16,
          marginTop: 16,
        }}
      >
        <h2 style={{ marginTop: 0 }}>Next steps</h2>
        <ul style={{ marginTop: 8, paddingLeft: 20 }}>
          <li>
            Start onboarding:{" "}
            <Link to="/onboarding">
              <strong>Onboarding</strong>
            </Link>{" "}
            (make sure this route exists).
          </li>
          <li>
            Set your post‑login route (currently <code>/dashboard</code> in{" "}
            <code>Auth.jsx</code>).
          </li>
          <li>
            Replace the placeholders above with real API calls to your Render backend.
          </li>
        </ul>
      </section>

      {/* Referral Modal */}
      <ReferralModal
        open={referralOpen}
        onClose={() => setReferralOpen(false)}
        referralLink={referralLink}
      />
    </main>
  );
}
