import { createClient } from '@base44/sdk';

const APP_ID = import.meta.env.VITE_BASE44_APP_ID || '686ecf4049a15637f7b5d12a';

export const base44 = createClient({
  appId: APP_ID,
  requiresAuth: false, // ⬅️ IMPORTANT: disable Base44 login gate
});
