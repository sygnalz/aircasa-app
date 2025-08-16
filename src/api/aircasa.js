import { supabase } from '@/lib/supabaseClient';

const BASE_URL = import.meta.env.VITE_API_URL || '';

async function authedFetch(path, options = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('No session token. Sign in first.');

  const url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  return res.json();
}

export const aircasa = {
  me: () => authedFetch('/me'),
  // TODO: add as we migrate
  // listProperties: () => authedFetch('/properties'),
  // aiChat: (body) => authedFetch('/chat', { method: 'POST', body: JSON.stringify(body) }),
  // getAnalytics: () => authedFetch('/analytics'),
};
