import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import type { Database } from "../src/lib/supabase/types";
import {
  getSupabasePublishableKey,
  getSupabaseSecretKey,
  getSupabaseUrl,
} from "../src/lib/supabase/env";

config({ path: ".env.local" });
config({ path: ".env" });

const url = getSupabaseUrl();
const anonKey = getSupabasePublishableKey();
const serviceKey = getSupabaseSecretKey();
const baseUrl = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";

type Result = { name: string; ok: boolean; detail: string };

const results: Result[] = [];

function pass(name: string, detail: string) {
  results.push({ name, ok: true, detail });
  console.log(`✅ ${name}: ${detail}`);
}

function fail(name: string, detail: string) {
  results.push({ name, ok: false, detail });
  console.error(`❌ ${name}: ${detail}`);
}

function minimalPdf(): Buffer {
  const content = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 200 200]/Parent 2 0 R>>endobj
xref
0 4
0000000000 65535 f 
0000000009 00000 n 
0000000052 00000 n 
0000000101 00000 n 
trailer<</Size 4/Root 1 0 R>>
startxref
178
%%EOF`;
  return Buffer.from(content, "utf8");
}

async function testN8nWebhook() {
  const payload = {
    workflow_name: "smoke-test-workflow",
    event_type: "smoke_test",
    source: "scripts/smoke-test-flows.ts",
    at: new Date().toISOString(),
  };

  const res = await fetch(`${baseUrl}/api/n8n/webhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    fail("Webhook n8n", `HTTP ${res.status}`);
    return;
  }

  const admin = createClient<Database>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await admin
    .from("n8n_events")
    .select("id, workflow_name, event_type")
    .eq("workflow_name", "smoke-test-workflow")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    fail("Webhook n8n", error?.message ?? "Événement non trouvé en base");
    return;
  }

  pass("Webhook n8n", `événement ${data.id} enregistré (${data.event_type})`);
}

async function testCandidatureUpload() {
  const sb = createClient<Database>(url, anonKey);
  const { data: auth, error: authError } = await sb.auth.signInWithPassword({
    email: "kadiatou.konate@email.ml",
    password: "cand",
  });

  if (authError || !auth.user) {
    fail("Upload candidature", authError?.message ?? "Connexion candidat impossible");
    return;
  }

  const userId = auth.user.id;
  const legacyId = `CAND-SMOKE-${Date.now()}`;
  const tmpDir = join(process.cwd(), ".smoke-tmp");
  mkdirSync(tmpDir, { recursive: true });
  const pdfPath = join(tmpDir, "identite.pdf");
  writeFileSync(pdfPath, minimalPdf());

  const storagePath = `${userId}/${legacyId}/identite.pdf`;
  const fileBytes = readFileSync(pdfPath);

  const { error: uploadError } = await sb.storage
    .from("candidatures")
    .upload(storagePath, fileBytes, {
      upsert: true,
      contentType: "application/pdf",
    });

  if (uploadError) {
    fail("Upload candidature", uploadError.message);
    return;
  }

  const { data: signed, error: signError } = await sb.storage
    .from("candidatures")
    .createSignedUrl(storagePath, 120);

  if (signError || !signed?.signedUrl) {
    fail("Téléchargement signé candidature", signError?.message ?? "URL absente");
    return;
  }

  const dl = await fetch(signed.signedUrl);
  if (!dl.ok) {
    fail("Téléchargement signé candidature", `HTTP ${dl.status}`);
    return;
  }

  const { data: filiere } = await sb.from("filieres").select("id, nom").limit(1).maybeSingle();
  if (!filiere) {
    fail("Upload candidature", "Aucune filière disponible");
    return;
  }

  const pieces = [
    {
      nom: "Pièce d'identité",
      type: "PDF",
      taille: "0.2 Ko",
      present: true,
      storage_path: storagePath,
    },
    { nom: "Baccalauréat", type: "PDF", taille: "—", present: false },
    { nom: "Relevé de notes", type: "PDF", taille: "—", present: false },
    { nom: "Lettre de motivation", type: "PDF", taille: "—", present: false },
  ];

  const { error: insertError } = await sb.from("candidatures").insert({
    legacy_id: legacyId,
    nom: "Konaté",
    prenom: "Kadiatou",
    email: "kadiatou.konate@email.ml",
    telephone: "77000000",
    date_naissance: "2000-01-01",
    adresse: "Bamako",
    filiere_id: filiere.id,
    filiere_nom: filiere.nom,
    niveau: "1ère année",
    statut: "En attente",
    pieces,
    synthese_ia: "Test smoke",
    completude: 25,
    historique: [{ action: "Dossier soumis", date: new Date().toISOString(), auteur: "Kadiatou Konaté" }],
  });

  if (insertError) {
    fail("Upload candidature", insertError.message);
    return;
  }

  pass(
    "Upload candidature",
    `fichier ${storagePath} uploadé, URL signée OK, dossier ${legacyId} créé`
  );

  const admin = createClient<Database>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  await admin.storage.from("candidatures").remove([storagePath]);
  await admin.from("candidatures").delete().eq("legacy_id", legacyId);
}

async function testRapportPdf() {
  const sb = createClient<Database>(url, anonKey);
  const { error: authError } = await sb.auth.signInWithPassword({
    email: "amadou.toure@esgic.ml",
    password: "admin",
  });

  if (authError) {
    fail("Génération PDF rapport", authError.message);
    return;
  }

  const { data: sessionData } = await sb.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) {
    fail("Génération PDF rapport", "Jeton de session absent");
    return;
  }

  const periode = new Date().toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  const res = await fetch(`${baseUrl}/api/rapports`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ type: "Mensuel", periode }),
  });

  const body = (await res.json()) as { ok?: boolean; id?: string; taille?: string; error?: string };

  if (!res.ok || !body.ok || !body.id) {
    fail("Génération PDF rapport", body.error ?? `HTTP ${res.status}`);
    return;
  }

  const admin = createClient<Database>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: rapport, error: rapportError } = await admin
    .from("rapports")
    .select("fichier_path, taille_octets")
    .eq("legacy_id", body.id)
    .maybeSingle();

  if (rapportError || !rapport?.fichier_path) {
    fail("Génération PDF rapport", rapportError?.message ?? "fichier_path manquant");
    return;
  }

  const { data: file, error: dlError } = await admin.storage
    .from("rapports")
    .download(rapport.fichier_path);

  if (dlError || !file) {
    fail("Génération PDF rapport", dlError?.message ?? "PDF introuvable dans Storage");
    return;
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const isPdf = bytes.subarray(0, 4).toString() === "%PDF";
  if (!isPdf) {
    fail("Génération PDF rapport", "Le fichier stocké n'est pas un PDF valide");
    return;
  }

  pass(
    "Génération PDF rapport",
    `${body.id} généré (${body.taille}), ${bytes.byteLength} octets en Storage`
  );

  await admin.storage.from("rapports").remove([rapport.fichier_path]);
  await admin.from("rapports").delete().eq("legacy_id", body.id);
}

async function main() {
  console.log(`\n🔍 Smoke tests ESGIC → ${baseUrl}\n`);

  if (!url || !anonKey || !serviceKey) {
    console.error("Variables Supabase manquantes");
    process.exit(1);
  }

  await testN8nWebhook();
  await testCandidatureUpload();
  await testRapportPdf();

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} tests réussis\n`);
  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
