"use client";

import { BarChart3, FileText, Download, Sparkles, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { rapports } from "@/components/dashboard/data";
import { PageHeader, Panel } from "./shared";
import { useToast } from "@/hooks/use-toast";

function typeBadge(type: string) {
  switch (type) {
    case "Mensuel":
      return "bg-blue-50 text-blue-700";
    case "Hebdomadaire":
      return "bg-amber-50 text-amber-600";
    case "Trimestriel":
      return "bg-orange-50 text-orange-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

export function RapportsView() {
  const { toast } = useToast();

  function handleExport(titre: string) {
    toast({
      title: "Export PDF généré",
      description: `${titre} — exporté avec succès.`,
    });
  }

  return (
    <div>
      <PageHeader
        title="Rapports & Statistiques"
        description="Rapports automatiques générés par l'IA via n8n (F5.2 — export PDF)"
        icon={BarChart3}
      />

      {/* Mini KPIs */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Panel className="p-4">
          <p className="text-2xl font-bold text-gray-900">{rapports.length}</p>
          <p className="text-xs text-gray-500">Rapports disponibles</p>
        </Panel>
        <Panel className="p-4">
          <p className="text-2xl font-bold text-blue-700">100%</p>
          <p className="text-xs text-gray-500">Générés par l'IA</p>
        </Panel>
        <Panel className="p-4">
          <p className="text-2xl font-bold text-gray-900">2 458</p>
          <p className="text-xs text-gray-500">Étudiants suivis</p>
        </Panel>
        <Panel className="p-4">
          <p className="text-2xl font-bold text-gray-900">91%</p>
          <p className="text-xs text-gray-500">Assiduité moyenne</p>
        </Panel>
      </div>

      <Panel className="divide-y divide-gray-100">
        {rapports.map((r) => (
          <div
            key={r.id}
            className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
                <FileText className="size-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{r.titre}</p>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    {r.dateGeneration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Sparkles className="size-3 text-amber-500" />
                    {r.genePar}
                  </span>
                  <span>{r.taille}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={`font-normal ${typeBadge(r.type)}`}>
                {r.type}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport(r.titre)}
              >
                <Download className="size-4" />
                Export PDF
              </Button>
            </div>
          </div>
        ))}
      </Panel>
    </div>
  );
}
