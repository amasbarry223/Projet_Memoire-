"use client";

import { create } from "zustand";
import { getSupabase, getSupabaseAsync } from "@/lib/supabase/client";
import type { Json } from "@/lib/supabase/types";
import { legacyOrIdFilter } from "@/lib/legacy-id";
import {
  mapAbsence,
  mapAlerte,
  mapAudit,
  mapCandidature,
  mapEnseignant,
  mapEtudiant,
  mapFiliere,
  mapNote,
} from "@/lib/mappers";
import type {
  Absence,
  AlerteIA,
  AppParametres,
  Candidature,
  EntreeAudit,
  Enseignant,
  Etudiant,
  Filiere,
  Note,
  Rapport,
  Utilisateur,
  StatutDossier,
  ActionHistorique,
} from "@/components/dashboard/data";
import { defaultParametres as DEFAULT_PARAMETRES } from "@/components/dashboard/data";
import { useAuthStore } from "@/lib/auth-store";
import { isSupabaseConfigured, isSupabaseConfiguredWithRuntime } from "@/lib/supabase/env";
import {
  ensureRuntimeSupabaseConfig,
  getRuntimeSupabaseConfig,
} from "@/lib/supabase/runtime-config";
import {
  uploadCandidaturePiece,
  deleteStorageFiles,
  CANDIDATURES_BUCKET,
} from "@/lib/supabase/storage";

interface DataState {
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  etudiants: Etudiant[];
  enseignants: Enseignant[];
  candidatures: Candidature[];
  utilisateurs: Utilisateur[];
  filieres: Filiere[];
  alertes: AlerteIA[];
  audit: EntreeAudit[];
  notes: Note[];
  absences: Absence[];
  rapports: Rapport[];
  inscriptionsParMois: { mois: string; inscriptions: number }[];
  absentéismeParMois: { mois: string; taux: number }[];
  parametres: AppParametres;

  initialize: () => Promise<void>;
  refresh: () => Promise<void>;
  saveParametres: (p: AppParametres) => Promise<void>;

  addEtudiant: (e: Omit<Etudiant, "id">) => Promise<void>;
  updateEtudiant: (id: string, e: Partial<Etudiant>) => Promise<void>;
  deleteEtudiant: (id: string) => Promise<void>;

  addEnseignant: (e: Omit<Enseignant, "id">) => Promise<void>;
  updateEnseignant: (id: string, e: Partial<Enseignant>) => Promise<void>;
  deleteEnseignant: (id: string) => Promise<void>;

  addUtilisateur: (u: Omit<Utilisateur, "id" | "derniereConnexion"> & { password?: string; inviteByEmail?: boolean }) => Promise<void>;
  updateUtilisateur: (id: string, u: Partial<Utilisateur>) => Promise<void>;
  deleteUtilisateur: (id: string) => Promise<{ ok: boolean; error?: string }>;
  reloadUtilisateurs: () => Promise<void>;

  addFiliere: (f: { nom: string; code: string; description: string }) => Promise<void>;
  updateFiliere: (id: string, f: { nom: string; code: string; description: string }) => Promise<void>;
  addClasse: (filiereId: string, c: { nom: string; niveau: string }) => Promise<void>;
  updateClasse: (filiereId: string, classeId: string, c: { nom: string; niveau: string }) => Promise<void>;
  addMatiere: (filiereId: string, m: { nom: string; coefficient: number }) => Promise<void>;
  updateMatiere: (filiereId: string, matiereId: string, m: { nom: string; coefficient: number }) => Promise<void>;
  deleteFiliere: (id: string) => Promise<void>;
  deleteClasse: (filiereId: string, classeId: string) => Promise<void>;
  deleteMatiere: (filiereId: string, matiereId: string) => Promise<void>;

  traiterDossier: (
    id: string,
    action: "valider" | "rejeter" | "incomplet",
    options?: { motif?: string; piecesManquantes?: string[] }
  ) => Promise<void>;

  traiterAlerte: (
    id: string,
    nouveauStatut: "Prise en charge" | "Clôturée",
    commentaire?: string
  ) => Promise<void>;

  addNote: (n: Note) => Promise<void>;
  updateNote: (id: string, n: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  addAbsence: (a: Omit<Absence, "date" | "dateIso"> & { date: string }) => Promise<void>;
  updateAbsence: (id: string, a: Partial<Absence>) => Promise<void>;
  deleteAbsence: (id: string) => Promise<void>;
  addCandidature: (
    c: {
      nom: string;
      prenom: string;
      email: string;
      telephone: string;
      dateNaissance: string;
      adresse: string;
      filiereId: string;
      niveau: string;
    },
    files?: Record<string, File>
  ) => Promise<string>;
  deleteCandidature: (id: string) => Promise<void>;
  analyseCandidature: (id: string) => Promise<void>;
  addAlerte: (a: Omit<AlerteIA, "id" | "date" | "indicatorColor">) => Promise<void>;
  deleteAlerte: (id: string) => Promise<void>;
  genererAlertesIA: () => Promise<{ ok: boolean; created?: number; error?: string }>;
  deleteRapport: (id: string) => Promise<void>;
  reloadRapports: () => Promise<void>;
  downloadSignedUrl: (bucket: string, path: string) => Promise<string>;
  genererRapport: (options: {
    type: Rapport["type"];
    periode: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  logAction: (e: Omit<EntreeAudit, "id" | "date">) => Promise<void>;
}

function now() {
  const d = new Date();
  return `${d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })} ${d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
}

function currentAuthor(): string {
  const s = useAuthStore.getState().session;
  return s ? `${s.prenom} ${s.nom}` : "Système";
}

async function logAudit(action: string, cible: string, details: string) {
  const sb = await getSupabaseAsync();
  await sb.rpc("log_audit", { p_action: action, p_cible: cible, p_details: details });
}

async function fetchUtilisateursFromApi(): Promise<Utilisateur[]> {
  const res = await fetch("/api/users", { credentials: "same-origin" });
  const payload = (await res.json()) as {
    error?: string;
    utilisateurs?: Utilisateur[];
  };
  if (!res.ok) {
    throw new Error(payload.error ?? "Impossible de charger les utilisateurs");
  }
  return payload.utilisateurs ?? [];
}

async function fetchRapportsFromApi(): Promise<Rapport[]> {
  const res = await fetch("/api/rapports", { credentials: "same-origin" });
  const payload = (await res.json()) as {
    error?: string;
    rapports?: Rapport[];
  };
  if (!res.ok) {
    throw new Error(payload.error ?? "Impossible de charger les rapports");
  }
  return payload.rapports ?? [];
}

function canManageRapports(role: string | undefined) {
  return role === "admin" || role === "responsable";
}

const MOIS_ABBR = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

// "Évolution des inscriptions" venait d'une table dashboard_charts semée
// une fois à la création du projet et jamais mise à jour depuis — remplacé
// par un vrai comptage des candidatures de l'année en cours, par mois.
function computeInscriptionsParMois(rows: { date_soumission: string }[]) {
  const year = new Date().getFullYear();
  const counts = new Array(12).fill(0);
  for (const r of rows) {
    const d = new Date(r.date_soumission);
    if (d.getFullYear() === year) counts[d.getMonth()]++;
  }
  return MOIS_ABBR.map((mois, i) => ({ mois, inscriptions: counts[i] }));
}

// Même limite que pour l'assiduité : pas de notion de "nombre de séances"
// en base pour un vrai taux d'absentéisme. Approximation : absences non
// justifiées du mois rapportées à l'effectif actif du moment.
function computeAbsenteismeParMois(
  rows: { date_absence: string; justifiee: boolean }[],
  effectifActif: number
) {
  const year = new Date().getFullYear();
  const counts = new Array(12).fill(0);
  for (const r of rows) {
    if (r.justifiee) continue;
    const d = new Date(r.date_absence);
    if (d.getFullYear() === year) counts[d.getMonth()]++;
  }
  const denom = effectifActif > 0 ? effectifActif : 1;
  return MOIS_ABBR.map((mois, i) => ({
    mois,
    taux: Math.round((counts[i] / denom) * 1000) / 10,
  }));
}

async function resolveFiliereUuid(legacyOrUuid: string) {
  const sb = getSupabase();
  const { data } = await sb.from("filieres").select("id").or(legacyOrIdFilter(legacyOrUuid)).maybeSingle();
  return data?.id ?? null;
}

async function resolveClasseUuid(legacyOrUuid: string) {
  const sb = getSupabase();
  const { data } = await sb.from("classes").select("id, nom, filiere_id, filieres(nom)").or(legacyOrIdFilter(legacyOrUuid)).maybeSingle();
  return data;
}

// Un même nom de matière/classe peut exister dans plusieurs filières (ex.
// "Algorithmique"). On ne scope la recherche qu'aux filières correspondant
// aux classes affectées à l'enseignant, et on déduplique par nom, pour
// éviter d'insérer deux fois enseignant_matieres/enseignant_classes pour
// une même sélection faite dans le formulaire (qui est une liste plate,
// sans notion de filière).
async function assignMatieresEtClasses(
  sb: ReturnType<typeof getSupabase>,
  enseignantId: string,
  matieres: string[],
  classes: string[],
  filieres: Filiere[]
) {
  const filieresConcernees = classes.length > 0
    ? filieres.filter((f) => f.classes.some((c) => classes.includes(c.nom)))
    : filieres;

  const matiereNomsInseres = new Set<string>();
  const classeNomsInseres = new Set<string>();

  for (const filiere of filieresConcernees) {
    for (const m of filiere.matieres.filter((x) => matieres.includes(x.nom))) {
      if (matiereNomsInseres.has(m.nom)) continue;
      const { data: mat } = await sb.from("matieres").select("id").or(legacyOrIdFilter(m.id)).maybeSingle();
      if (mat) {
        matiereNomsInseres.add(m.nom);
        await sb.from("enseignant_matieres").insert({ enseignant_id: enseignantId, matiere_id: mat.id });
      }
    }
    for (const c of filiere.classes.filter((x) => classes.includes(x.nom))) {
      if (classeNomsInseres.has(c.nom)) continue;
      const { data: cl } = await sb.from("classes").select("id").or(legacyOrIdFilter(c.id)).maybeSingle();
      if (cl) {
        classeNomsInseres.add(c.nom);
        await sb.from("enseignant_classes").insert({ enseignant_id: enseignantId, classe_id: cl.id });
      }
    }
  }
}

async function resolveEtudiantUuid(legacyOrUuid: string) {
  const sb = getSupabase();
  const { data } = await sb.from("etudiants").select("id").or(legacyOrIdFilter(legacyOrUuid)).maybeSingle();
  return data?.id ?? null;
}

// Compare le nom complet plutôt que de deviner où « prénom » s'arrête et où
// « nom » commence — un split naïf sur le premier espace casse pour les
// prénoms composés (ex. « Jean Paul Dupont »).
async function findEtudiantByName(name: string) {
  const target = name.trim();
  if (!target) return null;
  const client = useDataStore
    .getState()
    .etudiants.find((e) => `${e.prenom} ${e.nom}` === target);
  if (!client) return null;
  return resolveEtudiantUuid(client.id);
}

function parseParametresRows(rows: { key: string; value: unknown }[]): AppParametres {
  const map = new Map(rows.map((r) => [r.key, r.value]));
  const pick = <K extends keyof AppParametres>(key: K): AppParametres[K] => {
    const val = map.get(key);
    return (val && typeof val === "object" ? val : DEFAULT_PARAMETRES[key]) as AppParametres[K];
  };
  return {
    etablissement: pick("etablissement"),
    securite: pick("securite"),
    notifications: pick("notifications"),
    integrations: pick("integrations"),
  };
}

async function ensureParametresDefaults(sb: ReturnType<typeof getSupabase>) {
  const { data } = await sb.from("parametres").select("key");
  if ((data?.length ?? 0) > 0) return;
  const rows = [
    { key: "etablissement", value: DEFAULT_PARAMETRES.etablissement },
    { key: "securite", value: DEFAULT_PARAMETRES.securite },
    { key: "notifications", value: DEFAULT_PARAMETRES.notifications },
    { key: "integrations", value: DEFAULT_PARAMETRES.integrations },
  ];
  await sb.from("parametres").insert(
    rows.map((r) => ({ key: r.key, value: r.value as Json }))
  );
}

let initializeDataPromise: Promise<void> | null = null;

export const useDataStore = create<DataState>((set, get) => ({
  isLoading: false,
  isInitialized: false,
  error: null,
  etudiants: [],
  enseignants: [],
  candidatures: [],
  utilisateurs: [],
  filieres: [],
  alertes: [],
  audit: [],
  notes: [],
  absences: [],
  rapports: [],
  inscriptionsParMois: [],
  absentéismeParMois: [],
  parametres: DEFAULT_PARAMETRES,

  initialize: async () => {
    if (get().isInitialized) return;
    if (initializeDataPromise) {
      await initializeDataPromise;
      return;
    }

    initializeDataPromise = (async () => {
      set({ isLoading: true, error: null });
      try {
        if (!isSupabaseConfigured()) {
          await ensureRuntimeSupabaseConfig();
        }
        if (!isSupabaseConfiguredWithRuntime(getRuntimeSupabaseConfig())) {
          throw new Error(
            "Configuration Supabase manquante. Vérifiez les variables d'environnement."
          );
        }
        await get().refresh();
        set({ isInitialized: true });
      } catch (e) {
        set({ error: e instanceof Error ? e.message : "Erreur de chargement" });
        initializeDataPromise = null;
      } finally {
        set({ isLoading: false });
      }
    })();

    await initializeDataPromise;
  },

  refresh: async () => {
    const sb = await getSupabaseAsync();
    const session = useAuthStore.getState().session;
    const isAdmin = session?.role === "admin";
    await ensureParametresDefaults(sb);
    const queries = [
      sb.from("filieres").select("*, classes(*), matieres(*)").order("nom"),
      sb.from("etudiants").select("*, classes(nom, filieres(nom))").order("nom"),
      sb.from("enseignants").select("*, enseignant_matieres(matiere_id, matieres(nom)), enseignant_classes(classe_id, classes(nom))").order("nom"),
      sb.from("candidatures").select("*").order("date_soumission", { ascending: false }),
      isAdmin ? fetchUtilisateursFromApi() : Promise.resolve([] as Utilisateur[]),
      sb.from("alertes").select("*, etudiants(prenom, nom)").order("date_alerte", { ascending: false }),
      sb.from("audit_log").select("*").order("created_at", { ascending: false }),
      sb.from("notes").select("*, etudiants(prenom, nom)").order("created_at", { ascending: false }),
      sb.from("absences").select("*, etudiants(prenom, nom)").order("date_absence", { ascending: false }),
      canManageRapports(session?.role)
        ? fetchRapportsFromApi()
        : Promise.resolve([] as Rapport[]),
      isAdmin
        ? sb.from("parametres").select("key, value")
        : Promise.resolve({ data: null, error: null }),
    ] as const;
    const [filieresRes, etudiantsRes, enseignantsRes, candidaturesRes, utilisateurs, alertesRes, auditRes, notesRes, absencesRes, rapports, parametresRes] = await Promise.all(queries);

    const effectifActif = (etudiantsRes.data ?? []).filter((e) => e.statut === "Actif").length;

    set({
      filieres: (filieresRes.data ?? []).map((f) => mapFiliere(f as never)),
      etudiants: (etudiantsRes.data ?? []).map((e) => mapEtudiant(e as never)),
      enseignants: (enseignantsRes.data ?? []).map((e) => mapEnseignant(e as never)),
      candidatures: (candidaturesRes.data ?? []).map(mapCandidature),
      utilisateurs,
      alertes: (alertesRes.data ?? []).map((a) => mapAlerte(a as never)),
      audit: (auditRes.data ?? []).map(mapAudit),
      notes: (notesRes.data ?? []).map((n) => mapNote(n as never)),
      absences: (absencesRes.data ?? []).map((a) => mapAbsence(a as never)),
      rapports,
      inscriptionsParMois: computeInscriptionsParMois(
        (candidaturesRes.data ?? []) as { date_soumission: string }[]
      ),
      absentéismeParMois: computeAbsenteismeParMois(
        (absencesRes.data ?? []) as { date_absence: string; justifiee: boolean }[],
        effectifActif
      ),
      parametres: isAdmin && parametresRes.data
        ? parseParametresRows((parametresRes.data ?? []) as { key: string; value: unknown }[])
        : get().parametres ?? DEFAULT_PARAMETRES,
    });
  },

  saveParametres: async (p) => {
    const sb = getSupabase();
    const rows = [
      { key: "etablissement", value: p.etablissement },
      { key: "securite", value: p.securite },
      { key: "notifications", value: p.notifications },
      { key: "integrations", value: p.integrations },
    ];
    for (const row of rows) {
      const { error } = await sb.from("parametres").upsert(
        { key: row.key, value: row.value as Json },
        { onConflict: "key" }
      );
      if (error) throw error;
    }
    await logAudit("Mise à jour paramètres", "Configuration globale", "Paramètres établissement enregistrés.");
    set({ parametres: p });
  },

  addEtudiant: async (e) => {
    const sb = getSupabase();
    const classe = await resolveClasseUuid(e.classe);
    const legacy_id = `ETU-${Date.now()}`;
    const { error } = await sb.from("etudiants").insert({
      legacy_id,
      matricule: e.matricule,
      nom: e.nom,
      prenom: e.prenom,
      email: e.email,
      classe_id: classe?.id ?? null,
      moyenne: e.moyenne,
      assiduite: e.assiduite,
      statut: e.statut,
    });
    if (error) throw error;
    await logAudit("Création étudiant", `${e.prenom} ${e.nom}`, `Étudiant ajouté — filière ${e.filiere}, classe ${e.classe}.`);
    await get().refresh();
  },

  updateEtudiant: async (id, e) => {
    const sb = getSupabase();
    const classe = e.classe ? await resolveClasseUuid(e.classe) : null;
    const { error } = await sb.from("etudiants").update({
      matricule: e.matricule,
      nom: e.nom,
      prenom: e.prenom,
      email: e.email,
      classe_id: classe?.id,
      moyenne: e.moyenne,
      assiduite: e.assiduite,
      statut: e.statut,
    }).or(legacyOrIdFilter(id));
    if (error) throw error;
    await logAudit("Modification étudiant", id, "Fiche étudiant mise à jour.");
    await get().refresh();
  },

  deleteEtudiant: async (id) => {
    const sb = getSupabase();
    const etu = get().etudiants.find((x) => x.id === id);
    const { error } = await sb.from("etudiants").delete().or(legacyOrIdFilter(id));
    if (error) throw error;
    await logAudit("Suppression étudiant", etu ? `${etu.prenom} ${etu.nom} (${etu.matricule})` : id, "Étudiant supprimé de l'établissement.");
    await get().refresh();
  },

  addEnseignant: async (e) => {
    const sb = getSupabase();
    const legacy_id = `ENS-${Date.now()}`;
    const { data, error } = await sb.from("enseignants").insert({
      legacy_id,
      nom: e.nom,
      prenom: e.prenom,
      email: e.email,
      statut: e.statut,
    }).select("id").single();
    if (error || !data) throw error;
    await assignMatieresEtClasses(sb, data.id, e.matieres, e.classes, get().filieres);
    await logAudit("Création enseignant", `${e.prenom} ${e.nom}`, `Enseignant ajouté — ${e.matieres.length} matière(s), ${e.classes.length} classe(s).`);
    await get().refresh();
  },

  updateEnseignant: async (id, e) => {
    const sb = getSupabase();
    const { data: ens, error: findError } = await sb.from("enseignants").select("id").or(legacyOrIdFilter(id)).single();
    if (findError || !ens) throw findError ?? new Error("Enseignant introuvable");
    const { error: updateError } = await sb.from("enseignants").update({
      nom: e.nom,
      prenom: e.prenom,
      email: e.email,
      statut: e.statut,
    }).eq("id", ens.id);
    if (updateError) throw updateError;
    if (e.matieres || e.classes) {
      await sb.from("enseignant_matieres").delete().eq("enseignant_id", ens.id);
      await sb.from("enseignant_classes").delete().eq("enseignant_id", ens.id);
      const matieres = e.matieres ?? get().enseignants.find((x) => x.id === id)?.matieres ?? [];
      const classes = e.classes ?? get().enseignants.find((x) => x.id === id)?.classes ?? [];
      await assignMatieresEtClasses(sb, ens.id, matieres, classes, get().filieres);
    }
    await logAudit("Modification enseignant", id, "Fiche enseignant mise à jour.");
    await get().refresh();
  },

  deleteEnseignant: async (id) => {
    const sb = getSupabase();
    const ens = get().enseignants.find((x) => x.id === id);
    const { error } = await sb.from("enseignants").delete().or(legacyOrIdFilter(id));
    if (error) throw error;
    await logAudit("Suppression enseignant", ens ? `${ens.prenom} ${ens.nom}` : id, "Enseignant supprimé, affectations retirées.");
    await get().refresh();
  },

  // Aucune vérification de rôle côté client ici : /api/users est déjà
  // protégé par requireAdminSession() côté serveur. Un garde-fou client basé
  // sur session.role pourrait échouer silencieusement (no-op) si ce cache
  // est momentanément désynchronisé du rôle réel en base — la route reste
  // la seule source de vérité, une réponse 403 remonte ici normalement.
  reloadUtilisateurs: async () => {
    const utilisateurs = await fetchUtilisateursFromApi();
    set({ utilisateurs });
  },

  addUtilisateur: async (u) => {
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(u),
    });
    const payload = (await res.json()) as { error?: string };
    if (!res.ok) {
      throw new Error(payload.error ?? "Échec création utilisateur");
    }
    // La route /api/users journalise déjà la création côté serveur — un
    // second appel ici créerait une entrée d'audit dupliquée.
    await get().reloadUtilisateurs();
  },

  updateUtilisateur: async (id, u) => {
    const res = await fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ id, ...u }),
    });
    const payload = (await res.json()) as { error?: string };
    if (!res.ok) {
      throw new Error(payload.error ?? "Échec modification utilisateur");
    }
    await get().reloadUtilisateurs();
  },

  deleteUtilisateur: async (id) => {
    const session = useAuthStore.getState().session;
    const usr = get().utilisateurs.find((x) => x.id === id);
    if (session && usr && usr.email === session.email) {
      return { ok: false, error: "Vous ne pouvez pas supprimer votre propre compte (R2)." };
    }
    const res = await fetch(`/api/users?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { ok: false, error: (err as { error?: string }).error ?? "Échec suppression" };
    }
    // La route DELETE /api/users journalise déjà côté serveur.
    await get().reloadUtilisateurs();
    return { ok: true };
  },

  addFiliere: async (f) => {
    const sb = getSupabase();
    const legacy_id = `FIL-${Date.now()}`;
    const { error } = await sb.from("filieres").insert({ legacy_id, nom: f.nom, code: f.code, description: f.description });
    if (error) throw error;
    await logAudit("Création filière", f.nom, `Filière créée (code ${f.code}).`);
    await get().refresh();
  },

  updateFiliere: async (id, f) => {
    const sb = getSupabase();
    const { error } = await sb.from("filieres").update({ nom: f.nom, code: f.code, description: f.description }).or(legacyOrIdFilter(id));
    if (error) throw error;
    await logAudit("Modification filière", f.nom, `Filière mise à jour (code ${f.code}).`);
    await get().refresh();
  },

  addClasse: async (filiereId, c) => {
    const sb = getSupabase();
    const filiereUuid = await resolveFiliereUuid(filiereId);
    if (!filiereUuid) return;
    const legacy_id = `CL-${Date.now()}`;
    const { error } = await sb.from("classes").insert({ legacy_id, filiere_id: filiereUuid, nom: c.nom, niveau: c.niveau });
    if (error) throw error;
    await logAudit("Création classe", c.nom, `Classe ajoutée à la filière.`);
    await get().refresh();
  },

  updateClasse: async (filiereId, classeId, c) => {
    const sb = getSupabase();
    const { error } = await sb.from("classes").update({ nom: c.nom, niveau: c.niveau }).or(legacyOrIdFilter(classeId));
    if (error) throw error;
    await logAudit("Modification classe", c.nom, `Classe mise à jour dans la filière.`);
    await get().refresh();
  },

  addMatiere: async (filiereId, m) => {
    const sb = getSupabase();
    const filiereUuid = await resolveFiliereUuid(filiereId);
    if (!filiereUuid) return;
    const legacy_id = `MA-${Date.now()}`;
    const { error } = await sb.from("matieres").insert({ legacy_id, filiere_id: filiereUuid, nom: m.nom, coefficient: m.coefficient });
    if (error) throw error;
    await logAudit("Création matière", m.nom, `Matière ajoutée (coef. ${m.coefficient}).`);
    await get().refresh();
  },

  updateMatiere: async (filiereId, matiereId, m) => {
    const sb = getSupabase();
    const { error } = await sb.from("matieres").update({ nom: m.nom, coefficient: m.coefficient }).or(legacyOrIdFilter(matiereId));
    if (error) throw error;
    await logAudit("Modification matière", m.nom, `Matière mise à jour (coef. ${m.coefficient}).`);
    await get().refresh();
  },

  deleteFiliere: async (id) => {
    const sb = getSupabase();
    const f = get().filieres.find((x) => x.id === id);
    const { error } = await sb.from("filieres").delete().or(legacyOrIdFilter(id));
    if (error) throw error;
    await logAudit("Suppression filière", f?.nom ?? id, "Filière et ses classes/matières supprimées.");
    await get().refresh();
  },

  deleteClasse: async (filiereId, classeId) => {
    const sb = getSupabase();
    const f = get().filieres.find((x) => x.id === filiereId);
    const c = f?.classes.find((x) => x.id === classeId);
    const { error } = await sb.from("classes").delete().or(legacyOrIdFilter(classeId));
    if (error) throw error;
    await logAudit("Suppression classe", c?.nom ?? classeId, `Classe retirée de la filière ${f?.nom ?? ""}.`);
    await get().refresh();
  },

  deleteMatiere: async (filiereId, matiereId) => {
    const sb = getSupabase();
    const f = get().filieres.find((x) => x.id === filiereId);
    const m = f?.matieres.find((x) => x.id === matiereId);
    const { error } = await sb.from("matieres").delete().or(legacyOrIdFilter(matiereId));
    if (error) throw error;
    await logAudit("Suppression matière", m?.nom ?? matiereId, `Matière retirée de la filière ${f?.nom ?? ""}.`);
    await get().refresh();
  },

  traiterDossier: async (id, action, options) => {
    const sb = getSupabase();
    const dossier = get().candidatures.find((c) => c.id === id);
    if (!dossier) return;
    const statutMap = { valider: "Validé", rejeter: "Rejeté", incomplet: "Incomplet" } as const;
    const actionLabel = { valider: "Validation dossier", rejeter: "Rejet dossier", incomplet: "Marquage incomplet" } as const;
    const statut = statutMap[action] as StatutDossier;
    let details = `Dossier ${statut.toLowerCase()}.`;
    if (action === "rejeter" && options?.motif) details = `Motif : ${options.motif}`;
    if (action === "incomplet" && options?.piecesManquantes?.length) details = `Pièces manquantes : ${options.piecesManquantes.join(", ")}`;
    const historique: ActionHistorique[] = [...dossier.historique, { action: actionLabel[action], date: now(), auteur: currentAuthor() }];
    const { error } = await sb.from("candidatures").update({ statut, historique }).or(legacyOrIdFilter(id));
    if (error) throw error;
    await logAudit(actionLabel[action], id, details);
    await get().refresh();

    // Notification n8n (email validation/rejet) — uniquement pour ces deux
    // décisions, pas pour "incomplet" (relance de pièces, cas différent).
    if (action === "valider" || action === "rejeter") {
      void fetch("/api/n8n/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "candidature_traitee", candidatureId: id }),
      }).catch(() => {});
    }
  },

  traiterAlerte: async (id, nouveauStatut, commentaire) => {
    const sb = getSupabase();
    const alerte = get().alertes.find((a) => a.id === id);
    if (!alerte) return;
    const { error } = await sb.from("alertes").update({ statut: nouveauStatut }).or(legacyOrIdFilter(id));
    if (error) throw error;
    await logAudit(
      nouveauStatut === "Clôturée" ? "Clôture alerte" : "Prise en charge alerte",
      id,
      `Alerte ${id} (${alerte.etudiant}) → ${nouveauStatut}${commentaire ? `. Commentaire : ${commentaire}` : ""}.`
    );
    await get().refresh();
  },

  addNote: async (n) => {
    const sb = getSupabase();
    const etudiantId = await findEtudiantByName(n.etudiant);
    if (!etudiantId) throw new Error("Étudiant introuvable");
    const classe = await resolveClasseUuid(n.classe);
    const { data: mat } = await sb.from("matieres").select("id").eq("nom", n.matiere).maybeSingle();
    const { error } = await sb.from("notes").insert({
      etudiant_id: etudiantId,
      matiere_id: mat?.id ?? null,
      matiere_nom: n.matiere,
      classe_id: classe?.id ?? null,
      classe_nom: n.classe,
      note: n.note,
      sur: n.sur,
      coefficient: n.coefficient,
      periode: n.periode,
    });
    if (error) throw error;
    await logAudit("Saisie de notes", `${n.classe} — ${n.matiere}`, `Note ${n.note}/${n.sur} saisie pour ${n.etudiant} (${n.periode}).`);
    await get().refresh();
  },

  addAbsence: async (a) => {
    const sb = getSupabase();
    const etudiantId = await findEtudiantByName(a.etudiant);
    if (!etudiantId) throw new Error("Étudiant introuvable");
    const classe = await resolveClasseUuid(a.classe);
    const isoDate = a.date.includes("-") && a.date.length === 10
      ? a.date
      : new Date(a.date.split("/").reverse().join("-")).toISOString().slice(0, 10);
    const { error } = await sb.from("absences").insert({
      etudiant_id: etudiantId,
      classe_id: classe?.id ?? null,
      classe_nom: a.classe,
      matiere: a.matiere,
      date_absence: isoDate,
      justifiee: a.justifiee,
    });
    if (error) throw error;
    await logAudit("Saisie absence", `${a.classe} — ${a.matiere}`, `Absence enregistrée pour ${a.etudiant} le ${a.date}.`);
    await get().refresh();
  },

  updateNote: async (id, n) => {
    const sb = getSupabase();
    const { error } = await sb.from("notes").update({
      ...(n.note !== undefined ? { note: n.note } : {}),
      ...(n.sur !== undefined ? { sur: n.sur } : {}),
      ...(n.coefficient !== undefined ? { coefficient: n.coefficient } : {}),
      ...(n.periode !== undefined ? { periode: n.periode } : {}),
      ...(n.matiere !== undefined ? { matiere_nom: n.matiere } : {}),
      ...(n.classe !== undefined ? { classe_nom: n.classe } : {}),
    }).eq("id", id);
    if (error) throw error;
    await logAudit("Modification note", id, "Note mise à jour.");
    await get().refresh();
  },

  deleteNote: async (id) => {
    const sb = getSupabase();
    const { error } = await sb.from("notes").delete().eq("id", id);
    if (error) throw error;
    await logAudit("Suppression note", id, "Note supprimée.");
    await get().refresh();
  },

  updateAbsence: async (id, a) => {
    const sb = getSupabase();
    const dateAbsence =
      a.date !== undefined
        ? a.date.includes("-") && a.date.length === 10
          ? a.date
          : new Date(a.date.split("/").reverse().join("-")).toISOString().slice(0, 10)
        : undefined;
    const { error } = await sb.from("absences").update({
      ...(a.matiere !== undefined ? { matiere: a.matiere } : {}),
      ...(a.classe !== undefined ? { classe_nom: a.classe } : {}),
      ...(a.justifiee !== undefined ? { justifiee: a.justifiee } : {}),
      ...(dateAbsence !== undefined ? { date_absence: dateAbsence } : {}),
    }).eq("id", id);
    if (error) throw error;
    await logAudit("Modification absence", id, "Absence mise à jour.");
    await get().refresh();
  },

  deleteAbsence: async (id) => {
    const sb = getSupabase();
    const { error } = await sb.from("absences").delete().eq("id", id);
    if (error) throw error;
    await logAudit("Suppression absence", id, "Absence supprimée.");
    await get().refresh();
  },

  addCandidature: async (c, files) => {
    const sb = getSupabase();
    const session = useAuthStore.getState().session;
    if (!session) throw new Error("Non authentifié");
    const { data: { user } } = await sb.auth.getUser();
    if (!user) throw new Error("Non authentifié");

    const filiereUuid = await resolveFiliereUuid(c.filiereId);
    const filiere = get().filieres.find((f) => f.id === c.filiereId);
    const filiereNom = filiere?.nom ?? "";
    const year = new Date().getFullYear();
    const legacyId = `CAND-${year}-${String(Date.now()).slice(-6)}`;
    const auteur = `${c.prenom} ${c.nom}`;

    const PIECE_DEFS = [
      { key: "identite", nom: "Pièce d'identité" },
      { key: "bac", nom: "Baccalauréat" },
      { key: "releve", nom: "Relevé de notes" },
      { key: "lettre", nom: "Lettre de motivation" },
    ] as const;

    const pieces = PIECE_DEFS.map(({ key, nom }) => {
      const file = files?.[key];
      return {
        nom,
        type: file?.type?.includes("pdf") ? "PDF" : file ? "Image" : "PDF",
        taille: "—",
        present: false,
        storage_path: undefined as string | undefined,
      };
    });

    const historique: ActionHistorique[] = [
      { action: "Dossier soumis", date: now(), auteur },
    ];

    const { error } = await sb.from("candidatures").insert({
      legacy_id: legacyId,
      nom: c.nom,
      prenom: c.prenom,
      email: c.email || session.email,
      telephone: c.telephone,
      date_naissance: c.dateNaissance,
      adresse: c.adresse,
      filiere_id: filiereUuid,
      filiere_nom: filiereNom,
      niveau: c.niveau,
      statut: "En attente",
      pieces,
      synthese_ia: "",
      completude: 0,
      historique,
    });
    if (error) throw error;

    if (files && Object.keys(files).length > 0) {
      for (const { key, nom } of PIECE_DEFS) {
        const file = files[key];
        if (!file) continue;
        const uploaded = await uploadCandidaturePiece(user.id, legacyId, key, file);
        const idx = pieces.findIndex((p) => p.nom === nom);
        if (idx >= 0) {
          pieces[idx] = {
            ...pieces[idx],
            present: true,
            taille: uploaded.taille,
            storage_path: uploaded.path,
            type: file.type?.includes("pdf") ? "PDF" : "Image",
          };
        }
      }
      const completude = Math.round(
        (pieces.filter((p) => p.present).length / pieces.length) * 100
      );
      await sb.from("candidatures").update({ pieces, completude }).eq("legacy_id", legacyId);
    }

    await logAudit(
      "Soumission candidature",
      legacyId,
      `Nouveau dossier soumis par ${auteur} (${filiereNom}).`
    );
    await get().refresh();

    void fetch("/api/ia/analyse-dossier", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidatureId: legacyId }),
    })
      .then(() => get().refresh())
      .catch(() => {
        // Analyse IA en arrière-plan : un échec ne doit pas bloquer la
        // soumission déjà persistée, mais on ne veut pas non plus une
        // rejection de promesse non gérée.
      });

    // Notification n8n (email de confirmation) — best-effort, gérée
    // entièrement côté serveur car le déclencheur peut être un candidat qui
    // n'a pas accès à parametres.notifications côté client.
    void fetch("/api/n8n/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "candidature_soumise", candidatureId: legacyId }),
    }).catch(() => {});

    return legacyId;
  },

  deleteCandidature: async (id) => {
    const sb = getSupabase();
    const dossier = get().candidatures.find((c) => c.id === id);
    const paths = (dossier?.pieces ?? [])
      .map((p) => p.storage_path)
      .filter((p): p is string => Boolean(p));
    if (paths.length > 0) {
      await deleteStorageFiles(CANDIDATURES_BUCKET, paths);
    }
    const { error } = await sb.from("candidatures").delete().or(legacyOrIdFilter(id));
    if (error) throw error;
    await logAudit("Suppression candidature", id, "Dossier candidature supprimé.");
    await get().refresh();
  },

  analyseCandidature: async (id) => {
    const res = await fetch("/api/ia/analyse-dossier", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidatureId: id }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { error?: string }).error ?? "Analyse échouée");
    }
    await get().refresh();
  },

  addAlerte: async (a) => {
    const sb = getSupabase();
    const etudiantId = await findEtudiantByName(a.etudiant);
    if (!etudiantId) throw new Error("Étudiant introuvable");
    const colorMap = { Faible: "bg-yellow-500", Moyen: "bg-orange-500", Élevé: "bg-red-500" };
    const legacyId = `ALT-${Date.now()}`;
    const { error } = await sb.from("alertes").insert({
      legacy_id: legacyId,
      etudiant_id: etudiantId,
      classe_nom: a.classe,
      niveau: a.niveau,
      motif: a.motif,
      statut: "Nouvelle",
      indicator_color: colorMap[a.niveau] ?? "bg-orange-500",
    });
    if (error) throw error;
    await logAudit("Création alerte", legacyId, `Alerte créée pour ${a.etudiant}.`);
    await get().refresh();
  },

  deleteAlerte: async (id) => {
    const sb = getSupabase();
    const { error } = await sb.from("alertes").delete().or(legacyOrIdFilter(id));
    if (error) throw error;
    await logAudit("Suppression alerte", id, "Alerte supprimée.");
    await get().refresh();
  },

  genererAlertesIA: async () => {
    try {
      const res = await fetch("/api/ia/generer-alertes", { method: "POST" });
      const data = (await res.json()) as { error?: string; created?: number };
      if (!res.ok) return { ok: false, error: data.error ?? "Échec génération" };
      await get().refresh();
      return { ok: true, created: data.created };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Erreur" };
    }
  },

  deleteRapport: async (id) => {
    const res = await fetch(`/api/rapports?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    const payload = (await res.json()) as { error?: string };
    if (!res.ok) {
      throw new Error(payload.error ?? "Échec suppression rapport");
    }
    const rapports = await fetchRapportsFromApi();
    set({ rapports });
  },

  reloadRapports: async () => {
    const session = useAuthStore.getState().session;
    if (!canManageRapports(session?.role)) return;
    const rapports = await fetchRapportsFromApi();
    set({ rapports });
  },

  downloadSignedUrl: async (bucket, path) => {
    const res = await fetch(
      `/api/storage/download?bucket=${encodeURIComponent(bucket)}&path=${encodeURIComponent(path)}`
    );
    const data = (await res.json()) as { url?: string; error?: string };
    if (!res.ok || !data.url) throw new Error(data.error ?? "Téléchargement impossible");
    return data.url;
  },

  genererRapport: async (options) => {
    try {
      const res = await fetch("/api/rapports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        return { ok: false, error: data.error ?? "Échec de la génération" };
      }
      const rapports = await fetchRapportsFromApi();
      set({ rapports });
      return { ok: true };
    } catch (e) {
      return {
        ok: false,
        error: e instanceof Error ? e.message : "Erreur réseau",
      };
    }
  },

  logAction: async (e) => {
    await logAudit(e.action, e.cible, e.details);
    await get().refresh();
  },
}));
