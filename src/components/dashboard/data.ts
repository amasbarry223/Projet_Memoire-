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
  etudiant: "bg-emerald-50 text-emerald-600",
  enseignant: "bg-amber-50 text-amber-600",
  responsable: "bg-orange-50 text-orange-600",
  admin: "bg-emerald-500 text-white",
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

// Vue par défaut à la connexion selon le rôle
export const defaultView: Record<Role, ViewKey> = {
  candidat: "candidatures",
  etudiant: "suivi",
  enseignant: "suivi",
  responsable: "dashboard",
  admin: "dashboard",
};

// Comptes de démonstration (un par rôle pour la soutenance — livrable §6.1)
export type DemoAccount = {
  email: string;
  password: string;
  role: Role;
  nom: string;
  prenom: string;
};

export const demoAccounts: DemoAccount[] = [
  { email: "amadou.toure@scolaflow.ml", password: "admin", role: "admin", nom: "Touré", prenom: "Amadou" },
  { email: "rokia.keita@scolaflow.ml", password: "resp", role: "responsable", nom: "Keïta", prenom: "Rokia" },
  { email: "d.coulibaly@scolaflow.ml", password: "ens", role: "enseignant", nom: "Coulibaly", prenom: "Drissa" },
  { email: "moussa.diabate@etu.ml", password: "etu", role: "etudiant", nom: "Diabaté", prenom: "Moussa" },
  { email: "kadiatou.konate@email.ml", password: "cand", role: "candidat", nom: "Konaté", prenom: "Kadiatou" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Tableau de bord — KPIs, graphiques, widgets
// ─────────────────────────────────────────────────────────────────────────────

export type StatCard = {
  label: string;
  value: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  statusColor: string;
  hint: string;
};

export const stats: StatCard[] = [
  {
    label: "Total Étudiants",
    value: "2,458",
    icon: GraduationCap,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-500",
    statusColor: "bg-emerald-500",
    hint: "Inscrits actifs",
  },
  {
    label: "Nouvelles Candidatures",
    value: "48",
    icon: FileText,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
    statusColor: "bg-emerald-500",
    hint: "En attente",
  },
  {
    label: "Dossiers Validés",
    value: "156",
    icon: CheckCircle2,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-500",
    statusColor: "bg-emerald-500",
    hint: "Ce mois-ci",
  },
  {
    label: "Dossiers Incomplets",
    value: "12",
    icon: AlertCircle,
    iconBg: "bg-red-50",
    iconColor: "text-red-500",
    statusColor: "bg-amber-500",
    hint: "Action requise",
  },
  {
    label: "Alertes IA Actives",
    value: "7",
    icon: BrainCircuit,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
    statusColor: "bg-emerald-500",
    hint: "Risque pédagogique",
  },
  {
    label: "Taux d'Assiduité",
    value: "91%",
    icon: TrendingUp,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-500",
    statusColor: "bg-emerald-500",
    hint: "Établissement",
  },
];

export const tabsList = [
  "Candidatures",
  "Étudiants",
  "Enseignants",
  "Notes",
  "Absences",
  "Alertes",
];

export const inscriptionsParMois = [
  { mois: "Jan", inscriptions: 182 },
  { mois: "Fév", inscriptions: 215 },
  { mois: "Mar", inscriptions: 198 },
  { mois: "Avr", inscriptions: 243 },
  { mois: "Mai", inscriptions: 221 },
  { mois: "Juin", inscriptions: 248 },
];

export const absentéismeParMois = [
  { mois: "Jan", taux: 8.2 },
  { mois: "Fév", taux: 7.5 },
  { mois: "Mar", taux: 9.1 },
  { mois: "Avr", taux: 6.8 },
  { mois: "Mai", taux: 7.2 },
  { mois: "Juin", taux: 6.5 },
];

export type DossierRecent = {
  candidat: string;
  filiere: string;
  date: string;
  statut: StatutDossier;
  statutBg: string;
  initialBg: string;
};

export const dossiersRecents: DossierRecent[] = [
  { candidat: "Kadiatou Konaté", filiere: "BTS SIO", date: "01 Nov 2024", statut: "En attente", statutBg: "bg-amber-50 text-amber-600", initialBg: "bg-amber-500" },
  { candidat: "Ibrahim Touré", filiere: "BTS MCO", date: "31 Oct 2024", statut: "Validé", statutBg: "bg-emerald-50 text-emerald-600", initialBg: "bg-emerald-500" },
  { candidat: "Rokia Diallo", filiere: "Licence 3", date: "30 Oct 2024", statut: "Incomplet", statutBg: "bg-orange-50 text-orange-600", initialBg: "bg-orange-500" },
  { candidat: "Seydou Bagayoko", filiere: "BTS NDRC", date: "29 Oct 2024", statut: "Rejeté", statutBg: "bg-red-50 text-red-500", initialBg: "bg-red-500" },
];

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

export const alertesIA: AlerteIA[] = [
  { id: "ALT-001", etudiant: "Moussa Diabaté", classe: "BTS SIO 2", niveau: "Élevé", motif: "Chute des notes + absences répétées", date: "01 Nov 2024", statut: "Nouvelle", indicatorColor: "bg-red-500" },
  { id: "ALT-002", etudiant: "Aïssata Diallo", classe: "BTS MCO 1", niveau: "Moyen", motif: "Baisse continue sur 3 évaluations", date: "31 Oct 2024", statut: "Nouvelle", indicatorColor: "bg-orange-500" },
  { id: "ALT-003", etudiant: "Modibo Keïta", classe: "Licence 2", niveau: "Faible", motif: "Premier signalement d'assiduité", date: "30 Oct 2024", statut: "Prise en charge", indicatorColor: "bg-amber-400" },
  { id: "ALT-004", etudiant: "Fatoumata Diarra", classe: "BTS SIO 1", niveau: "Élevé", motif: "Risque de décrochage détecté", date: "29 Oct 2024", statut: "Nouvelle", indicatorColor: "bg-red-500" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Module Candidatures (F3)
// ─────────────────────────────────────────────────────────────────────────────

export type StatutDossier = "En attente" | "Validé" | "Incomplet" | "Rejeté";

export type PieceJustificative = {
  nom: string;
  type: string;
  taille: string;
  present: boolean;
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

export const candidatures: Candidature[] = [
  {
    id: "CAND-2024-048",
    nom: "Konaté",
    prenom: "Kadiatou",
    email: "kadiatou.konate@email.ml",
    telephone: "+223 76 12 34 56",
    dateNaissance: "15/03/2005",
    adresse: "Rue 12, Faladiè, Bamako",
    filiere: "BTS SIO",
    niveau: "1ère année",
    statut: "En attente",
    dateSoumission: "01 Nov 2024",
    pieces: [
      { nom: "Pièce d'identité", type: "PDF", taille: "1.2 Mo", present: true },
      { nom: "Baccalauréat", type: "PDF", taille: "2.4 Mo", present: true },
      { nom: "Relevé de notes", type: "PDF", taille: "0.8 Mo", present: true },
      { nom: "Lettre de motivation", type: "DOCX", taille: "0.3 Mo", present: true },
    ],
    syntheseIA:
      "Dossier complet. Mention TB au baccalauréat. Lettre de motivation cohérente avec la filière. Aucun point d'attention détecté.",
    completude: 100,
    historique: [
      { action: "Dossier soumis", date: "01 Nov 2024 09:12", auteur: "Kadiatou Konaté" },
      { action: "Analyse IA effectuée", date: "01 Nov 2024 09:14", auteur: "Système IA" },
    ],
  },
  {
    id: "CAND-2024-047",
    nom: "Touré",
    prenom: "Ibrahim",
    email: "ibrahim.toure@email.ml",
    telephone: "+223 77 98 76 54",
    dateNaissance: "22/07/2005",
    adresse: "Avenue Cheick Zayed, ACI 2000, Bamako",
    filiere: "BTS MCO",
    niveau: "1ère année",
    statut: "Validé",
    dateSoumission: "31 Oct 2024",
    pieces: [
      { nom: "Pièce d'identité", type: "PDF", taille: "1.5 Mo", present: true },
      { nom: "Baccalauréat", type: "PDF", taille: "2.1 Mo", present: true },
      { nom: "Relevé de notes", type: "PDF", taille: "0.9 Mo", present: true },
      { nom: "Lettre de motivation", type: "PDF", taille: "0.4 Mo", present: true },
    ],
    syntheseIA:
      "Dossier complet et conforme. Profil adapté à la filière commerce. Recommandation : validation.",
    completude: 100,
    historique: [
      { action: "Dossier soumis", date: "31 Oct 2024 14:30", auteur: "Ibrahim Touré" },
      { action: "Analyse IA effectuée", date: "31 Oct 2024 14:32", auteur: "Système IA" },
      { action: "Dossier validé", date: "01 Nov 2024 08:15", auteur: "Amadou Touré" },
    ],
  },
  {
    id: "CAND-2024-046",
    nom: "Diallo",
    prenom: "Rokia",
    email: "rokia.diallo@email.ml",
    telephone: "+223 78 11 22 33",
    dateNaissance: "08/11/2004",
    adresse: "Rue 45, Médina-Coura, Bamako",
    filiere: "Licence 3",
    niveau: "3ème année",
    statut: "Incomplet",
    dateSoumission: "30 Oct 2024",
    pieces: [
      { nom: "Pièce d'identité", type: "PDF", taille: "1.1 Mo", present: true },
      { nom: "Relevé de notes L2", type: "PDF", taille: "0.7 Mo", present: false },
      { nom: "CV", type: "PDF", taille: "0.5 Mo", present: true },
      { nom: "Lettre de motivation", type: "PDF", taille: "0.3 Mo", present: false },
    ],
    syntheseIA:
      "Dossier incomplet : 2 pièces manquantes (relevé L2, lettre de motivation). Profil académique solide sur les pièces présentes.",
    completude: 50,
    historique: [
      { action: "Dossier soumis", date: "30 Oct 2024 11:00", auteur: "Rokia Diallo" },
      { action: "Analyse IA effectuée", date: "30 Oct 2024 11:02", auteur: "Système IA" },
      { action: "Marqué incomplet", date: "30 Oct 2024 16:45", auteur: "Amadou Touré" },
    ],
  },
  {
    id: "CAND-2024-045",
    nom: "Bagayoko",
    prenom: "Seydou",
    email: "seydou.bagayoko@email.ml",
    telephone: "+223 79 55 44 33",
    dateNaissance: "30/01/2005",
    adresse: "Boulevard du Peuple, Sikasso",
    filiere: "BTS NDRC",
    niveau: "1ère année",
    statut: "Rejeté",
    dateSoumission: "29 Oct 2024",
    pieces: [
      { nom: "Pièce d'identité", type: "PDF", taille: "1.3 Mo", present: true },
      { nom: "Baccalauréat", type: "PDF", taille: "2.0 Mo", present: true },
      { nom: "Relevé de notes", type: "PDF", taille: "0.6 Mo", present: true },
    ],
    syntheseIA:
      "Dossier complet mais profil inadapté à la filière visée. Niveau académique insuffisant en commerciales. Recommandation : réorientation.",
    completude: 100,
    historique: [
      { action: "Dossier soumis", date: "29 Oct 2024 10:20", auteur: "Seydou Bagayoko" },
      { action: "Analyse IA effectuée", date: "29 Oct 2024 10:22", auteur: "Système IA" },
      { action: "Dossier rejeté", date: "30 Oct 2024 09:00", auteur: "Amadou Touré" },
    ],
  },
  {
    id: "CAND-2024-044",
    nom: "Doumbia",
    prenom: "Fanta",
    email: "fanta.doumbia@email.ml",
    telephone: "+223 76 77 88 99",
    dateNaissance: "12/05/2005",
    adresse: "Rue 10, Ségou",
    filiere: "BTS SIO",
    niveau: "1ère année",
    statut: "En attente",
    dateSoumission: "28 Oct 2024",
    pieces: [
      { nom: "Pièce d'identité", type: "PDF", taille: "1.0 Mo", present: true },
      { nom: "Baccalauréat", type: "PDF", taille: "2.2 Mo", present: true },
      { nom: "Relevé de notes", type: "PDF", taille: "0.8 Mo", present: true },
    ],
    syntheseIA:
      "Dossier complet. Profil technique prometteur. Lettre de motivation à compléter pour la session de rentrée.",
    completude: 100,
    historique: [
      { action: "Dossier soumis", date: "28 Oct 2024 15:00", auteur: "Fanta Doumbia" },
      { action: "Analyse IA effectuée", date: "28 Oct 2024 15:02", auteur: "Système IA" },
    ],
  },
  {
    id: "CAND-2024-043",
    nom: "Maïga",
    prenom: "Oumar",
    email: "oumar.maiga@email.ml",
    telephone: "+223 65 66 55 44",
    dateNaissance: "19/09/2004",
    adresse: "Avenue de la Liberté, Kayes",
    filiere: "Licence 2",
    niveau: "2ème année",
    statut: "En attente",
    dateSoumission: "27 Oct 2024",
    pieces: [
      { nom: "Pièce d'identité", type: "PDF", taille: "1.4 Mo", present: true },
      { nom: "Relevé de notes L1", type: "PDF", taille: "0.9 Mo", present: true },
      { nom: "CV", type: "PDF", taille: "0.4 Mo", present: true },
    ],
    syntheseIA:
      "Dossier complet. Bon dossier académique. Demande de transfert de filière justifiée.",
    completude: 100,
    historique: [
      { action: "Dossier soumis", date: "27 Oct 2024 13:30", auteur: "Oumar Maïga" },
      { action: "Analyse IA effectuée", date: "27 Oct 2024 13:32", auteur: "Système IA" },
    ],
  },
];

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

export const etudiants: Etudiant[] = [
  { id: "ETU-1", matricule: "2024-SIO-001", nom: "Diabaté", prenom: "Moussa", email: "moussa.diabate@etu.ml", filiere: "BTS SIO", classe: "BTS SIO 2", moyenne: 8.4, assiduite: 72, statut: "Actif" },
  { id: "ETU-2", matricule: "2024-SIO-014", nom: "Diarra", prenom: "Fatoumata", email: "fatoumata.diarra@etu.ml", filiere: "BTS SIO", classe: "BTS SIO 1", moyenne: 9.1, assiduite: 68, statut: "Actif" },
  { id: "ETU-3", matricule: "2024-MCO-008", nom: "Diallo", prenom: "Aïssata", email: "aissata.diallo@etu.ml", filiere: "BTS MCO", classe: "BTS MCO 1", moyenne: 10.2, assiduite: 81, statut: "Actif" },
  { id: "ETU-4", matricule: "2024-LIC-022", nom: "Keïta", prenom: "Modibo", email: "modibo.keita@etu.ml", filiere: "Licence Informatique", classe: "Licence 2", moyenne: 12.8, assiduite: 88, statut: "Actif" },
  { id: "ETU-5", matricule: "2024-NDRC-005", nom: "Sangaré", prenom: "Korotoumou", email: "k.sangare@etu.ml", filiere: "BTS NDRC", classe: "BTS NDRC 2", moyenne: 14.5, assiduite: 95, statut: "Actif" },
  { id: "ETU-6", matricule: "2024-SIO-031", nom: "Traoré", prenom: "Boubacar", email: "boubacar.traore@etu.ml", filiere: "BTS SIO", classe: "BTS SIO 1", moyenne: 13.2, assiduite: 91, statut: "Actif" },
  { id: "ETU-7", matricule: "2024-MCO-019", nom: "Cissé", prenom: "Mariam", email: "mariam.cisse@etu.ml", filiere: "BTS MCO", classe: "BTS MCO 2", moyenne: 11.7, assiduite: 84, statut: "Actif" },
  { id: "ETU-8", matricule: "2024-LIC-040", nom: "Touré", prenom: "Lassana", email: "lassana.toure@etu.ml", filiere: "Licence Informatique", classe: "Licence 3", moyenne: 15.1, assiduite: 97, statut: "Actif" },
];

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

export const enseignants: Enseignant[] = [
  { id: "ENS-1", nom: "Coulibaly", prenom: "Drissa", email: "d.coulibaly@ecole.ml", matieres: ["Développement Web", "Base de données"], classes: ["BTS SIO 1", "BTS SIO 2"], statut: "Actif" },
  { id: "ENS-2", nom: "Traoré", prenom: "Aminata", email: "a.traore@ecole.ml", matieres: ["Management", "Marketing"], classes: ["BTS MCO 1", "BTS MCO 2"], statut: "Actif" },
  { id: "ENS-3", nom: "Koné", prenom: "Bakary", email: "b.kone@ecole.ml", matieres: ["Réseaux", "Système"], classes: ["BTS SIO 2"], statut: "Actif" },
  { id: "ENS-4", nom: "Sidibé", prenom: "Salimata", email: "s.sidibe@ecole.ml", matieres: ["Communication"], classes: ["BTS NDRC 1", "BTS NDRC 2"], statut: "Congé" },
  { id: "ENS-5", nom: "Konaté", prenom: "Mahamadou", email: "m.konate@ecole.ml", matieres: ["Algorithmique", "Mathématiques"], classes: ["Licence 2", "Licence 3"], statut: "Actif" },
  { id: "ENS-6", nom: "Sangaré", prenom: "Oumou", email: "o.sangare@ecole.ml", matieres: ["Gestion", "Économie"], classes: ["BTS MCO 2", "BTS NDRC 2"], statut: "Actif" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Suivi pédagogique — grille de notes (F4.1, F4.2)
// ─────────────────────────────────────────────────────────────────────────────

export type Note = {
  etudiant: string;
  matiere: string;
  classe: string;
  note: number | null;
  sur: number;
  coefficient: number;
  periode: string;
};

export const notesGrille: Note[] = [
  { etudiant: "Moussa Diabaté", matiere: "Développement Web", classe: "BTS SIO 2", note: 8, sur: 20, coefficient: 3, periode: "Semestre 1" },
  { etudiant: "Moussa Diabaté", matiere: "Base de données", classe: "BTS SIO 2", note: 9.5, sur: 20, coefficient: 2, periode: "Semestre 1" },
  { etudiant: "Fatoumata Diarra", matiere: "Développement Web", classe: "BTS SIO 1", note: 9, sur: 20, coefficient: 3, periode: "Semestre 1" },
  { etudiant: "Boubacar Traoré", matiere: "Développement Web", classe: "BTS SIO 1", note: 13, sur: 20, coefficient: 3, periode: "Semestre 1" },
  { etudiant: "Aïssata Diallo", matiere: "Management", classe: "BTS MCO 1", note: 10.5, sur: 20, coefficient: 2, periode: "Semestre 1" },
  { etudiant: "Modibo Keïta", matiere: "Algorithmique", classe: "Licence 2", note: 12.5, sur: 20, coefficient: 3, periode: "Semestre 1" },
  { etudiant: "Korotoumou Sangaré", matiere: "Communication", classe: "BTS NDRC 2", note: 14.5, sur: 20, coefficient: 2, periode: "Semestre 1" },
  { etudiant: "Lassana Touré", matiere: "Algorithmique", classe: "Licence 3", note: 15, sur: 20, coefficient: 3, periode: "Semestre 1" },
];

export type Absence = {
  etudiant: string;
  classe: string;
  matiere: string;
  date: string;
  justifiee: boolean;
};

export const absences: Absence[] = [
  { etudiant: "Moussa Diabaté", classe: "BTS SIO 2", matiere: "Développement Web", date: "28 Oct 2024", justifiee: false },
  { etudiant: "Moussa Diabaté", classe: "BTS SIO 2", matiere: "Réseaux", date: "29 Oct 2024", justifiee: true },
  { etudiant: "Fatoumata Diarra", classe: "BTS SIO 1", matiere: "Développement Web", date: "30 Oct 2024", justifiee: false },
  { etudiant: "Aïssata Diallo", classe: "BTS MCO 1", matiere: "Management", date: "25 Oct 2024", justifiee: false },
  { etudiant: "Modibo Keïta", classe: "Licence 2", matiere: "Algorithmique", date: "24 Oct 2024", justifiee: true },
  { etudiant: "Mariam Cissé", classe: "BTS MCO 2", matiere: "Marketing", date: "23 Oct 2024", justifiee: false },
];

// ─────────────────────────────────────────────────────────────────────────────
// Alertes IA (F4.4) — version complète pour la vue dédiée
// ─────────────────────────────────────────────────────────────────────────────

export const alertesIAComplete: AlerteIA[] = [
  ...alertesIA,
  { id: "ALT-005", etudiant: "Mariam Cissé", classe: "BTS MCO 2", niveau: "Moyen", motif: "3 absences non justifiées ce mois", date: "28 Oct 2024", statut: "Prise en charge", indicatorColor: "bg-orange-500" },
  { id: "ALT-006", etudiant: "Boubacar Traoré", classe: "BTS SIO 1", niveau: "Faible", motif: "Légère baisse sur la dernière évaluation", date: "27 Oct 2024", statut: "Clôturée", indicatorColor: "bg-amber-400" },
  { id: "ALT-007", etudiant: "Lassana Touré", classe: "Licence 3", niveau: "Faible", motif: "Signalement de suivi positif", date: "26 Oct 2024", statut: "Clôturée", indicatorColor: "bg-emerald-400" },
];

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
};

export const rapports: Rapport[] = [
  { id: "RAP-001", titre: "Rapport mensuel — Octobre 2024", periode: "Octobre 2024", dateGeneration: "01 Nov 2024", type: "Mensuel", taille: "1.8 Mo", generePar: "IA (Claude)" },
  { id: "RAP-002", titre: "Suivi pédagogique BTS SIO — S44", periode: "Semaine 44", dateGeneration: "31 Oct 2024", type: "Hebdomadaire", taille: "0.6 Mo", generePar: "IA (Claude)" },
  { id: "RAP-003", titre: "Bilan trimestriel — Q3 2024", periode: "Juillet–Septembre 2024", dateGeneration: "05 Oct 2024", type: "Trimestriel", taille: "3.2 Mo", generePar: "IA (Claude)" },
  { id: "RAP-004", titre: "Analyse des candidatures — Octobre", periode: "Octobre 2024", dateGeneration: "02 Nov 2024", type: "Ponctuel", taille: "0.9 Mo", generePar: "IA (Claude)" },
  { id: "RAP-005", titre: "Rapport d'assiduité global", periode: "Septembre–Octobre 2024", dateGeneration: "30 Oct 2024", type: "Ponctuel", taille: "1.1 Mo", generePar: "IA (Claude)" },
];

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

export const filieres: Filiere[] = [
  {
    id: "FIL-1",
    nom: "BTS SIO",
    code: "SIO",
    description: "Services Informatiques aux Organisations — options SLAM et SISR.",
    classes: [
      { id: "CL-1", nom: "BTS SIO 1", niveau: "1ère année", effectif: 32 },
      { id: "CL-2", nom: "BTS SIO 2", niveau: "2ème année", effectif: 28 },
    ],
    matieres: [
      { id: "MA-1", nom: "Développement Web", coefficient: 3 },
      { id: "MA-2", nom: "Base de données", coefficient: 2 },
      { id: "MA-3", nom: "Réseaux", coefficient: 2 },
      { id: "MA-4", nom: "Algorithmique", coefficient: 3 },
    ],
  },
  {
    id: "FIL-2",
    nom: "BTS MCO",
    code: "MCO",
    description: "Management Commercial Opérationnel.",
    classes: [
      { id: "CL-3", nom: "BTS MCO 1", niveau: "1ère année", effectif: 30 },
      { id: "CL-4", nom: "BTS MCO 2", niveau: "2ème année", effectif: 26 },
    ],
    matieres: [
      { id: "MA-5", nom: "Management", coefficient: 3 },
      { id: "MA-6", nom: "Marketing", coefficient: 2 },
      { id: "MA-7", nom: "Gestion", coefficient: 2 },
    ],
  },
  {
    id: "FIL-3",
    nom: "Licence Informatique",
    code: "LIC-INFO",
    description: "Licence générale en informatique (3 ans).",
    classes: [
      { id: "CL-5", nom: "Licence 1", niveau: "1ère année", effectif: 45 },
      { id: "CL-6", nom: "Licence 2", niveau: "2ème année", effectif: 38 },
      { id: "CL-7", nom: "Licence 3", niveau: "3ème année", effectif: 31 },
    ],
    matieres: [
      { id: "MA-8", nom: "Algorithmique", coefficient: 3 },
      { id: "MA-9", nom: "Mathématiques", coefficient: 2 },
      { id: "MA-10", nom: "Système", coefficient: 2 },
    ],
  },
  {
    id: "FIL-4",
    nom: "BTS NDRC",
    code: "NDRC",
    description: "Négociation et Digitalisation de la Relation Client.",
    classes: [
      { id: "CL-8", nom: "BTS NDRC 1", niveau: "1ère année", effectif: 27 },
      { id: "CL-9", nom: "BTS NDRC 2", niveau: "2ème année", effectif: 24 },
    ],
    matieres: [
      { id: "MA-11", nom: "Communication", coefficient: 3 },
      { id: "MA-12", nom: "Négociation", coefficient: 2 },
    ],
  },
];

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

export const utilisateurs: Utilisateur[] = [
  { id: "U-1", nom: "Touré", prenom: "Amadou", email: "amadou.toure@scolaflow.ml", role: "admin", statut: "Actif", derniereConnexion: "01 Nov 2024 08:00" },
  { id: "U-2", nom: "Keïta", prenom: "Rokia", email: "rokia.keita@scolaflow.ml", role: "responsable", statut: "Actif", derniereConnexion: "01 Nov 2024 07:42" },
  { id: "U-3", nom: "Coulibaly", prenom: "Drissa", email: "d.coulibaly@scolaflow.ml", role: "enseignant", statut: "Actif", derniereConnexion: "31 Oct 2024 18:15" },
  { id: "U-4", nom: "Traoré", prenom: "Aminata", email: "a.traore@scolaflow.ml", role: "enseignant", statut: "Actif", derniereConnexion: "31 Oct 2024 16:30" },
  { id: "U-5", nom: "Diabaté", prenom: "Moussa", email: "moussa.diabate@etu.ml", role: "etudiant", statut: "Actif", derniereConnexion: "31 Oct 2024 14:20" },
  { id: "U-6", nom: "Sangaré", prenom: "Korotoumou", email: "k.sangare@etu.ml", role: "etudiant", statut: "Actif", derniereConnexion: "30 Oct 2024 11:05" },
  { id: "U-7", nom: "Konaté", prenom: "Kadiatou", email: "kadiatou.konate@email.ml", role: "candidat", statut: "Actif", derniereConnexion: "01 Nov 2024 09:12" },
  { id: "U-8", nom: "Sidibé", prenom: "Salimata", email: "s.sidibe@scolaflow.ml", role: "enseignant", statut: "Désactivé", derniereConnexion: "12 Oct 2024 10:00" },
];

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

export const auditLog: EntreeAudit[] = [
  { id: "AUD-024", date: "01 Nov 2024 08:15", utilisateur: "Amadou Touré", action: "Validation dossier", cible: "CAND-2024-047", details: "Dossier validé — statut passé à « Validé »" },
  { id: "AUD-023", date: "30 Oct 2024 16:45", utilisateur: "Amadou Touré", action: "Marquage incomplet", cible: "CAND-2024-046", details: "Pièces manquantes : Relevé L2, Lettre de motivation" },
  { id: "AUD-022", date: "30 Oct 2024 09:00", utilisateur: "Amadou Touré", action: "Rejet dossier", cible: "CAND-2024-045", details: "Motif : profil inadapté à la filière" },
  { id: "AUD-021", date: "29 Oct 2024 14:30", utilisateur: "Rokia Keïta", action: "Clôture alerte", cible: "ALT-006", details: "Élève suivi, situation régularisée" },
  { id: "AUD-020", date: "28 Oct 2024 11:20", utilisateur: "Drissa Coulibaly", action: "Saisie de notes", cible: "BTS SIO 2 — Dév. Web", details: "8 notes saisies pour le semestre 1" },
  { id: "AUD-019", date: "27 Oct 2024 15:45", utilisateur: "Amadou Touré", action: "Modification rôle", cible: "U-7 (Kadiatou Konaté)", details: "Rôle « candidat » → « étudiant »" },
  { id: "AUD-018", date: "26 Oct 2024 10:10", utilisateur: "Rokia Keïta", action: "Création compte", cible: "U-3 (Drissa Coulibaly)", details: "Compte enseignant créé" },
  { id: "AUD-017", date: "25 Oct 2024 17:30", utilisateur: "Amadou Touré", action: "Désactivation compte", cible: "U-8 (Salimata Sidibé)", details: "Compte désactivé (congé)" },
];
