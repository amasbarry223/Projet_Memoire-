import {
  LayoutGrid,
  FileText,
  GraduationCap,
  Users,
  ClipboardList,
  BrainCircuit,
  BarChart3,
  BookOpen,
  UserCog,
  ScrollText,
  Settings,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Navigation
// ─────────────────────────────────────────────────────────────────────────────

export type ViewKey =
  | "dashboard"
  | "candidatures"
  | "etudiants"
  | "enseignants"
  | "suivi"
  | "alertes"
  | "rapports"
  | "filieres"
  | "utilisateurs"
  | "audit"
  | "parametres";

export type NavItem = {
  key: ViewKey;
  label: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  { key: "dashboard", label: "Tableau de bord", icon: LayoutGrid },
  { key: "candidatures", label: "Candidatures", icon: FileText },
  { key: "etudiants", label: "Étudiants", icon: GraduationCap },
  { key: "enseignants", label: "Enseignants", icon: Users },
  { key: "suivi", label: "Suivi pédagogique", icon: ClipboardList },
  { key: "alertes", label: "Alertes IA", icon: BrainCircuit },
  { key: "rapports", label: "Rapports", icon: BarChart3 },
  { key: "filieres", label: "Filières & Classes", icon: BookOpen },
  { key: "utilisateurs", label: "Utilisateurs", icon: UserCog },
  { key: "audit", label: "Journal d'audit", icon: ScrollText },
  { key: "parametres", label: "Paramètres", icon: Settings },
];

// ─────────────────────────────────────────────────────────────────────────────
// RBAC — Rôles et permissions (§2 du cahier des charges)
// ─────────────────────────────────────────────────────────────────────────────

export type Role = "candidat" | "etudiant" | "enseignant" | "responsable" | "admin";

export const roleLabels: Record<Role, string> = {
  candidat: "Candidat",
  etudiant: "Étudiant",
  enseignant: "Enseignant",
  responsable: "Responsable pédagogique",
  admin: "Administrateur",
};

export const roleBadgeBg: Record<Role, string> = {
  candidat: "bg-gray-100 text-gray-600",
  etudiant: "bg-blue-50 text-blue-700",
  enseignant: "bg-yellow-50 text-yellow-700",
  responsable: "bg-orange-50 text-orange-600",
  admin: "bg-blue-600 text-white",
};

// Mapping rôle → vues accessibles (matrice de permissions §2.2)
export const roleViews: Record<Role, ViewKey[]> = {
  candidat: ["dashboard", "candidatures"],
  etudiant: ["dashboard", "suivi", "candidatures"],
  enseignant: ["dashboard", "etudiants", "suivi", "alertes"],
  responsable: ["dashboard", "etudiants", "enseignants", "suivi", "alertes", "rapports", "audit"],
  admin: [
    "dashboard",
    "candidatures",
    "etudiants",
    "enseignants",
    "suivi",
    "alertes",
    "rapports",
    "filieres",
    "utilisateurs",
    "audit",
    "parametres",
  ],
};

/** Seuls les administrateurs peuvent valider / rejeter / marquer incomplet un dossier. */
export function canTraiterDossier(role: Role): boolean {
  return role === "admin";
}

/** Candidat : peut soumettre si aucun dossier actif (En attente / Incomplet). */
export function canSoumettreCandidature(
  role: Role,
  candidatures: { email: string; statut: StatutDossier }[],
  sessionEmail: string
): boolean {
  if (role !== "candidat") return false;
  const actifs: StatutDossier[] = ["En attente", "Incomplet"];
  return !candidatures.some(
    (c) => c.email === sessionEmail && actifs.includes(c.statut)
  );
}

// Vue par défaut à la connexion selon le rôle
export const defaultView: Record<Role, ViewKey> = {
  candidat: "candidatures",
  etudiant: "suivi",
  enseignant: "suivi",
  responsable: "dashboard",
  admin: "dashboard",
};

// ─────────────────────────────────────────────────────────────────────────────
// Tableau de bord — KPIs, graphiques, widgets
// ─────────────────────────────────────────────────────────────────────────────

// Données métier persistées dans Supabase — voir src/lib/data-store.ts

export type StatCard = {
  label: string;
  value: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  statusColor: string;
  hint: string;
};

export const tabsList = [
  "Candidatures",
  "Étudiants",
  "Enseignants",
  "Notes",
  "Absences",
  "Alertes",
];

export type ParametresEtablissement = {
  nom: string;
  tel: string;
  email: string;
  adresse: string;
};

export type ParametresSecurite = {
  sessionHours: string;
  rlsEnabled: boolean;
  httpsOnly: boolean;
};

export type ParametresNotifications = {
  emailConfirmation: boolean;
  validationRejet: boolean;
  alertesHebdo: boolean;
};

export type ParametresIntegrations = {
  n8nUrl: string;
  iaModel: string;
  mentionIa: boolean;
};

export type AppParametres = {
  etablissement: ParametresEtablissement;
  securite: ParametresSecurite;
  notifications: ParametresNotifications;
  integrations: ParametresIntegrations;
};

export const defaultParametres: AppParametres = {
  etablissement: {
    nom: "École Supérieure ESGic",
    tel: "+223 20 22 33 44",
    email: "contact@esgic.ml",
    adresse: "Avenue de l'Indépendance, ACI 2000, Bamako",
  },
  securite: { sessionHours: "24", rlsEnabled: true, httpsOnly: true },
  notifications: {
    emailConfirmation: true,
    validationRejet: true,
    alertesHebdo: true,
  },
  integrations: {
    n8nUrl: "https://n8n.local/webhook/esgic",
    iaModel: "claude",
    mentionIa: true,
  },
};

export type AlerteIA = {
  id: string;
  etudiant: string;
  classe: string;
  niveau: "Élevé" | "Moyen" | "Faible";
  motif: string;
  date: string;
  statut: "Nouvelle" | "Prise en charge" | "Clôturée";
  indicatorColor: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Module Candidatures (F3)
// ─────────────────────────────────────────────────────────────────────────────

export type StatutDossier = "En attente" | "Validé" | "Incomplet" | "Rejeté";

export type PieceJustificative = {
  nom: string;
  type: string;
  taille: string;
  present: boolean;
  storage_path?: string;
};

export type ActionHistorique = {
  action: string;
  date: string;
  auteur: string;
};

export type Candidature = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  dateNaissance: string;
  adresse: string;
  filiere: string;
  niveau: string;
  statut: StatutDossier;
  dateSoumission: string;
  pieces: PieceJustificative[];
  syntheseIA: string;
  completude: number;
  historique: ActionHistorique[];
};

// ─────────────────────────────────────────────────────────────────────────────
// Étudiants (F4.2)
// ─────────────────────────────────────────────────────────────────────────────

export type Etudiant = {
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  filiere: string;
  classe: string;
  moyenne: number;
  assiduite: number;
  statut: "Actif" | "Suspendu";
};

// ─────────────────────────────────────────────────────────────────────────────
// Enseignants (F4.1)
// ─────────────────────────────────────────────────────────────────────────────

export type Enseignant = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  matieres: string[];
  classes: string[];
  statut: "Actif" | "Congé";
};

// ─────────────────────────────────────────────────────────────────────────────
// Suivi pédagogique — grille de notes (F4.1, F4.2)
// ─────────────────────────────────────────────────────────────────────────────

export type Note = {
  id?: string;
  etudiant: string;
  matiere: string;
  classe: string;
  note: number | null;
  sur: number;
  coefficient: number;
  periode: string;
};

export type Absence = {
  id?: string;
  etudiant: string;
  classe: string;
  matiere: string;
  date: string;
  justifiee: boolean;
};

// ─────────────────────────────────────────────────────────────────────────────
// Alertes IA (F4.4) — version complète pour la vue dédiée
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// Rapports (F5.2)
// ─────────────────────────────────────────────────────────────────────────────

export type Rapport = {
  id: string;
  titre: string;
  periode: string;
  dateGeneration: string;
  type: "Mensuel" | "Hebdomadaire" | "Trimestriel" | "Ponctuel";
  taille: string;
  generePar: string;
  fichierPath?: string;
  tailleOctets?: number;
};

// ─────────────────────────────────────────────────────────────────────────────
// Filières, classes, matières (F6.2)
// ─────────────────────────────────────────────────────────────────────────────

export type Classe = {
  id: string;
  nom: string;
  niveau: string;
  effectif: number;
};

export type Matiere = {
  id: string;
  nom: string;
  coefficient: number;
};

export type Filiere = {
  id: string;
  nom: string;
  code: string;
  description: string;
  classes: Classe[];
  matieres: Matiere[];
};

// ─────────────────────────────────────────────────────────────────────────────
// Utilisateurs & rôles (F6.1, RBAC §2)
// ─────────────────────────────────────────────────────────────────────────────

export type Utilisateur = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: Role;
  statut: "Actif" | "Désactivé";
  derniereConnexion: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Journal d'audit (F6.3)
// ─────────────────────────────────────────────────────────────────────────────

export type EntreeAudit = {
  id: string;
  date: string;
  utilisateur: string;
  action: string;
  cible: string;
  details: string;
};

