import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type ProfileRole = Database["public"]["Enums"]["app_role"];

export type AuthProfile = {
  id: string;
  role: ProfileRole;
  prenom: string;
  nom: string;
  email: string;
};

export async function requireSession() {
  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    return { error: NextResponse.json({ error: "Non authentifié" }, { status: 401 }) };
  }
  const { data: profile } = await sb
    .from("profiles")
    .select("id, role, prenom, nom, email")
    .eq("id", user.id)
    .single();
  if (!profile) {
    return { error: NextResponse.json({ error: "Profil introuvable" }, { status: 403 }) };
  }
  return { sb, user, profile: profile as AuthProfile };
}

export async function requireAdminSession() {
  const result = await requireSession();
  if ("error" in result) return result;
  if (result.profile.role !== "admin") {
    return { error: NextResponse.json({ error: "Accès refusé" }, { status: 403 }) };
  }
  return result;
}

export async function requireRoleSession(roles: ProfileRole[]) {
  const result = await requireSession();
  if ("error" in result) return result;
  if (!roles.includes(result.profile.role)) {
    return { error: NextResponse.json({ error: "Accès refusé" }, { status: 403 }) };
  }
  return result;
}
