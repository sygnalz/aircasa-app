// aircasa-app/src/api/http.js
import { getAccessToken } from "@/lib/getAccessToken";

const API_BASE = import.meta.env.VITE_API_BASE; // e.g., https://aircasa-api.onrender.com

function buildHeaders(initHeaders = {}, token, hasBody = false) {
  const base = { ...initHeaders, Authorization: `Bearer ${token}` };
  if (hasBody && !base["Content-Type"]) base["Content-Type"] = "application/json";
  return base;
}

export async function apiFetch(path, init = {}) {
  const token = await getAccessToken();
  if (!token) throw new Error("Not authenticated");

  const url = `${API_BASE}${path}`;
  const hasBody = typeof init.body !== "undefined";
  const res = await fetch(url, { ...init, headers: buildHeaders(init.headers, token, hasBody) });

  if (!res.ok) {
    try {
      const body = await res.json();
      throw new Error(body?.error || `HTTP ${res.status}`);
    } catch {
      const text = await res.text().catch(() => "");
      throw new Error(text || `HTTP ${res.status}`);
    }
  }
  return res.json();
}

// Convenience: /secure round-trip
export async function callSecure() {
  return apiFetch("/secure", { method: "GET" });
}
