import { createClient } from "@supabase/supabase-js";

const g = globalThis as any;

export function supabase() {
  if (!g.__supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (url && key) {
      try { g.__supabase = createClient(url, key); } catch { return null; }
    }
  }
  return g.__supabase || null;
}