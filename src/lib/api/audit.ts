import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// log_audit() (RPC) résout l'auteur via auth.uid(), qui est TOUJOURS null
// pour un appel fait avec la clé service-role (routes API) — chaque action
// serveur se retrouvait donc journalisée comme "Système" au lieu du vrai
// admin/responsable qui l'a déclenchée. Le client service-role contourne de
// toute façon la RLS, donc un insert direct avec l'auteur résolu côté route
// est à la fois plus simple et plus correct.
export async function logAuditServer(
  admin: SupabaseClient<Database>,
  utilisateur: string,
  action: string,
  cible: string,
  details: string
) {
  await admin.from("audit_log").insert({ utilisateur, action, cible, details });
}
