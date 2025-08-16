// aircasa-app/src/lib/getAccessToken.js
import { supabase } from "./supabaseClient";

export async function getAccessToken() {
  const { data } = await supabase.auth.getSession();
  return data?.session?.access_token ?? null;
}
