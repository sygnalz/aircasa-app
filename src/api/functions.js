// aircasa-app/src/api/functions.js
import { apiFetch } from "./http";

/* -------------------- Properties -------------------- */
export const properties = {
  async list() {
    return apiFetch("/properties", { method: "GET" });
  },
};

/* -------------------- Placeholders (migrate later) -------------------- */
export const aiChat = { async send() { throw new Error("aiChat.send not implemented yet"); } };
export const getVoices = async () => { throw new Error("getVoices not implemented yet"); };
export const generateSpeech = async () => { throw new Error("generateSpeech not implemented yet"); };
export const checkConversationHistory = async () => { throw new Error("checkConversationHistory not implemented yet"); };
export const getConversationUserSummaries = async () => { throw new Error("getConversationUserSummaries not implemented yet"); };
export const getUserConversationDetails = async () => { throw new Error("getUserConversationDetails not implemented yet"); };
export const getUserChatHistory = async () => { throw new Error("getUserChatHistory not implemented yet"); };
export const exportConversationLog = async () => { throw new Error("exportConversationLog not implemented yet"); };
export const getUserReferralId = async () => { throw new Error("getUserReferralId not implemented yet"); };
export const syncWithAttom = async () => { throw new Error("syncWithAttom not implemented yet"); };
export const syncUserWithAirtable = async () => { throw new Error("syncUserWithAirtable not implemented yet"); };
export const getAdminDashboardStats = async () => { throw new Error("getAdminDashboardStats not implemented yet"); };
export const getIntakeForPropertyAdmin = async () => { throw new Error("getIntakeForPropertyAdmin not implemented yet"); };
export const sendAdminMessage = async () => { throw new Error("sendAdminMessage not implemented yet"); };
export const getAnalyticsData = async () => { throw new Error("getAnalyticsData not implemented yet"); };
