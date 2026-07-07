import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api/auth";
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

export async function GET(req: Request) {
  try {
    const auth = await requireSession();
    if ("error" in auth) return auth.error;

    const path = new URL(req.url).searchParams.get("path");
    const bucket = new URL(req.url).searchParams.get("bucket") ?? "candidatures";
    if (!path) {
      return NextResponse.json({ error: "Chemin requis" }, { status: 400 });
    }

    const isAdmin = auth.profile.role === "admin";
    const isResponsable = auth.profile.role === "responsable";
    const isOwner = path.startsWith(`${auth.user.id}/`);

    if (bucket === "candidatures" && !isAdmin && !isOwner) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    } else if (bucket === "rapports" && !isAdmin && !isResponsable) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    } else if (bucket !== "candidatures" && bucket !== "rapports") {
      return NextResponse.json({ error: "Bucket invalide" }, { status: 403 });
    }

    const admin = adminClient();
    const { data, error } = await admin.storage.from(bucket).createSignedUrl(path, 900);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ url: data.signedUrl });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur" },
      { status: 500 }
    );
  }
}
