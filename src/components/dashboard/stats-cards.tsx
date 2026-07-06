"use client";

import {
  GraduationCap,
  FileText,
  CheckCircle2,
  AlertCircle,
  BrainCircuit,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDataStore } from "@/lib/data-store";

export function StatsCards() {
  const etudiants = useDataStore((s) => s.etudiants);
  const candidatures = useDataStore((s) => s.candidatures);
  const alertes = useDataStore((s) => s.alertes);

  // Calculs dynamiques depuis le store
  const totalEtudiants = etudiants.length;
  const candidaturesEnAttente = candidatures.filter(
    (c) => c.statut === "En attente"
  ).length;
  const dossiersValides = candidatures.filter(
    (c) => c.statut === "Validé"
  ).length;
  const dossiersIncomplets = candidatures.filter(
    (c) => c.statut === "Incomplet"
  ).length;
  const alertesActives = alertes.filter(
    (a) => a.statut !== "Clôturée"
  ).length;
  // Taux d'assiduité moyen
  const tauxAssiduite =
    totalEtudiants === 0
      ? 0
      : Math.round(
          etudiants.reduce((sum, e) => sum + e.assiduite, 0) / totalEtudiants
        );

  const stats = [
    {
      label: "Total Étudiants",
      value: totalEtudiants.toLocaleString("fr-FR"),
      icon: GraduationCap,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
      statusColor: "bg-blue-500",
      hint: "Inscrits actifs",
    },
    {
      label: "Nouvelles Candidatures",
      value: candidaturesEnAttente.toString(),
      icon: FileText,
      iconBg: "bg-yellow-50",
      iconColor: "text-yellow-600",
      statusColor: "bg-blue-500",
      hint: "En attente",
    },
    {
      label: "Dossiers Validés",
      value: dossiersValides.toString(),
      icon: CheckCircle2,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
      statusColor: "bg-blue-500",
      hint: "Traités",
    },
    {
      label: "Dossiers Incomplets",
      value: dossiersIncomplets.toString(),
      icon: AlertCircle,
      iconBg: "bg-red-50",
      iconColor: "text-red-500",
      statusColor: dossiersIncomplets > 0 ? "bg-yellow-500" : "bg-blue-500",
      hint: dossiersIncomplets > 0 ? "Action requise" : "Aucun",
    },
    {
      label: "Alertes IA Actives",
      value: alertesActives.toString(),
      icon: BrainCircuit,
      iconBg: "bg-yellow-50",
      iconColor: "text-yellow-600",
      statusColor: alertesActives > 0 ? "bg-yellow-500" : "bg-blue-500",
      hint: alertesActives > 0 ? "Risque pédagogique" : "Aucune alerte",
    },
    {
      label: "Taux d'Assiduité",
      value: `${tauxAssiduite}%`,
      icon: TrendingUp,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
      statusColor: tauxAssiduite >= 85 ? "bg-blue-500" : "bg-yellow-500",
      hint: "Établissement",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div
                className={cn(
                  "flex size-10 items-center justify-center rounded-full",
                  stat.iconBg
                )}
              >
                <Icon className={cn("size-5", stat.iconColor)} />
              </div>
              <span
                className={cn(
                  "size-2.5 rounded-full ring-4 ring-blue-50",
                  stat.statusColor
                )}
                title="En direct"
              />
            </div>
            <p className="mt-4 text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="mt-1 text-xs font-medium text-gray-700">
              {stat.label}
            </p>
            <p className="text-[11px] text-gray-400">{stat.hint}</p>
          </div>
        );
      })}
    </div>
  );
}
