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
    const body = await req.json();
    const { email, password, nom, prenom, role, statut } = body;
    if (!email || !password || !nom || !prenom || !role) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }
    const sb = adminClient();
    const { data, error } = await sb.auth.admin.createUser({
      email,
      password: password || "demo123",
      email_confirm: true,
      user_metadata: { nom, prenom, role },
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    await sb.from("profiles").upsert({
      id: data.user.id,
      legacy_id: `U-${Date.now()}`,
      email,
      nom,
      prenom,
      role,
      statut: statut ?? "Actif",
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Erreur" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Identifiant requis" }, { status: 400 });
    }
    const sb = adminClient();
    const { data: profile, error: lookupError } = await sb
      .from("profiles")
      .select("id")
      .or(`legacy_id.eq.${id},id.eq.${id}`)
      .maybeSingle();
    if (lookupError) {
      return NextResponse.json({ error: lookupError.message }, { status: 400 });
    }
    if (!profile) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }
    const { error } = await sb.auth.admin.deleteUser(profile.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Erreur" }, { status: 500 });
  }
}
