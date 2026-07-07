"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";
import { getSupabasePublishableKey, getSupabaseUrl } from "./env";

export function createClient() {
  const url = getSupabaseUrl();
  const key = getSupabasePublishableKey();
  if (!url || !key) {
    throw new Error(
      "Variables Supabase manquantes. Définissez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY dans .env.local"
    );
  }
  return createBrowserClient<Database>(url, key);
}

let browserClient: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (!browserClient) {
    browserClient = createClient();
  }
  return browserClient;
}
