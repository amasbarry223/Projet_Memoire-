import { NextResponse } from "next/server";
import {
  getSupabasePublishableKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "@/lib/supabase/env";

/** Expose la config publique Supabase (runtime serveur) au client déployé. */
export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        configured: false,
        error:
          "Variables Supabase manquantes côté serveur (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY).",
      },
      { status: 503 }
    );
  }

  return NextResponse.json({
    configured: true,
    url: getSupabaseUrl(),
    anonKey: getSupabasePublishableKey(),
  });
}
