import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { getSupabaseSecretKey, getSupabaseUrl } from "@/lib/supabase/env";

function adminClient() {
  return createClient<Database>(
    getSupabaseUrl(),
    getSupabaseSecretKey(),
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(req: Request) {
  try {
    const expectedSecret = process.env.N8N_WEBHOOK_SECRET;
    if (!expectedSecret || req.headers.get("x-n8n-secret") !== expectedSecret) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const workflowName = String(body.workflow_name ?? body.workflow ?? "workflow");
    const eventType = String(body.event_type ?? body.event ?? "execution");

    const admin = adminClient();
    const { error } = await admin.from("n8n_events").insert({
      workflow_name: workflowName,
      event_type: eventType,
      payload: body,
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur" },
      { status: 500 }
    );
  }
}
