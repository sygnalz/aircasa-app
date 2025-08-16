// src/api/entities.js
// Base44 → AirCasa transition shim
// - Replaces Base44's `User` with Supabase/our-API backed helpers
// - Leaves other entities as placeholders until we migrate those features

import { supabase } from '@/lib/supabaseClient';
import { aircasa } from '@/api/aircasa';

// ---- User helpers (drop-in for prior base44.auth usage) ----
export const User = {
  /**
   * Return the current user (id, email, role) via our API's /me endpoint.
   * Falls back to Supabase session if API is unavailable.
   */
  async me() {
    try {
      const res = await aircasa.me();
      return res?.user ?? null;
    } catch {
      // Fallback to Supabase session to avoid breaking UI
      const { data } = await supabase.auth.getSession();
      const sess = data.session;
      if (!sess) return null;
      return {
        id: sess.user.id,
        email: sess.user.email,
        role: (sess.user.role ?? 'authenticated'),
      };
    }
  },

  /**
   * Start OAuth sign-in (Google) using Supabase.
   * Optional: pass a redirect path (e.g., "/dashboard").
   */
  async loginWithRedirect(redirectPath = '/dashboard') {
    const redirectTo =
      typeof window !== 'undefined'
        ? `${window.location.origin}${redirectPath}`
        : undefined;

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
  },

  /** Sign out and optionally redirect (default: home). */
  async logout(redirectPath = '/') {
    await supabase.auth.signOut();
    if (typeof window !== 'undefined') {
      window.location.href = redirectPath;
    }
  },
};

// ---- Placeholders for remaining Base44 entities ----
// We will replace these incrementally with our own API calls.
export const Signup = {};          // TODO: migrate to AirCasa route
export const AIInsight = {
  async filter(filterObj) {
    console.log('🤖 AIInsight.filter called with:', filterObj);
    return [];
  }
};

export const PropertyIntake = {
  async filter(filterObj) {
    console.log('📝 PropertyIntake.filter called with:', filterObj);
    // Return empty array for now - this prevents the error while maintaining functionality
    return [];
  }
};

export const Task = {
  async filter(filterObj) {
    console.log('✅ Task.filter called with:', filterObj);
    return [];
  }
};
