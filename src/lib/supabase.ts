import { createClient } from "@supabase/supabase-js";

const g = globalThis as any;

if (!g.__supabase) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    g.__supabase = createClient(url, key);
  }
}

export function supabase() {
  return g.__supabase as ReturnType<typeof createClient> | null;
}