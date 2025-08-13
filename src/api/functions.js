// src/api/functions.js
// De-Base44 shim: keep the same named exports so imports don’t break.
// TODO: Implement each function against your Render API (VITE_API_URL) or Supabase.

const notImplemented = (name) => {
  throw new Error(`[AirCasa] Function "${name}" is not implemented yet (Base44 removed).`);
};

export const properties = async (...args) => notImplemented('properties');
export const aiChat = async (...args) => notImplemented('aiChat');
export const getVoices = async (...args) => notImplemented('getVoices');
export const checkConversationHistory = async (...args) => notImplemented('checkConversationHistory');
export const exportConversationLog = async (...args) => notImplemented('exportConversationLog');
export const getUserReferralId = async (...args) => notImplemented('getUserReferralId');
export const syncWithAttom = async (...args) => notImplemented('syncWithAttom');
export const syncUserWithAirtable = async (...args) => notImplemented('syncUserWithAirtable');
export const getAdminDashboardStats = async (...args) => notImplemented('getAdminDashboardStats');
export const getIntakeForPropertyAdmin = async (...args) => notImplemented('getIntakeForPropertyAdmin');
export const getConversationUserSummaries = async (...args) => notImplemented('getConversationUserSummaries');
export const getUserConversationDetails = async (...args) => notImplemented('getUserConversationDetails');
export const sendAdminMessage = async (...args) => notImplemented('sendAdminMessage');
export const getUserChatHistory = async (...args) => notImplemented('getUserChatHistory');
export const getAnalyticsData = async (...args) => notImplemented('getAnalyticsData');
export const generateSpeech = async (...args) => notImplemented('generateSpeech');
