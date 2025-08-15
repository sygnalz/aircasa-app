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
    console.log('🔍 User.me() called');
    try {
      console.log('🔍 Trying aircasa.me() API call...');
      const res = await aircasa.me();
      console.log('✅ aircasa.me() success:', res);
      return res?.user ?? null;
    } catch (error) {
      console.log('⚠️ aircasa.me() failed, falling back to Supabase session:', error.message);
      // Fallback to Supabase session to avoid breaking UI
      const { data } = await supabase.auth.getSession();
      const sess = data.session;
      console.log('🔍 Supabase session:', sess);
      if (!sess) return null;
      const user = {
        id: sess.user.id,
        email: sess.user.email,
        role: sess.user.role || 'authenticated', // For demo mode, use 'authenticated' role
      };
      console.log('✅ Returning demo user:', user);
      return user;
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

// ---- Temporary mock implementations for demo mode ----
// These will be replaced with proper API calls when the backend is ready
export const Signup = {};

export const AIInsight = {
  async filter(filterObj) {
    console.log('🤖 AIInsight.filter called with:', filterObj);
    // Return empty array for now - no AI insights in demo
    return [];
  }
};

export const PropertyIntake = {
  async filter(filterObj) {
    console.log('📝 PropertyIntake.filter called with:', filterObj);
    // Return empty array for now - no intake records in demo
    return [];
  },
  async update(id, updates) {
    console.log('📝 PropertyIntake.update called with:', { id, updates });
    // Return mock success for demo
    return { id, ...updates };
  },
  async create(data) {
    console.log('📝 PropertyIntake.create called with:', data);
    // Return mock created record for demo
    return { id: 'demo-intake-' + Date.now(), ...data };
  }
};

export const Task = {
  async filter(filterObj) {
    console.log('✅ Task.filter called with:', filterObj);
    // Return empty array for now - no tasks in demo
    return [];
  }
};
