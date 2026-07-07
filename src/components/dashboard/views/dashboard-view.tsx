"use client";

import { useAuthStore } from "@/lib/auth-store";
import { useDataStore } from "@/lib/data-store";
import { useAppStore } from "@/lib/view-store";
import { roleLabels, type Role } from "../data";
import { WelcomeSection } from "../welcome-section";
import { StatsCards } from "../stats-cards";
import { InscriptionsChart } from "../inscriptions-chart";
import { AbsenteismeChart } from "../absenteisme-chart";
import { RepartitionFiliereChart } from "../repartition-filiere-chart";
import { N8nStatus } from "../n8n-status";
import { DossiersRecents } from "../dossiers-recents";
import { ClassesARisque } from "../classes-risque";
import { CalendarWidget } from "../calendar-widget";
import { AlertesIA } from "../alertes-ia";
import { StatusBadge, Panel, PageHeader, statutBadge, noteSur20 } from "./shared";
import {
  FileText,
  GraduationCap,
  TrendingUp,
  CalendarCheck,
  ClipboardList,
  BrainCircuit,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";

function StatPill({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-gray-100 bg-white px-3 py-2.5">
      <div className={`flex size-9 items-center justify-center rounded-lg ${color}`}>
        <Icon className="size-4" />
      </div>
      <div>
        <p className="text-[11px] leading-none text-gray-400">{label}</p>
        <p className="mt-1 text-base font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

// ─── Dashboard Candidat : suivi de son propre dossier ────────────────────────
function CandidatDashboard() {
  const session = useAuthStore((s) => s.session);
  const candidatures = useDataStore((s) => s.candidatures);
  const setView = useAppStore((s) => s.setView);
  const openDossier = useAppStore((s) => s.openDossier);

  // Le candidat voit son propre dossier (recherche par email)
  const monDossier = candidatures.find(
    (c) => c.email === session?.email
  );

  if (!monDossier) {
    return (
      <div>
        <WelcomeSection />
        <Panel className="p-8 text-center">
          <FileText className="mx-auto size-10 text-gray-300" />
          <h3 className="mt-3 text-lg font-semibold text-gray-900">
            Aucun dossier soumis
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Vous n&apos;avez pas encore soumis de dossier d&apos;inscription.
          </p>
        </Panel>
      </div>
    );
  }

  const piecesPresentes = monDossier.pieces.filter((p) => p.present).length;

  return (
    <div className="space-y-6">
      <WelcomeSection />

      <Panel className="overflow-hidden p-0">
        <div
          className={`h-1.5 w-full ${
            monDossier.statut === "Validé"
              ? "bg-blue-500"
              : monDossier.statut === "En attente"
                ? "bg-yellow-500"
                : monDossier.statut === "Incomplet"
                  ? "bg-orange-500"
                  : "bg-red-500"
          }`}
        />
        <div className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-xl font-bold text-white shadow-lg shadow-blue-500/20">
                {monDossier.prenom.charAt(0)}
                {monDossier.nom.charAt(0)}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Mon dossier
                  </h1>
                  <StatusBadge
                    label={monDossier.statut}
                    className={statutBadge(monDossier.statut)}
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  <span className="font-mono">{monDossier.id}</span> · Soumis le{" "}
                  {monDossier.dateSoumission}
                </p>
              </div>
            </div>
            <button
              onClick={() => openDossier(monDossier.id)}
              className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Voir le détail
              <ArrowRight className="size-4" />
            </button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <StatPill
              icon={GraduationCap}
              label="Filière"
              value={monDossier.filiere}
              color="bg-blue-50 text-blue-500"
            />
            <StatPill
              icon={FileText}
              label="Niveau"
              value={monDossier.niveau}
              color="bg-yellow-50 text-yellow-600"
            />
            <StatPill
              icon={CheckCircle2}
              label="Pièces fournies"
              value={`${piecesPresentes}/${monDossier.pieces.length}`}
              color="bg-blue-50 text-blue-500"
            />
            <StatPill
              icon={BrainCircuit}
              label="Complétude IA"
              value={`${monDossier.completude}%`}
              color={
                monDossier.completude === 100
                  ? "bg-blue-50 text-blue-500"
                  : "bg-yellow-50 text-yellow-600"
              }
            />
          </div>
        </div>
      </Panel>

      {/* Synthèse IA du dossier */}
      <Panel className="overflow-hidden p-0">
        <div className="flex items-center gap-2 border-b border-yellow-100 bg-yellow-50/60 px-5 py-3.5">
          <BrainCircuit className="size-4 text-yellow-700" />
          <h3 className="text-sm font-semibold text-gray-900">
            Synthèse d&apos;analyse IA
          </h3>
        </div>
        <div className="p-5">
          <p className="text-sm leading-relaxed text-gray-700">
            {monDossier.syntheseIA}
          </p>
        </div>
      </Panel>

      {monDossier.statut === "Incomplet" && (
        <Panel className="border-orange-100 bg-orange-50/40 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="size-5 shrink-0 text-orange-500" />
            <div>
              <h3 className="text-sm font-semibold text-orange-700">
                Action requise : dossier incomplet
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Votre dossier nécessite des pièces complémentaires. Consultez le
                détail pour voir les éléments manquants.
              </p>
            </div>
          </div>
        </Panel>
      )}
    </div>
  );
}

// ─── Dashboard Étudiant : suivi pédagogique personnel ─────────────────────────
function EtudiantDashboard() {
  const session = useAuthStore((s) => s.session);
  const etudiants = useDataStore((s) => s.etudiants);
  const notes = useDataStore((s) => s.notes);
  const absences = useDataStore((s) => s.absences);
  const setView = useAppStore((s) => s.setView);

  const monProfil = etudiants.find(
    (e) => e.email === session?.email
  );

  if (!monProfil) {
    return (
      <div>
        <WelcomeSection />
        <Panel className="p-8 text-center">
          <GraduationCap className="mx-auto size-10 text-gray-300" />
          <h3 className="mt-3 text-lg font-semibold text-gray-900">
            Profil étudiant introuvable
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Votre profil n&apos;est pas encore rattaché à un compte étudiant.
          </p>
        </Panel>
      </div>
    );
  }

  const mesNotes = notes.filter(
    (n) => n.etudiant === `${monProfil.prenom} ${monProfil.nom}`
  );
  const mesAbsences = absences.filter(
    (a) => a.etudiant === `${monProfil.prenom} ${monProfil.nom}`
  );
  const absencesNonJustifiees = mesAbsences.filter((a) => !a.justifiee).length;
  const mesNotesNotees = mesNotes.filter((n) => n.note !== null);
  const moyenneCalculee =
    mesNotesNotees.length > 0
      ? (
          mesNotesNotees.reduce((s, n) => s + noteSur20(n.note, n.sur) * n.coefficient, 0) /
          mesNotesNotees.reduce((s, n) => s + n.coefficient, 0)
        ).toFixed(2)
      : "—";

  return (
    <div className="space-y-6">
      <WelcomeSection />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatPill
          icon={TrendingUp}
          label="Ma moyenne"
          value={`${moyenneCalculee}/20`}
          color={
            parseFloat(moyenneCalculee) >= 14
              ? "bg-blue-50 text-blue-500"
              : parseFloat(moyenneCalculee) >= 10
                ? "bg-gray-100 text-gray-500"
                : "bg-red-50 text-red-500"
          }
        />
        <StatPill
          icon={CalendarCheck}
          label="Mon assiduité"
          value={`${monProfil.assiduite}%`}
          color={
            monProfil.assiduite >= 90
              ? "bg-blue-50 text-blue-500"
              : monProfil.assiduite >= 75
                ? "bg-yellow-50 text-yellow-600"
                : "bg-red-50 text-red-500"
          }
        />
        <StatPill
          icon={ClipboardList}
          label="Notes saisies"
          value={String(mesNotes.length)}
          color="bg-blue-50 text-blue-500"
        />
        <StatPill
          icon={Clock}
          label="Absences non justifiées"
          value={String(absencesNonJustifiees)}
          color={
            absencesNonJustifiees === 0
              ? "bg-blue-50 text-blue-500"
              : "bg-red-50 text-red-500"
          }
        />
      </div>

      <Panel className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">
            Mes dernières notes
          </h3>
          <button
            onClick={() => setView("suivi")}
            className="flex items-center gap-1 text-xs font-medium text-blue-700 transition hover:text-blue-800"
          >
            Voir tout le suivi
            <ArrowRight className="size-3.5" />
          </button>
        </div>
        {mesNotes.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">
            Aucune note n&apos;a encore été saisie.
          </p>
        ) : (
          <ul className="space-y-2">
            {mesNotes.slice(0, 5).map((n, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {n.matiere}
                  </p>
                  <p className="text-xs text-gray-400">
                    {n.classe} · {n.periode} · coef. {n.coefficient}
                  </p>
                </div>
                <span
                  className={`text-sm font-bold ${
                    noteSur20(n.note, n.sur) >= 14
                      ? "text-blue-700"
                      : noteSur20(n.note, n.sur) >= 10
                        ? "text-gray-700"
                        : "text-red-500"
                  }`}
                >
                  {n.note}/{n.sur}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

// ─── Dashboard global (enseignant, responsable, admin) ────────────────────────
function GlobalDashboard() {
  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6">
      <WelcomeSection />

      <StatsCards />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <InscriptionsChart />
        <AbsenteismeChart />
        <RepartitionFiliereChart />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <N8nStatus />
        <DossiersRecents />
        <ClassesARisque />
      </div>

      {/* Sidebar droite — calendrier + alertes (visible sur très grand écran) */}
      <div className="hidden 2xl:grid grid-cols-2 gap-6">
        <CalendarWidget />
        <AlertesIA />
      </div>
    </div>
  );
}

// ─── Routeur de dashboard selon le rôle ───────────────────────────────────────
const dashboardByRole: Record<Role, React.ComponentType> = {
  candidat: CandidatDashboard,
  etudiant: EtudiantDashboard,
  enseignant: GlobalDashboard,
  responsable: GlobalDashboard,
  admin: GlobalDashboard,
};

export function DashboardView() {
  const session = useAuthStore((s) => s.session);
  const role = session?.role ?? "admin";
  const ActiveDashboard = dashboardByRole[role] ?? GlobalDashboard;
  return <ActiveDashboard />;
}
