import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { getSupabaseSecretKey, getSupabaseUrl } from "@/lib/supabase/env";
import { requireAdminSession } from "@/lib/api/auth";

function adminClient() {
  return createClient<Database>(
    getSupabaseUrl(),
    getSupabaseSecretKey(),
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(req: Request) {
  try {
    const auth = await requireAdminSession();
    if ("error" in auth) return auth.error;

    const body = await req.json();
    const { email, password, nom, prenom, role, statut, inviteByEmail } = body;
    if (!email || !nom || !prenom || !role) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    const sb = adminClient();
    let userId: string;

    if (inviteByEmail) {
      const { data, error } = await sb.auth.admin.inviteUserByEmail(email, {
        data: { nom, prenom, role },
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      userId = data.user.id;
    } else {
      if (!password || String(password).length < 8) {
        return NextResponse.json(
          { error: "Mot de passe requis (8 caractères minimum)" },
          { status: 400 }
        );
      }
      const { data, error } = await sb.auth.admin.createUser({
        email,
        password: String(password),
        email_confirm: true,
        user_metadata: { nom, prenom, role },
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      userId = data.user.id;
    }

    await sb.from("profiles").upsert({
      id: userId,
      legacy_id: `U-${Date.now()}`,
      email,
      nom,
      prenom,
      role,
      statut: statut ?? "Actif",
    });

    await sb.rpc("log_audit", {
      p_action: "Création compte",
      p_cible: email,
      p_details: `Compte créé par ${auth.profile.prenom} ${auth.profile.nom} — rôle ${role}.`,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Erreur" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const auth = await requireAdminSession();
    if ("error" in auth) return auth.error;

    const id = new URL(req.url).searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Identifiant requis" }, { status: 400 });
    }

    const sb = adminClient();
    const { data: profile, error: lookupError } = await sb
      .from("profiles")
      .select("id, email, prenom, nom")
      .or(`legacy_id.eq.${id},id.eq.${id}`)
      .maybeSingle();
    if (lookupError) {
      return NextResponse.json({ error: lookupError.message }, { status: 400 });
    }
    if (!profile) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }
    if (profile.id === auth.profile.id) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas supprimer votre propre compte." },
        { status: 400 }
      );
    }

    const { error } = await sb.auth.admin.deleteUser(profile.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    await sb.rpc("log_audit", {
      p_action: "Suppression compte",
      p_cible: `${profile.prenom} ${profile.nom}`,
      p_details: `Compte supprimé par ${auth.profile.prenom} ${auth.profile.nom}.`,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Erreur" }, { status: 500 });
  }
}
