"use client";

import { useState } from "react";
import { ScrollText, Filter } from "lucide-react";
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
import { auditLog } from "@/components/dashboard/data";
import { PageHeader, Toolbar, Panel } from "./shared";
import { usePagination, DataTablePagination } from "./data-table-pagination";

const actionsUniques = ["Toutes", ...Array.from(new Set(auditLog.map((a) => a.action)))];

function actionColor(action: string) {
  switch (action) {
    case "Validation dossier":
      return "bg-emerald-50 text-emerald-600";
    case "Rejet dossier":
      return "bg-red-50 text-red-500";
    case "Marquage incomplet":
      return "bg-orange-50 text-orange-600";
    case "Clôture alerte":
      return "bg-amber-50 text-amber-600";
    case "Saisie de notes":
      return "bg-emerald-50 text-emerald-600";
    case "Modification rôle":
      return "bg-orange-50 text-orange-600";
    case "Création compte":
      return "bg-emerald-50 text-emerald-600";
    case "Désactivation compte":
      return "bg-gray-100 text-gray-500";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

export function AuditView() {
  const [search, setSearch] = useState("");
  const [filtreAction, setFiltreAction] = useState("Toutes");

  const filtered = auditLog.filter((a) => {
    const matchSearch = `${a.utilisateur} ${a.cible} ${a.details}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchAction =
      filtreAction === "Toutes" || a.action === filtreAction;
    return matchSearch && matchAction;
  });

  const pagination = usePagination(filtered, 10);

  return (
    <div>
      <PageHeader
        title="Journal d'audit"
        description="Traçabilité des actions sensibles (F6.3 — R5 : auteur, horodatage, ancien/nouvel état)"
        icon={ScrollText}
      />

      <Panel className="p-4 sm:p-5">
        <Toolbar search={search} onSearch={setSearch}>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Filter className="size-3.5" />
            Filtrer par action
          </div>
          <Select value={filtreAction} onValueChange={setFiltreAction}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Type d'action" />
            </SelectTrigger>
            <SelectContent>
              {actionsUniques.map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Toolbar>

        <Table>
          <TableHeader>
            <TableRow className="border-gray-100">
              <TableHead className="text-gray-500">Réf.</TableHead>
              <TableHead className="text-gray-500">Date</TableHead>
              <TableHead className="text-gray-500">Auteur</TableHead>
              <TableHead className="text-gray-500">Action</TableHead>
              <TableHead className="text-gray-500">Cible</TableHead>
              <TableHead className="text-gray-500">Détails</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagination.paged.map((a) => (
              <TableRow key={a.id} className="border-gray-50">
                <TableCell className="font-mono text-xs text-gray-400">
                  {a.id}
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm text-gray-600">
                  {a.date}
                </TableCell>
                <TableCell className="text-sm font-medium text-gray-900">
                  {a.utilisateur}
                </TableCell>
                <TableCell>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${actionColor(a.action)}`}
                  >
                    {a.action}
                  </span>
                </TableCell>
                <TableCell className="font-mono text-xs text-gray-600">
                  {a.cible}
                </TableCell>
                <TableCell className="max-w-sm text-sm text-gray-500">
                  {a.details}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <DataTablePagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          totalPages={pagination.totalPages}
          total={pagination.total}
          start={pagination.start}
          end={pagination.end}
          onPageChange={pagination.setPage}
          onPageSizeChange={pagination.setPageSize}
        />

        <div className="mt-4 flex items-center justify-between rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
          <span>
            {pagination.total} entrée{pagination.total > 1 ? "s" : ""} au total
          </span>
          <span>Conformité R5 : journalisation automatique</span>
        </div>
      </Panel>
    </div>
  );
}
