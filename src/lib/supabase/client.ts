"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";
import { getSupabasePublishableKey, getSupabaseUrl } from "./env";
import {
  ensureRuntimeSupabaseConfig,
  getRuntimeSupabaseConfig,
} from "./runtime-config";

export function createClient() {
  const runtime = getRuntimeSupabaseConfig();
  const url = getSupabaseUrl() || runtime?.url || "";
  const key = getSupabasePublishableKey() || runtime?.anonKey || "";
  if (!url || !key) {
    throw new Error(
      "Variables Supabase manquantes. Définissez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY dans .env.local"
    );
  }
  return createBrowserClient<Database>(url, key);
}

let browserClient: ReturnType<typeof createClient> | null = null;

export async function getSupabaseAsync() {
  if (!getSupabaseUrl() || !getSupabasePublishableKey()) {
    await ensureRuntimeSupabaseConfig();
    browserClient = null;
  }
  return getSupabase();
}

export function getSupabase() {
  if (!browserClient) {
    browserClient = createClient();
  }
  return browserClient;
}

export function resetSupabaseClient() {
  browserClient = null;
}
