"use client";

import { useState } from "react";
import { FileText, Eye, MoreVertical, Clock, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/view-store";
import {
  candidatures,
  type StatutDossier,
} from "@/components/dashboard/data";
import {
  PageHeader,
  Toolbar,
  Panel,
  StatusBadge,
  statutBadge,
} from "./shared";

const statuts: ("Tous" | StatutDossier)[] = [
  "Tous",
  "En attente",
  "Validé",
  "Incomplet",
  "Rejeté",
];

export function CandidaturesView() {
  const openModal = useAppStore((s) => s.openModal);
  const [search, setSearch] = useState("");
  const [filtreStatut, setFiltreStatut] = useState<string>("Tous");

  const filtered = candidatures.filter((c) => {
    const matchSearch =
      `${c.prenom} ${c.nom} ${c.email} ${c.id}`
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchStatut =
      filtreStatut === "Tous" || c.statut === filtreStatut;
    return matchSearch && matchStatut;
  });

  // Indicateurs F3.4
  const compteurs = {
    "En attente": candidatures.filter((c) => c.statut === "En attente").length,
    "Validé": candidatures.filter((c) => c.statut === "Validé").length,
    "Incomplet": candidatures.filter((c) => c.statut === "Incomplet").length,
    "Rejeté": candidatures.filter((c) => c.statut === "Rejeté").length,
  };

  const indicateurs = [
    { label: "En attente", value: compteurs["En attente"], icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Validés", value: compteurs["Validé"], icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Incomplets", value: compteurs["Incomplet"], icon: AlertCircle, color: "text-orange-500", bg: "bg-orange-50" },
    { label: "Rejetés", value: compteurs["Rejeté"], icon: XCircle, color: "text-red-500", bg: "bg-red-50" },
  ];

  return (
    <div>
      <PageHeader
        title="Candidatures"
        description="Gestion des dossiers d'inscription soumis (module F3)"
        icon={FileText}
      />

      {/* Indicateurs F3.4 */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {indicateurs.map((ind) => {
          const Icon = ind.icon;
          return (
            <Panel key={ind.label} className="flex items-center gap-3 p-4">
              <div
                className={`flex size-10 items-center justify-center rounded-full ${ind.bg}`}
              >
                <Icon className={`size-5 ${ind.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{ind.value}</p>
                <p className="text-xs text-gray-500">{ind.label}</p>
              </div>
            </Panel>
          );
        })}
      </div>

      <Panel className="p-4 sm:p-5">
        <Toolbar search={search} onSearch={setSearch}>
          <Select value={filtreStatut} onValueChange={setFiltreStatut}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              {statuts.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Toolbar>

        <Table>
          <TableHeader>
            <TableRow className="border-gray-100">
              <TableHead className="text-gray-500">Candidat</TableHead>
              <TableHead className="text-gray-500">Filière</TableHead>
              <TableHead className="text-gray-500">Date</TableHead>
              <TableHead className="text-gray-500">Complétude</TableHead>
              <TableHead className="text-gray-500">Statut</TableHead>
              <TableHead className="text-right text-gray-500">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => (
              <TableRow key={c.id} className="border-gray-50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-full bg-emerald-500 text-sm font-semibold text-white">
                      {c.prenom.charAt(0)}
                      {c.nom.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {c.prenom} {c.nom}
                      </p>
                      <p className="text-xs text-gray-400">{c.id}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm text-gray-700">{c.filiere}</p>
                    <p className="text-xs text-gray-400">{c.niveau}</p>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {c.dateSoumission}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${c.completude}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-600">
                      {c.completude}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge
                    label={c.statut}
                    className={statutBadge(c.statut)}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        openModal({ type: "dossier-detail", dossierId: c.id })
                      }
                    >
                      <Eye className="size-4" />
                      Détails
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions sur le dossier</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            openModal({
                              type: "traitement-dossier",
                              dossierId: c.id,
                              action: "valider",
                            })
                          }
                        >
                          <CheckCircle2 className="size-4 text-emerald-500" />
                          Valider
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            openModal({
                              type: "traitement-dossier",
                              dossierId: c.id,
                              action: "incomplet",
                            })
                          }
                        >
                          <AlertCircle className="size-4 text-orange-500" />
                          Marquer incomplet
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-700"
                          onClick={() =>
                            openModal({
                              type: "traitement-dossier",
                              dossierId: c.id,
                              action: "rejeter",
                            })
                          }
                        >
                          <XCircle className="size-4" />
                          Rejeter
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-gray-400">
                  Aucune candidature ne correspond à votre recherche.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Panel>
    </div>
  );
}
