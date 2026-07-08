import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { getSupabaseSecretKey, getSupabaseUrl } from "@/lib/supabase/env";
import { requireSession } from "@/lib/api/auth";
import { fetchIntegrations } from "@/lib/ia/analyse";
import { fetchNotificationsConfig, sendN8nEvent } from "@/lib/api/notify-n8n";
import { legacyOrIdFilter } from "@/lib/legacy-id";
import { logAuditServer } from "@/lib/api/audit";
import { canTraiterDossier, type ParametresNotifications } from "@/components/dashboard/data";

function adminClient() {
  return createClient<Database>(
    getSupabaseUrl(),
    getSupabaseSecretKey(),
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// Chaque type d'événement métier correspond à un des 3 interrupteurs de
// Paramètres → Notifications — jusqu'ici stockés mais jamais lus nulle part.
const EVENT_TOGGLE = {
  candidature_soumise: "emailConfirmation",
  candidature_traitee: "validationRejet",
} as const satisfies Record<string, keyof ParametresNotifications>;

type EventType = keyof typeof EVENT_TOGGLE;

export async function POST(req: Request) {
  try {
    const auth = await requireSession();
    if ("error" in auth) return auth.error;

    const body = await req.json();
    const type = String(body.type ?? "") as EventType;
    const candidatureId = String(body.candidatureId ?? "");
    if (!(type in EVENT_TOGGLE) || !candidatureId || !/^[a-zA-Z0-9_-]+$/.test(candidatureId)) {
      return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
    }

    // Seul un admin peut faire passer un dossier à Validé/Rejeté (F5.1) —
    // la notification qui en découle suit la même règle.
    if (type === "candidature_traitee" && !canTraiterDossier(auth.profile.role)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const admin = adminClient();
    const { data: row, error } = await admin
      .from("candidatures")
      .select("legacy_id, nom, prenom, email, statut, filiere_nom")
      .or(legacyOrIdFilter(candidatureId))
      .maybeSingle();
    if (error || !row) {
      return NextResponse.json({ error: "Candidature introuvable" }, { status: 404 });
    }

    const [integrations, notifications] = await Promise.all([
      fetchIntegrations(admin),
      fetchNotificationsConfig(admin),
    ]);
    const n8nUrl = integrations.n8nUrl?.trim();
    const toggleKey = EVENT_TOGGLE[type];
    const enabled = Boolean(notifications[toggleKey]) && Boolean(n8nUrl);

    if (!enabled) {
      return NextResponse.json({ ok: true, sent: false });
    }

    const sent = await sendN8nEvent(n8nUrl!, type, {
      candidature: {
        id: row.legacy_id,
        nom: row.nom,
        prenom: row.prenom,
        email: row.email,
        statut: row.statut,
        filiere: row.filiere_nom,
      },
    });

    if (sent) {
      await logAuditServer(
        admin,
        `${auth.profile.prenom} ${auth.profile.nom}`,
        type === "candidature_soumise"
          ? "Notification confirmation candidature"
          : "Notification décision candidature",
        row.legacy_id ?? candidatureId,
        `Événement "${type}" envoyé à n8n pour ${row.prenom} ${row.nom}.`
      );
    }

    return NextResponse.json({ ok: true, sent });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur" },
      { status: 500 }
    );
  }
}
