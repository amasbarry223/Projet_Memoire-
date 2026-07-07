import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import type { Database } from "../src/lib/supabase/types";
import { getSupabaseSecretKey, getSupabaseUrl } from "../src/lib/supabase/env";

config({ path: ".env.local" });
config({ path: ".env" });

const url = getSupabaseUrl();
const serviceKey = getSupabaseSecretKey();

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient<Database>(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const users = [
  { legacy_id: "U-1", email: "amadou.toure@esgic.ml", password: "admin", role: "admin", nom: "Touré", prenom: "Amadou" },
  { legacy_id: "U-2", email: "rokia.keita@esgic.ml", password: "resp", role: "responsable", nom: "Keïta", prenom: "Rokia" },
  { legacy_id: "U-3", email: "d.coulibaly@esgic.ml", password: "ens", role: "enseignant", nom: "Coulibaly", prenom: "Drissa", enseignant_legacy: "ENS-1" },
  { legacy_id: "U-4", email: "a.traore@esgic.ml", password: "demo123", role: "enseignant", nom: "Traoré", prenom: "Aminata", enseignant_legacy: "ENS-2" },
  { legacy_id: "U-5", email: "moussa.diabate@etu.ml", password: "etu", role: "etudiant", nom: "Diabaté", prenom: "Moussa", etudiant_legacy: "ETU-1" },
  { legacy_id: "U-6", email: "k.sangare@etu.ml", password: "demo123", role: "etudiant", nom: "Sangaré", prenom: "Korotoumou", etudiant_legacy: "ETU-5" },
  { legacy_id: "U-7", email: "kadiatou.konate@email.ml", password: "cand", role: "candidat", nom: "Konaté", prenom: "Kadiatou" },
  { legacy_id: "U-8", email: "s.sidibe@esgic.ml", password: "demo123", role: "enseignant", nom: "Sidibé", prenom: "Salimata", enseignant_legacy: "ENS-4", statut: "Désactivé" },
] as const;

async function main() {
  for (const u of users) {
    const { data: existing } = await supabase.auth.admin.listUsers();
    const found = existing?.users?.find((x) => x.email?.toLowerCase() === u.email.toLowerCase());

    let userId = found?.id;
    if (!userId) {
      const { data, error } = await supabase.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { nom: u.nom, prenom: u.prenom, role: u.role },
      });
      if (error) {
        console.error(`Failed to create ${u.email}:`, error.message);
        continue;
      }
      userId = data.user.id;
      console.log(`Created auth user: ${u.email}`);
    } else {
      console.log(`Auth user exists: ${u.email}`);
    }

    await supabase.from("profiles").upsert({
      id: userId,
      legacy_id: u.legacy_id,
      email: u.email,
      nom: u.nom,
      prenom: u.prenom,
      role: u.role,
      statut: "statut" in u ? u.statut : "Actif",
    });

    if ("enseignant_legacy" in u && u.enseignant_legacy) {
      await supabase
        .from("enseignants")
        .update({ profile_id: userId, email: u.email })
        .eq("legacy_id", u.enseignant_legacy);
    }
    if ("etudiant_legacy" in u && u.etudiant_legacy) {
      await supabase
        .from("etudiants")
        .update({ profile_id: userId, email: u.email })
        .eq("legacy_id", u.etudiant_legacy);
    }
  }
  console.log("Seed auth complete.");
}

main().catch(console.error);
