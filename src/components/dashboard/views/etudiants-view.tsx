"use client";

import { useState } from "react";
import { GraduationCap, Eye, ClipboardEdit } from "lucide-react";
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
import { etudiants } from "@/components/dashboard/data";
import { PageHeader, Toolbar, Panel, StatusBadge } from "./shared";

function moyenneColor(m: number) {
  if (m >= 14) return "text-emerald-600";
  if (m >= 10) return "text-gray-700";
  return "text-red-500";
}

function assiduiteColor(a: number) {
  if (a >= 90) return "bg-emerald-500";
  if (a >= 75) return "bg-amber-500";
  return "bg-red-500";
}

export function EtudiantsView() {
  const openModal = useAppStore((s) => s.openModal);
  const [search, setSearch] = useState("");
  const [filiere, setFiliere] = useState("Toutes");

  const filieresUniques = [
    "Toutes",
    ...Array.from(new Set(etudiants.map((e) => e.filiere))),
  ];

  const filtered = etudiants.filter((e) => {
    const matchSearch = `${e.prenom} ${e.nom} ${e.matricule} ${e.email}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchFiliere = filiere === "Toutes" || e.filiere === filiere;
    return matchSearch && matchFiliere;
  });

  return (
    <div>
      <PageHeader
        title="Étudiants"
        description="Liste des étudiants inscrits (F4.2 — consultation des notes et assiduité)"
        icon={GraduationCap}
      />

      <Panel className="p-4 sm:p-5">
        <Toolbar search={search} onSearch={setSearch}>
          <Select value={filiere} onValueChange={setFiliere}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filière" />
            </SelectTrigger>
            <SelectContent>
              {filieresUniques.map((f) => (
                <SelectItem key={f} value={f}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Toolbar>

        <Table>
          <TableHeader>
            <TableRow className="border-gray-100">
              <TableHead className="text-gray-500">Étudiant</TableHead>
              <TableHead className="text-gray-500">Matricule</TableHead>
              <TableHead className="text-gray-500">Filière</TableHead>
              <TableHead className="text-gray-500">Classe</TableHead>
              <TableHead className="text-gray-500">Moyenne</TableHead>
              <TableHead className="text-gray-500">Assiduité</TableHead>
              <TableHead className="text-gray-500">Statut</TableHead>
              <TableHead className="text-right text-gray-500">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((e) => (
              <TableRow key={e.id} className="border-gray-50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
                      {e.prenom.charAt(0)}
                      {e.nom.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {e.prenom} {e.nom}
                      </p>
                      <p className="text-xs text-gray-400">{e.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-600 font-mono">
                  {e.matricule}
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {e.filiere}
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {e.classe}
                </TableCell>
                <TableCell>
                  <span className={`text-sm font-bold ${moyenneColor(e.moyenne)}`}>
                    {e.moyenne.toFixed(1)}/20
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className={`h-full rounded-full ${assiduiteColor(e.assiduite)}`}
                        style={{ width: `${e.assiduite}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-600">
                      {e.assiduite}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge
                    label={e.statut}
                    className={
                      e.statut === "Actif"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-gray-100 text-gray-500"
                    }
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm">
                      <Eye className="size-4" />
                      Fiche
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        openModal({ type: "note", etudiant: e.nom })
                      }
                    >
                      <ClipboardEdit className="size-4" />
                      Note
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Panel>
    </div>
  );
}
