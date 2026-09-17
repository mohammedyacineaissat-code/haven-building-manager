import { isSupabaseConfigured } from '../lib/supabase';

// ── String Utilities ──────────────────────────────────────────────────
export const cleanStr = (val?: string) => (val || '').trim().toLowerCase();
export const cleanDigits = (val?: string) => (val || '').replace(/\D/g, '');
export const cleanApt = (val?: string) => (val || '').trim().toLowerCase().replace(/^apt\s*/i, '');

// ── UUID Generator ────────────────────────────────────────────────────
export const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// ── Auth Password Padding ─────────────────────────────────────────────
/** Ensure password meets Supabase Auth's 6-char minimum by padding if needed */
export const toAuthPassword = (pwd: string): string =>
  pwd.length >= 6 ? pwd : `${pwd}${'0'.repeat(6 - pwd.length)}`;

// ── Safe localStorage Helpers ─────────────────────────────────────────
export const safeGetItem = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export const safeSetItem = (key: string, value: unknown): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore quota or sandbox errors
  }
};

export const safeRemoveItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore
  }
};

// ── Supabase Guard ────────────────────────────────────────────────────
/** Helper to skip Supabase calls when not configured */
export const isOnline = () => isSupabaseConfigured;
