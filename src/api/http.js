import { supabase } from '@/lib/supabaseClient';

const API_BASE = import.meta.env.VITE_API_URL; // e.g., https://aircasa-api.onrender.com

export async function callSecure(path = '/secure') {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('No Supabase session — please sign in.');

  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${text || 'Request failed'}`);
  }
  return res.json();
}
