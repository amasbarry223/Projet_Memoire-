"use client";

import { create } from "zustand";
import { getSupabase } from "@/lib/supabase/client";
import type { Json } from "@/lib/supabase/types";
import {
  mapAbsence,
  mapAlerte,
  mapAudit,
  mapCandidature,
  mapEnseignant,
  mapEtudiant,
  mapFiliere,
  mapNote,
  mapRapport,
  mapUtilisateur,
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
import {
  uploadCandidaturePiece,
  deleteStorageFiles,
  CANDIDATURES_BUCKET,
  RAPPORTS_BUCKET,
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

  addFiliere: (f: { nom: string; code: string; description: string }) => Promise<void>;
  updateFiliere: (id: string, f: { nom: string; code: string; description: string }) => Promise<void>;
  addClasse: (filiereId: string, c: { nom: string; niveau: string; effectif: number }) => Promise<void>;
  updateClasse: (filiereId: string, classeId: string, c: { nom: string; niveau: string; effectif: number }) => Promise<void>;
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
  addAbsence: (a: Omit<Absence, "date"> & { date: string }) => Promise<void>;
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
  const sb = getSupabase();
  await sb.rpc("log_audit", { p_action: action, p_cible: cible, p_details: details });
}

async function resolveFiliereUuid(legacyOrUuid: string) {
  const sb = getSupabase();
  const { data } = await sb.from("filieres").select("id").or(`legacy_id.eq.${legacyOrUuid},id.eq.${legacyOrUuid}`).maybeSingle();
  return data?.id ?? null;
}

async function resolveClasseUuid(legacyOrUuid: string) {
  const sb = getSupabase();
  const { data } = await sb.from("classes").select("id, nom, filiere_id, filieres(nom)").or(`legacy_id.eq.${legacyOrUuid},id.eq.${legacyOrUuid}`).maybeSingle();
  return data;
}

async function resolveEtudiantUuid(legacyOrUuid: string) {
  const sb = getSupabase();
  const { data } = await sb.from("etudiants").select("id").or(`legacy_id.eq.${legacyOrUuid},id.eq.${legacyOrUuid}`).maybeSingle();
  return data?.id ?? null;
}

async function findEtudiantByName(name: string) {
  const sb = getSupabase();
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return null;
  const prenom = parts[0];
  const nom = parts.slice(1).join(" ");
  const { data } = await sb.from("etudiants").select("id").eq("prenom", prenom).eq("nom", nom).maybeSingle();
  return data?.id ?? null;
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
    if (get().isInitialized || get().isLoading) return;
    set({ isLoading: true, error: null });
    try {
      await get().refresh();
      set({ isInitialized: true });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Erreur de chargement" });
    } finally {
      set({ isLoading: false });
    }
  },

  refresh: async () => {
    const sb = getSupabase();
    const session = useAuthStore.getState().session;
    const isAdmin = session?.role === "admin";
    await ensureParametresDefaults(sb);
    const queries = [
      sb.from("filieres").select("*, classes(*), matieres(*)").order("nom"),
      sb.from("etudiants").select("*, classes(nom, filieres(nom))").order("nom"),
      sb.from("enseignants").select("*, enseignant_matieres(matiere_id, matieres(nom)), enseignant_classes(classe_id, classes(nom))").order("nom"),
      sb.from("candidatures").select("*").order("date_soumission", { ascending: false }),
      sb.from("profiles").select("*").order("nom"),
      sb.from("alertes").select("*, etudiants(prenom, nom)").order("date_alerte", { ascending: false }),
      sb.from("audit_log").select("*").order("created_at", { ascending: false }),
      sb.from("notes").select("*, etudiants(prenom, nom)").order("created_at", { ascending: false }),
      sb.from("absences").select("*, etudiants(prenom, nom)").order("date_absence", { ascending: false }),
      sb.from("rapports").select("*").order("date_generation", { ascending: false }),
      sb.from("dashboard_charts").select("*"),
      isAdmin
        ? sb.from("parametres").select("key, value")
        : Promise.resolve({ data: null, error: null }),
    ] as const;
    const [filieresRes, etudiantsRes, enseignantsRes, candidaturesRes, utilisateursRes, alertesRes, auditRes, notesRes, absencesRes, rapportsRes, chartsRes, parametresRes] = await Promise.all(queries);

    const charts = chartsRes.data ?? [];
    const insc = charts.find((c) => c.key === "inscriptions");
    const abs = charts.find((c) => c.key === "absenteisme");

    set({
      filieres: (filieresRes.data ?? []).map((f) => mapFiliere(f as never)),
      etudiants: (etudiantsRes.data ?? []).map((e) => mapEtudiant(e as never)),
      enseignants: (enseignantsRes.data ?? []).map((e) => mapEnseignant(e as never)),
      candidatures: (candidaturesRes.data ?? []).map(mapCandidature),
      utilisateurs: (utilisateursRes.data ?? []).map(mapUtilisateur),
      alertes: (alertesRes.data ?? []).map((a) => mapAlerte(a as never)),
      audit: (auditRes.data ?? []).map(mapAudit),
      notes: (notesRes.data ?? []).map((n) => mapNote(n as never)),
      absences: (absencesRes.data ?? []).map((a) => mapAbsence(a as never)),
      rapports: (rapportsRes.data ?? []).map(mapRapport),
      inscriptionsParMois: (insc?.data as { mois: string; inscriptions: number }[]) ?? [],
      absentéismeParMois: (abs?.data as { mois: string; taux: number }[]) ?? [],
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
    }).or(`legacy_id.eq.${id},id.eq.${id}`);
    if (error) throw error;
    await logAudit("Modification étudiant", id, "Fiche étudiant mise à jour.");
    await get().refresh();
  },

  deleteEtudiant: async (id) => {
    const sb = getSupabase();
    const etu = get().etudiants.find((x) => x.id === id);
    const { error } = await sb.from("etudiants").delete().or(`legacy_id.eq.${id},id.eq.${id}`);
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
    for (const filiere of get().filieres) {
      for (const m of filiere.matieres.filter((x) => e.matieres.includes(x.nom))) {
        const { data: mat } = await sb.from("matieres").select("id").or(`legacy_id.eq.${m.id},id.eq.${m.id}`).maybeSingle();
        if (mat) await sb.from("enseignant_matieres").insert({ enseignant_id: data.id, matiere_id: mat.id });
      }
      for (const c of filiere.classes.filter((x) => e.classes.includes(x.nom))) {
        const { data: cl } = await sb.from("classes").select("id").or(`legacy_id.eq.${c.id},id.eq.${c.id}`).maybeSingle();
        if (cl) await sb.from("enseignant_classes").insert({ enseignant_id: data.id, classe_id: cl.id });
      }
    }
    await logAudit("Création enseignant", `${e.prenom} ${e.nom}`, `Enseignant ajouté — ${e.matieres.length} matière(s), ${e.classes.length} classe(s).`);
    await get().refresh();
  },

  updateEnseignant: async (id, e) => {
    const sb = getSupabase();
    const { data: ens } = await sb.from("enseignants").select("id").or(`legacy_id.eq.${id},id.eq.${id}`).single();
    if (!ens) return;
    await sb.from("enseignants").update({
      nom: e.nom,
      prenom: e.prenom,
      email: e.email,
      statut: e.statut,
    }).eq("id", ens.id);
    if (e.matieres || e.classes) {
      await sb.from("enseignant_matieres").delete().eq("enseignant_id", ens.id);
      await sb.from("enseignant_classes").delete().eq("enseignant_id", ens.id);
      const matieres = e.matieres ?? get().enseignants.find((x) => x.id === id)?.matieres ?? [];
      const classes = e.classes ?? get().enseignants.find((x) => x.id === id)?.classes ?? [];
      for (const filiere of get().filieres) {
        for (const m of filiere.matieres.filter((x) => matieres.includes(x.nom))) {
          const { data: mat } = await sb.from("matieres").select("id").or(`legacy_id.eq.${m.id},id.eq.${m.id}`).maybeSingle();
          if (mat) await sb.from("enseignant_matieres").insert({ enseignant_id: ens.id, matiere_id: mat.id });
        }
        for (const c of filiere.classes.filter((x) => classes.includes(x.nom))) {
          const { data: cl } = await sb.from("classes").select("id").or(`legacy_id.eq.${c.id},id.eq.${c.id}`).maybeSingle();
          if (cl) await sb.from("enseignant_classes").insert({ enseignant_id: ens.id, classe_id: cl.id });
        }
      }
    }
    await logAudit("Modification enseignant", id, "Fiche enseignant mise à jour.");
    await get().refresh();
  },

  deleteEnseignant: async (id) => {
    const sb = getSupabase();
    const ens = get().enseignants.find((x) => x.id === id);
    const { error } = await sb.from("enseignants").delete().or(`legacy_id.eq.${id},id.eq.${id}`);
    if (error) throw error;
    await logAudit("Suppression enseignant", ens ? `${ens.prenom} ${ens.nom}` : id, "Enseignant supprimé, affectations retirées.");
    await get().refresh();
  },

  addUtilisateur: async (u) => {
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(u),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? "Échec création utilisateur");
    }
    await logAudit("Création compte", `${u.prenom} ${u.nom}`, `Compte créé — rôle ${u.role}.`);
    await get().refresh();
  },

  updateUtilisateur: async (id, u) => {
    const sb = getSupabase();
    const { error } = await sb.from("profiles").update({
      email: u.email,
      nom: u.nom,
      prenom: u.prenom,
      role: u.role,
      statut: u.statut,
    }).or(`legacy_id.eq.${id},id.eq.${id}`);
    if (error) throw error;
    await logAudit("Modification compte", id, u.role ? `Rôle mis à jour → ${u.role}.` : "Compte modifié.");
    await get().refresh();
  },

  deleteUtilisateur: async (id) => {
    const session = useAuthStore.getState().session;
    const usr = get().utilisateurs.find((x) => x.id === id);
    if (session && usr && usr.email === session.email) {
      return { ok: false, error: "Vous ne pouvez pas supprimer votre propre compte (R2)." };
    }
    const res = await fetch(`/api/users?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { ok: false, error: (err as { error?: string }).error ?? "Échec suppression" };
    }
    await logAudit("Suppression compte", usr ? `${usr.prenom} ${usr.nom}` : id, "Compte utilisateur supprimé (Auth + profil).");
    await get().refresh();
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
    const { error } = await sb.from("filieres").update({ nom: f.nom, code: f.code, description: f.description }).or(`legacy_id.eq.${id},id.eq.${id}`);
    if (error) throw error;
    await logAudit("Modification filière", f.nom, `Filière mise à jour (code ${f.code}).`);
    await get().refresh();
  },

  addClasse: async (filiereId, c) => {
    const sb = getSupabase();
    const filiereUuid = await resolveFiliereUuid(filiereId);
    if (!filiereUuid) return;
    const legacy_id = `CL-${Date.now()}`;
    const { error } = await sb.from("classes").insert({ legacy_id, filiere_id: filiereUuid, nom: c.nom, niveau: c.niveau, effectif: c.effectif });
    if (error) throw error;
    await logAudit("Création classe", c.nom, `Classe ajoutée à la filière.`);
    await get().refresh();
  },

  updateClasse: async (filiereId, classeId, c) => {
    const sb = getSupabase();
    const { error } = await sb.from("classes").update({ nom: c.nom, niveau: c.niveau, effectif: c.effectif }).or(`legacy_id.eq.${classeId},id.eq.${classeId}`);
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
    const { error } = await sb.from("matieres").update({ nom: m.nom, coefficient: m.coefficient }).or(`legacy_id.eq.${matiereId},id.eq.${matiereId}`);
    if (error) throw error;
    await logAudit("Modification matière", m.nom, `Matière mise à jour (coef. ${m.coefficient}).`);
    await get().refresh();
  },

  deleteFiliere: async (id) => {
    const sb = getSupabase();
    const f = get().filieres.find((x) => x.id === id);
    const { error } = await sb.from("filieres").delete().or(`legacy_id.eq.${id},id.eq.${id}`);
    if (error) throw error;
    await logAudit("Suppression filière", f?.nom ?? id, "Filière et ses classes/matières supprimées.");
    await get().refresh();
  },

  deleteClasse: async (filiereId, classeId) => {
    const sb = getSupabase();
    const f = get().filieres.find((x) => x.id === filiereId);
    const c = f?.classes.find((x) => x.id === classeId);
    const { error } = await sb.from("classes").delete().or(`legacy_id.eq.${classeId},id.eq.${classeId}`);
    if (error) throw error;
    await logAudit("Suppression classe", c?.nom ?? classeId, `Classe retirée de la filière ${f?.nom ?? ""}.`);
    await get().refresh();
  },

  deleteMatiere: async (filiereId, matiereId) => {
    const sb = getSupabase();
    const f = get().filieres.find((x) => x.id === filiereId);
    const m = f?.matieres.find((x) => x.id === matiereId);
    const { error } = await sb.from("matieres").delete().or(`legacy_id.eq.${matiereId},id.eq.${matiereId}`);
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
    const { error } = await sb.from("candidatures").update({ statut, historique }).or(`legacy_id.eq.${id},id.eq.${id}`);
    if (error) throw error;
    await logAudit(actionLabel[action], id, details);
    await get().refresh();
  },

  traiterAlerte: async (id, nouveauStatut, commentaire) => {
    const sb = getSupabase();
    const alerte = get().alertes.find((a) => a.id === id);
    if (!alerte) return;
    const { error } = await sb.from("alertes").update({ statut: nouveauStatut }).or(`legacy_id.eq.${id},id.eq.${id}`);
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
    }).then(() => get().refresh());

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
    const { error } = await sb.from("candidatures").delete().or(`legacy_id.eq.${id},id.eq.${id}`);
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
    const { error } = await sb.from("alertes").delete().or(`legacy_id.eq.${id},id.eq.${id}`);
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
    const sb = getSupabase();
    const rapport = get().rapports.find((r) => r.id === id);
    if (rapport?.fichierPath) {
      await deleteStorageFiles(RAPPORTS_BUCKET, [rapport.fichierPath]);
    }
    const { error } = await sb.from("rapports").delete().or(`legacy_id.eq.${id},id.eq.${id}`);
    if (error) throw error;
    await logAudit("Suppression rapport", id, "Rapport supprimé.");
    await get().refresh();
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
      await get().refresh();
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
