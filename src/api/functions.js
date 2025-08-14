// src/api/functions.js
// Base44 → AirCasa transition layer.
// - Implements `properties.list()` against our Express API.
// - Leaves other exports as no-op/placeholders so existing imports don’t break.
//   We’ll replace them one-by-one in tiny steps.

import { supabase } from '@/lib/supabaseClient';

const BASE_URL = import.meta.env.VITE_API_URL || '';

async function authedGet(path) {
  if (!BASE_URL) throw new Error('VITE_API_URL is not set');
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('No session token');

  const url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  return res.json();
}

// ---- Properties ----
export const properties = {
  /**
   * Mirrors prior usage patterns:
   *   const { items } = await properties.list();
   */
  async list() {
    // GET https://aircasa-api.onrender.com/properties
    return authedGet('/properties'); // returns { ok: true, items: [...] }
  },
};

// ---- Placeholders (to be migrated next) ----
// Tip: we’ll replace each with real API calls in subsequent steps.
export const aiChat = {
  async send(_payload) {
    throw new Error('aiChat.send not implemented yet');
  },
};

export const getVoices = async () => {
  throw new Error('getVoices not implemented yet');
};

export const checkConversationHistory = async () => {
  throw new Error('checkConversationHistory not implemented yet');
};

export const exportConversationLog = async () => {
  throw new Error('exportConversationLog not implemented yet');
};

export const getUserReferralId = async () => {
  throw new Error('getUserReferralId not implemented yet');
};

export const syncWithAttom = async () => {
  throw new Error('syncWithAttom not implemented yet');
};

export const syncUserWithAirtable = async () => {
  throw new Error('syncUserWithAirtable not implemented yet');
};

export const getAdminDashboardStats = async () => {
  throw new Error('getAdminDashboardStats not implemented yet');
};

export const getIntakeForPropertyAdmin = async () => {
  throw new Error('getIntakeForPropertyAdmin not implemented yet');
};

export const getConversationUserSummaries = async () => {
  throw new Error('getConversationUserSummaries not implemented yet');
};

export const getUserConversationDetails = async () => {
  throw new Error('getUserConversationDetails not implemented yet');
};

export const sendAdminMessage = async () => {
  throw new Error('sendAdminMessage not implemented yet');
};

export const getUserChatHistory = async () => {
  throw new Error('getUserChatHistory not implemented yet');
};

export const getAnalyticsData = async () => {
  throw new Error('getAnalyticsData not implemented yet');
};

export const generateSpeech = async () => {
  throw new Error('generateSpeech not implemented yet');
};
