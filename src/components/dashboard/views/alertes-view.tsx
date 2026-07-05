"use client";

import { useState } from "react";
import { BrainCircuit, ShieldCheck } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/view-store";
import { alertesIAComplete } from "@/components/dashboard/data";
import {
  PageHeader,
  Toolbar,
  Panel,
  StatusBadge,
  niveauBadge,
} from "./shared";

function statutBadgeClass(statut: string) {
  switch (statut) {
    case "Nouvelle":
      return "bg-amber-50 text-amber-600";
    case "Prise en charge":
      return "bg-orange-50 text-orange-600";
    case "Clôturée":
      return "bg-emerald-50 text-emerald-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

export function AlertesView() {
  const openModal = useAppStore((s) => s.openModal);
  const [search, setSearch] = useState("");
  const [filtre, setFiltre] = useState("Toutes");

  const filtered = alertesIAComplete.filter((a) => {
    const matchSearch = `${a.etudiant} ${a.classe} ${a.motif}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchFiltre =
      filtre === "Toutes" || a.statut === filtre;
    return matchSearch && matchFiltre;
  });

  const compteurs = {
    "Nouvelle": alertesIAComplete.filter((a) => a.statut === "Nouvelle").length,
    "Prise en charge": alertesIAComplete.filter((a) => a.statut === "Prise en charge").length,
    "Clôturée": alertesIAComplete.filter((a) => a.statut === "Clôturée").length,
  };

  return (
    <div>
      <PageHeader
        title="Alertes IA"
        description="Détection de risque pédagogique générée par l'IA (F4.4)"
        icon={BrainCircuit}
      />

      <div className="mb-6 grid grid-cols-3 gap-4">
        <Panel className="p-4">
          <p className="text-2xl font-bold text-amber-600">
            {compteurs["Nouvelle"]}
          </p>
          <p className="text-xs text-gray-500">Nouvelles</p>
        </Panel>
        <Panel className="p-4">
          <p className="text-2xl font-bold text-orange-600">
            {compteurs["Prise en charge"]}
          </p>
          <p className="text-xs text-gray-500">Prises en charge</p>
        </Panel>
        <Panel className="p-4">
          <p className="text-2xl font-bold text-emerald-600">
            {compteurs["Clôturée"]}
          </p>
          <p className="text-xs text-gray-500">Clôturées</p>
        </Panel>
      </div>

      <Panel className="p-4 sm:p-5">
        <Toolbar search={search} onSearch={setSearch}>
          <Select value={filtre} onValueChange={setFiltre}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Toutes">Toutes</SelectItem>
              <SelectItem value="Nouvelle">Nouvelle</SelectItem>
              <SelectItem value="Prise en charge">Prise en charge</SelectItem>
              <SelectItem value="Clôturée">Clôturée</SelectItem>
            </SelectContent>
          </Select>
        </Toolbar>

        <Table>
          <TableHeader>
            <TableRow className="border-gray-100">
              <TableHead className="text-gray-500">Réf.</TableHead>
              <TableHead className="text-gray-500">Étudiant</TableHead>
              <TableHead className="text-gray-500">Classe</TableHead>
              <TableHead className="text-gray-500">Motif</TableHead>
              <TableHead className="text-gray-500">Niveau</TableHead>
              <TableHead className="text-gray-500">Statut</TableHead>
              <TableHead className="text-right text-gray-500">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((a) => (
              <TableRow key={a.id} className="border-gray-50">
                <TableCell className="font-mono text-xs text-gray-400">
                  {a.id}
                </TableCell>
                <TableCell className="font-medium text-gray-900">
                  {a.etudiant}
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {a.classe}
                </TableCell>
                <TableCell className="max-w-xs text-sm text-gray-600">
                  {a.motif}
                </TableCell>
                <TableCell>
                  <StatusBadge
                    label={a.niveau}
                    className={niveauBadge(a.niveau)}
                  />
                </TableCell>
                <TableCell>
                  <StatusBadge
                    label={a.statut}
                    className={statutBadgeClass(a.statut)}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                    onClick={() =>
                      openModal({ type: "alerte", alerteId: a.id })
                    }
                  >
                    <ShieldCheck className="size-4" />
                    Traiter
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Panel>
    </div>
  );
}
