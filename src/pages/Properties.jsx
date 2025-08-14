// aircasa-app/src/pages/Properties.jsx
import React, { useEffect, useState } from "react";
import { properties } from "@/api/functions";

export default function PropertiesPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState(null); // expect array
  const [error, setError] = useState(null);

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const data = await properties.list(); // { items: [...] }
      setItems(Array.isArray(data?.items) ? data.items : []);
    } catch (err) {
      setError(err?.message || String(err));
      setItems(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => load();

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h1 style={{ margin: 0 }}>Properties</h1>
        <button onClick={handleRefresh} disabled={loading} style={{ padding: "6px 12px" }}>
          {loading ? "Loading…" : "Refresh"}
        </button>
      </header>

      {error && (
        <div style={{ marginTop: 16, color: "crimson", whiteSpace: "pre-wrap" }}>
          Error: {error}
        </div>
      )}

      {!error && !loading && Array.isArray(items) && items.length === 0 && (
        <div style={{ marginTop: 16, color: "#555" }}>
          No properties yet. Once data is wired to the backend, items will appear here.
        </div>
      )}

      {!error && Array.isArray(items) && items.length > 0 && (
        <section
          style={{
            marginTop: 16,
            background: "#f6f8fa",
            padding: 12,
            borderRadius: 8,
            overflowX: "auto",
          }}
        >
          {/* Generic JSON view (schema-agnostic) */}
          <pre style={{ margin: 0 }}>
{JSON.stringify(items, null, 2)}
          </pre>
        </section>
      )}

      {loading && (
        <div style={{ marginTop: 16 }}>
          Loading properties…
        </div>
      )}
    </main>
  );
}
