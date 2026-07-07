"use client";

import { useState } from "react";
import { ScrollText, Filter, User } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { useDataStore } from "@/lib/data-store";
import {
  PageHeader,
  Toolbar,
  FullWidthPage,
  FullWidthHeader,
  FullWidthSection,
  ActiveFilterChips,
  ResetFiltersButton,
  MobileCard,
  MobileOnly,
  DesktopOnly,
  EmptyState,
  filteredSubtitle,
  tableHeadClass,
  tableRowClass,
} from "./shared";
import { usePagination, DataTablePagination } from "./data-table-pagination";


function actionColor(action: string) {
  switch (action) {
    case "Validation dossier":
      return "bg-blue-50 text-blue-700";
    case "Rejet dossier":
      return "bg-red-50 text-red-500";
    case "Marquage incomplet":
      return "bg-orange-50 text-orange-600";
    case "Clôture alerte":
      return "bg-yellow-50 text-yellow-700";
    case "Saisie de notes":
      return "bg-blue-50 text-blue-700";
    case "Modification rôle":
      return "bg-orange-50 text-orange-600";
    case "Création compte":
      return "bg-blue-50 text-blue-700";
    case "Désactivation compte":
      return "bg-gray-100 text-gray-500";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

export function AuditView() {
  const auditLog = useDataStore((s) => s.audit);
  const actionsUniques = ["Toutes", ...Array.from(new Set(auditLog.map((a) => a.action)))];
  const [search, setSearch] = useState("");
  const [filtreAction, setFiltreAction] = useState("Toutes");

  const filtered = auditLog.filter((a) => {
    const matchSearch = `${a.utilisateur} ${a.cible} ${a.details}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchAction = filtreAction === "Toutes" || a.action === filtreAction;
    return matchSearch && matchAction;
  });

  const pagination = usePagination(filtered, 10);

  const hasActiveFilters = search.length > 0 || filtreAction !== "Toutes";

  function resetFilters() {
    setSearch("");
    setFiltreAction("Toutes");
    pagination.setPage(1);
  }

  const filterChips = [
    ...(search
      ? [{ id: "search", label: `« ${search} »`, tone: "gray" as const, onRemove: () => setSearch("") }]
      : []),
    ...(filtreAction !== "Toutes"
      ? [{ id: "action", label: filtreAction, tone: "blue" as const, onRemove: () => setFiltreAction("Toutes") }]
      : []),
  ];

  return (
    <FullWidthPage>
      <FullWidthHeader>
        <PageHeader
          className="mb-0"
          title="Journal d'audit"
          badge="Module F6.3"
          description="Traçabilité des actions sensibles (F6.3 — R5 : auteur, horodatage, ancien/nouvel état)"
          icon={ScrollText}
        />
      </FullWidthHeader>

      <FullWidthSection
        title="Entrées du journal"
        subtitle={filteredSubtitle(filtered.length, hasActiveFilters)}
        headerAction={hasActiveFilters ? <ResetFiltersButton onClick={resetFilters} /> : undefined}
        toolbar={
          <Toolbar
            search={search}
            onSearch={(v) => {
              setSearch(v);
              pagination.setPage(1);
            }}
          >
            <Select
              value={filtreAction}
              onValueChange={(v) => {
                setFiltreAction(v);
                pagination.setPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-full sm:w-[220px]">
                <Filter className="mr-1.5 size-3.5 text-gray-400" />
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
        }
        footer={
          <>
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
            <div className="mt-3 flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
              <span>
                {pagination.total} entrée{pagination.total > 1 ? "s" : ""} au total
              </span>
              <span>Conformité R5 : journalisation automatique</span>
            </div>
          </>
        }
      >
        <ActiveFilterChips chips={filterChips} />

        <MobileOnly>
          {pagination.paged.map((a) => (
            <MobileCard
              key={a.id}
              body={
                <>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-xs text-gray-400">{a.id}</span>
                    <span className="whitespace-nowrap text-xs text-gray-500">{a.date}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <User className="size-3.5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">{a.utilisateur}</span>
                  </div>
                  <div className="mt-2">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${actionColor(a.action)}`}
                    >
                      {a.action}
                    </span>
                  </div>
                  <p className="mt-2 font-mono text-xs text-gray-500">{a.cible}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-600">{a.details}</p>
                </>
              }
            />
          ))}
        </MobileOnly>

        <DesktopOnly>
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="border-gray-100 hover:bg-transparent">
                  <TableHead className={tableHeadClass}>Réf.</TableHead>
                  <TableHead className={tableHeadClass}>Date</TableHead>
                  <TableHead className={tableHeadClass}>Auteur</TableHead>
                  <TableHead className={tableHeadClass}>Action</TableHead>
                  <TableHead className={tableHeadClass}>Cible</TableHead>
                  <TableHead className={tableHeadClass}>Détails</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagination.paged.map((a) => (
                  <TableRow key={a.id} className={tableRowClass}>
                    <TableCell className="font-mono text-xs text-gray-400">{a.id}</TableCell>
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
                    <TableCell className="font-mono text-xs text-gray-600">{a.cible}</TableCell>
                    <TableCell className="max-w-sm text-sm text-gray-500">{a.details}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DesktopOnly>

        {pagination.paged.length === 0 && (
          <EmptyState
            icon={ScrollText}
            title="Aucune entrée trouvée"
            description={
              hasActiveFilters
                ? "Aucune entrée ne correspond à vos critères."
                : "Le journal d'audit est vide."
            }
            action={
              hasActiveFilters ? (
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  Effacer les filtres
                </Button>
              ) : undefined
            }
          />
        )}
      </FullWidthSection>
    </FullWidthPage>
  );
}
