import { createClient } from '@base44/sdk';

// Make appId configurable (keeps your current default)
const APP_ID = import.meta.env.VITE_BASE44_APP_ID || "686ecf4049a15637f7b5d12a";

// IMPORTANT: requiresAuth=false so Base44 doesn't show its own login UI
export const base44 = createClient({
  appId: APP_ID,
  requiresAuth: false,
});
