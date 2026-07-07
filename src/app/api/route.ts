import { NextResponse } from "next/server";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/supabase/env";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    version: process.env.npm_package_version ?? "0.2.0",
    supabase: Boolean(getSupabaseUrl() && getSupabasePublishableKey()),
  });
}
