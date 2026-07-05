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

export type NavItem = {
  label: string;
  icon: LucideIcon;
};

// Navigation alignée sur les modules du cahier des charges (espace administrateur)
export const navItems: NavItem[] = [
  { label: "Tableau de bord", icon: LayoutGrid },
  { label: "Candidatures", icon: FileText },
  { label: "Étudiants", icon: GraduationCap },
  { label: "Enseignants", icon: Users },
  { label: "Suivi pédagogique", icon: ClipboardList },
  { label: "Alertes IA", icon: BrainCircuit },
  { label: "Rapports", icon: BarChart3 },
  { label: "Filières & Classes", icon: BookOpen },
  { label: "Utilisateurs", icon: UserCog },
  { label: "Journal d'audit", icon: ScrollText },
  { label: "Paramètres", icon: Settings },
];

export type StatCard = {
  label: string;
  value: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  statusColor: string;
  hint: string;
};

// KPIs conformes au cahier des charges (F3.4, F4.4, F5.1)
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

// Onglets de filtrage du tableau de bord (espaces couverts par le RBAC)
export const tabsList = [
  "Candidatures",
  "Étudiants",
  "Enseignants",
  "Notes",
  "Absences",
  "Alertes",
];

// F5.1 — Évolution des inscriptions par mois
export const inscriptionsParMois = [
  { mois: "Jan", inscriptions: 182 },
  { mois: "Fév", inscriptions: 215 },
  { mois: "Mar", inscriptions: 198 },
  { mois: "Avr", inscriptions: 243 },
  { mois: "Mai", inscriptions: 221 },
  { mois: "Juin", inscriptions: 248 },
];

// F5.1 — Taux d'absentéisme par mois (%)
export const absentéismeParMois = [
  { mois: "Jan", taux: 8.2 },
  { mois: "Fév", taux: 7.5 },
  { mois: "Mar", taux: 9.1 },
  { mois: "Avr", taux: 6.8 },
  { mois: "Mai", taux: 7.2 },
  { mois: "Juin", taux: 6.5 },
];

// F4.4 — Alertes pédagogiques générées par l'IA
export type AlerteIA = {
  etudiant: string;
  classe: string;
  niveau: "Élevé" | "Moyen" | "Faible";
  motif: string;
  indicatorColor: string;
};

export const alertesIA: AlerteIA[] = [
  {
    etudiant: "Thomas Roux",
    classe: "BTS SIO 2",
    niveau: "Élevé",
    motif: "Chute des notes + absences répétées",
    indicatorColor: "bg-red-500",
  },
  {
    etudiant: "Emma Lion",
    classe: "BTS MCO 1",
    niveau: "Moyen",
    motif: "Baisse continue sur 3 évaluations",
    indicatorColor: "bg-orange-500",
  },
  {
    etudiant: "Noah Garcia",
    classe: "Licence 2",
    niveau: "Faible",
    motif: "Premier signalement d'assiduité",
    indicatorColor: "bg-amber-400",
  },
  {
    etudiant: "Léa Moreau",
    classe: "BTS SIO 1",
    niveau: "Élevé",
    motif: "Risque de décrochage détecté",
    indicatorColor: "bg-red-500",
  },
];

// F3.1 — Dossiers récents (candidatures)
export type DossierRecent = {
  candidat: string;
  filiere: string;
  date: string;
  statut: "En attente" | "Validé" | "Incomplet" | "Rejeté";
  statutBg: string;
  initialBg: string;
};

export const dossiersRecents: DossierRecent[] = [
  {
    candidat: "Marie Dupont",
    filiere: "BTS SIO",
    date: "01 Nov 2024",
    statut: "En attente",
    statutBg: "bg-amber-50 text-amber-600",
    initialBg: "bg-amber-500",
  },
  {
    candidat: "Jean Martin",
    filiere: "BTS MCO",
    date: "31 Oct 2024",
    statut: "Validé",
    statutBg: "bg-emerald-50 text-emerald-600",
    initialBg: "bg-emerald-500",
  },
  {
    candidat: "Sophie Bernard",
    filiere: "Licence 3",
    date: "30 Oct 2024",
    statut: "Incomplet",
    statutBg: "bg-orange-50 text-orange-600",
    initialBg: "bg-orange-500",
  },
  {
    candidat: "Lucas Petit",
    filiere: "BTS NDRC",
    date: "29 Oct 2024",
    statut: "Rejeté",
    statutBg: "bg-red-50 text-red-500",
    initialBg: "bg-red-500",
  },
];
