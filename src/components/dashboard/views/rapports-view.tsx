"use client";

import { useState } from "react";
import { BarChart3, FileText, Download, Sparkles, Calendar, BrainCircuit, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDataStore } from "@/lib/data-store";
import { type Rapport } from "@/components/dashboard/data";
import {
  PageHeader,
  FullWidthPage,
  FullWidthHeader,
  FullWidthKpiGrid,
  FullWidthSection,
  KpiCard,
} from "./shared";
import { useToast } from "@/hooks/use-toast";

function typeBadge(type: string) {
  switch (type) {
    case "Mensuel":
      return "bg-blue-50 text-blue-700";
    case "Hebdomadaire":
      return "bg-yellow-50 text-yellow-700";
    case "Trimestriel":
      return "bg-orange-50 text-orange-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

export function RapportsView() {
  const { toast } = useToast();
  const rapports = useDataStore((s) => s.rapports);
  const genererRapport = useDataStore((s) => s.genererRapport);
  const etudiants = useDataStore((s) => s.etudiants);
  const [generating, setGenerating] = useState(false);
  const tauxAssiduite =
    etudiants.length === 0
      ? 0
      : Math.round(etudiants.reduce((s, e) => s + e.assiduite, 0) / etudiants.length);
  const rapportsIa = rapports.filter((r) =>
    r.generePar.toLowerCase().includes("ia") || r.generePar.toLowerCase().includes("claude")
  ).length;
  const pctIa = rapports.length
    ? Math.round((rapportsIa / rapports.length) * 100)
    : 0;

  function handleExport(rapport: Rapport) {
    const contenu = [
      rapport.titre,
      `Période : ${rapport.periode}`,
      `Type : ${rapport.type}`,
      `Généré le : ${rapport.dateGeneration}`,
      `Généré par : ${rapport.generePar}`,
    ].join("\n");

    const blob = new Blob([contenu], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${rapport.id}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    toast({
      title: "Rapport téléchargé",
      description: `${rapport.titre} — fichier texte enregistré.`,
    });
  }

  async function handleGenerer() {
    setGenerating(true);
    const periode = new Date().toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
    });
    const result = await genererRapport({ type: "Mensuel", periode });
    setGenerating(false);
    if (result.ok) {
      toast({
        title: "Rapport généré",
        description: `Rapport mensuel pour ${periode} — webhook n8n déclenché.`,
      });
      return;
    }
    toast({
      title: "Échec",
      description: result.error ?? "Impossible de générer le rapport.",
      variant: "destructive",
    });
  }

  return (
    <FullWidthPage>
      <FullWidthHeader>
        <PageHeader
          className="mb-0"
          title="Rapports & Statistiques"
          badge="Module F5"
          description="Rapports automatiques générés par l'IA via n8n (F5.2 — export)"
          icon={BarChart3}
          actionLabel="Générer un rapport"
          onAction={handleGenerer}
        />
      </FullWidthHeader>

      <FullWidthKpiGrid cols={4}>
        <KpiCard
          label="Rapports disponibles"
          value={rapports.length}
          icon={FileText}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <KpiCard
          label="Générés par l'IA"
          value={`${pctIa}%`}
          icon={BrainCircuit}
          color="text-amber-600"
          bg="bg-amber-50"
        />
        <KpiCard
          label="Étudiants suivis"
          value={etudiants.length.toLocaleString("fr-FR")}
          icon={Users}
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
        <KpiCard
          label="Assiduité moyenne"
          value={`${tauxAssiduite}%`}
          icon={TrendingUp}
          color="text-blue-600"
          bg="bg-blue-50"
        />
      </FullWidthKpiGrid>

      <FullWidthSection
        title="Rapports disponibles"
        subtitle={`${rapports.length} document${rapports.length !== 1 ? "s" : ""}`}
      >
        <div className="grid grid-cols-1 gap-0 divide-y divide-gray-100 lg:grid-cols-2 lg:gap-3 lg:divide-y-0">
          {rapports.map((r) => (
            <div
              key={r.id}
              className="flex flex-col gap-3 border-gray-100 p-3 sm:flex-row sm:items-center sm:justify-between lg:rounded-lg lg:border lg:p-4"
            >
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
                  <FileText className="size-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900">{r.titre}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3" />
                      {r.dateGeneration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Sparkles className="size-3 text-yellow-600" />
                      {r.generePar}
                    </span>
                    <span>{r.taille}</span>
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge variant="secondary" className={`font-normal ${typeBadge(r.type)}`}>
                  {r.type}
                </Badge>
                <Button variant="outline" size="sm" onClick={() => handleExport(r)}>
                  <Download className="size-4" />
                  Télécharger
                </Button>
              </div>
            </div>
          ))}
        </div>
      </FullWidthSection>
    </FullWidthPage>
  );
}
