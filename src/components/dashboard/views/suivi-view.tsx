"use client";

import { useState } from "react";
import { ClipboardList, ClipboardEdit, CheckCircle2, XCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAppStore } from "@/lib/view-store";
import { useDataStore } from "@/lib/data-store";
import { PageHeader, Panel, StatusBadge } from "./shared";
import { usePagination, DataTablePagination } from "./data-table-pagination";

function noteColor(n: number) {
  if (n >= 14) return "text-blue-700";
  if (n >= 10) return "text-gray-700";
  return "text-red-500";
}

export function SuiviView() {
  const openModal = useAppStore((s) => s.openModal);
  const [tab, setTab] = useState("notes");

  const notesGrille = useDataStore((s) => s.notes);
  const absences = useDataStore((s) => s.absences);
  const notesPagination = usePagination(notesGrille);
  const absencesPagination = usePagination(absences);

  return (
    <div>
      <PageHeader
        title="Suivi pédagogique"
        description="Notes et absences — saisie enseignant, consultation responsable (F4.1, F4.3)"
        icon={ClipboardList}
        actionLabel="Saisir une note"
        onAction={() => openModal({ type: "note" })}
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-gray-100">
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="absences">Absences</TabsTrigger>
        </TabsList>

        {/* Onglet Notes */}
        <TabsContent value="notes">
          <Panel className="p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">
                Grille de notes — Semestre 1
              </h3>
              <Button
                size="sm"
                className="bg-blue-500 text-white hover:bg-blue-700"
                onClick={() => openModal({ type: "note" })}
              >
                <ClipboardEdit className="size-4" />
                Saisir
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-100">
                  <TableHead className="text-gray-500">Étudiant</TableHead>
                  <TableHead className="text-gray-500">Classe</TableHead>
                  <TableHead className="text-gray-500">Matière</TableHead>
                  <TableHead className="text-gray-500">Coefficient</TableHead>
                  <TableHead className="text-gray-500">Note</TableHead>
                  <TableHead className="text-gray-500">Période</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notesPagination.paged.map((n, idx) => (
                  <TableRow key={idx} className="border-gray-50">
                    <TableCell className="font-medium text-gray-900">
                      {n.etudiant}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {n.classe}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {n.matiere}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-gray-100 font-normal text-gray-600">
                        ×{n.coefficient}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`text-sm font-bold ${noteColor(n.note ?? 0)}`}>
                        {n.note !== null ? `${n.note}/${n.sur}` : "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {n.periode}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <DataTablePagination
              page={notesPagination.page}
              pageSize={notesPagination.pageSize}
              totalPages={notesPagination.totalPages}
              total={notesPagination.total}
              start={notesPagination.start}
              end={notesPagination.end}
              onPageChange={notesPagination.setPage}
              onPageSizeChange={notesPagination.setPageSize}
            />
          </Panel>
        </TabsContent>

        {/* Onglet Absences */}
        <TabsContent value="absences">
          <Panel className="p-4 sm:p-5">
            <h3 className="mb-4 text-base font-semibold text-gray-900">
              Registre des absences
            </h3>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-100">
                  <TableHead className="text-gray-500">Étudiant</TableHead>
                  <TableHead className="text-gray-500">Classe</TableHead>
                  <TableHead className="text-gray-500">Matière</TableHead>
                  <TableHead className="text-gray-500">Date</TableHead>
                  <TableHead className="text-gray-500">Justifiée</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {absencesPagination.paged.map((a, idx) => (
                  <TableRow key={idx} className="border-gray-50">
                    <TableCell className="font-medium text-gray-900">
                      {a.etudiant}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {a.classe}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {a.matiere}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {a.date}
                    </TableCell>
                    <TableCell>
                      {a.justifiee ? (
                        <StatusBadge label="Justifiée" className="bg-blue-50 text-blue-700" />
                      ) : (
                        <StatusBadge label="Non justifiée" className="bg-red-50 text-red-500" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <DataTablePagination
              page={absencesPagination.page}
              pageSize={absencesPagination.pageSize}
              totalPages={absencesPagination.totalPages}
              total={absencesPagination.total}
              start={absencesPagination.start}
              end={absencesPagination.end}
              onPageChange={absencesPagination.setPage}
              onPageSizeChange={absencesPagination.setPageSize}
            />
            <div className="mt-4 flex items-center gap-4 rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-blue-500" /> Absences justifiées
              </span>
              <span className="flex items-center gap-1.5">
                <XCircle className="size-4 text-red-500" /> Absences non justifiées (alimentent l'IA)
              </span>
            </div>
          </Panel>
        </TabsContent>
      </Tabs>
    </div>
  );
}
