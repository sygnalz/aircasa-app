import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { callSecure } from "@/api/http";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [email, setEmail] = useState(null);
  const [calling, setCalling] = useState(false);
  const [apiResult, setApiResult] = useState(null);

  // Load the current user for a friendly header
  useEffect(() => {
    let sub;
    supabase.auth.getSession().then(({ data }) => {
      const e = data.session?.user?.email ?? null;
      setEmail(e);
    });
    sub = supabase.auth.onAuthStateChange((_evt, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => sub?.data?.subscription?.unsubscribe?.();
  }, []);

  // === Debug helper: log your Supabase access token ===
  async function logToken() {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      console.warn("No access token (not signed in?).");
    } else {
      console.log("Access token:", token);
    }
  }

  // === Test hitting your protected API on Render ===
  async function handleCallSecure() {
    try {
      setCalling(true);
      setApiResult(null);
      // This helper sends the Supabase JWT as Authorization: Bearer <token>
      // It hits https://aircasa-api.onrender.com/secure (configured in /api/http)
      const json = await callSecure("/secure");
      setApiResult(json);
      alert("Secure API response:\n" + JSON.stringify(json, null, 2));
    } catch (err) {
      console.error(err);
      alert(err?.message || String(err));
    } finally {
      setCalling(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/"; // back to marketing page
  }

  return (
    <main className="min-h-screen p-6">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">AirCasa Dashboard</h1>
          <p className="text-sm text-gray-500">
            {email ? `Signed in as ${email}` : "Loading user…"}
          </p>
        </div>
        <nav className="flex items-center gap-3">
          <Link
            to="/"
            className="text-sm px-3 py-2 rounded border hover:bg-gray-50"
          >
            Home
          </Link>
          <button
            onClick={handleSignOut}
            className="text-sm px-3 py-2 rounded border hover:bg-gray-50"
          >
            Sign out
          </button>
        </nav>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded border p-4">
          <h2 className="font-medium mb-2">Debug: Log Token</h2>
          <p className="text-sm text-gray-600 mb-3">
            Click to print your Supabase access token in the browser console.
          </p>
          <button
            onClick={logToken}
            className="px-3 py-2 rounded bg-gray-900 text-white hover:bg-black"
          >
            Log Token to Console
          </button>
        </div>

        <div className="rounded border p-4">
          <h2 className="font-medium mb-2">Secure API</h2>
          <p className="text-sm text-gray-600 mb-3">
            Calls your Render API (<code>/secure</code>) with your Supabase JWT.
          </p>
          <button
            onClick={handleCallSecure}
            disabled={calling}
            className="px-3 py-2 rounded bg-blue-600 text-white disabled:opacity-60 hover:bg-blue-700"
          >
            {calling ? "Calling…" : "Call Secure API"}
          </button>
          {apiResult && (
            <pre className="mt-3 text-xs bg-gray-50 border rounded p-2 overflow-auto">
{JSON.stringify(apiResult, null, 2)}
            </pre>
          )}
        </div>
      </section>
    </main>
  );
}
