"use client";

import { useMemo, useState } from "react";
import {
  FileText,
  Eye,
  MoreVertical,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Filter,
  Inbox,
  Mail,
  GraduationCap,
  Paperclip,
} from "lucide-react";
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
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/view-store";
import { useDataStore } from "@/lib/data-store";
import { useAuthStore } from "@/lib/auth-store";
import { type StatutDossier, canTraiterDossier, canSoumettreCandidature } from "@/components/dashboard/data";
import {
  PageHeader,
  Toolbar,
  StatusBadge,
  statutBadge,
  FullWidthPage,
  FullWidthHeader,
  FullWidthKpiGrid,
  FullWidthSection,
  KpiCard,
  EmptyState,
  ActiveFilterChips,
  ResetFiltersButton,
  PersonAvatar,
  MobileCard,
  MobileOnly,
  DesktopOnly,
  filteredSubtitle,
  tableHeadClass,
  tableRowClass,
} from "./shared";
import { usePagination, DataTablePagination } from "./data-table-pagination";

const statuts: ("Tous" | StatutDossier)[] = [
  "Tous",
  "En attente",
  "Validé",
  "Incomplet",
  "Rejeté",
];

const statutIcons: Record<StatutDossier, React.ComponentType<{ className?: string }>> = {
  "En attente": Clock,
  Validé: CheckCircle2,
  Incomplet: AlertCircle,
  Rejeté: XCircle,
};

function completudeColor(value: number) {
  if (value >= 100) return "bg-emerald-500";
  if (value >= 75) return "bg-blue-500";
  if (value >= 50) return "bg-amber-500";
  return "bg-red-500";
}

function avatarGradient(statut: StatutDossier) {
  switch (statut) {
    case "Validé":
      return "from-blue-500 to-blue-700";
    case "En attente":
      return "from-amber-400 to-orange-500";
    case "Incomplet":
      return "from-orange-400 to-red-500";
    case "Rejeté":
      return "from-gray-400 to-gray-600";
    default:
      return "from-blue-500 to-blue-700";
  }
}

export function CandidaturesView() {
  const openModal = useAppStore((s) => s.openModal);
  const openDossier = useAppStore((s) => s.openDossier);
  const session = useAuthStore((s) => s.session);
  const candidatures = useDataStore((s) => s.candidatures);
  const peutTraiter = session ? canTraiterDossier(session.role) : false;
  const peutSoumettre = session
    ? canSoumettreCandidature(session.role, candidatures, session.email)
    : false;
  const [search, setSearch] = useState("");
  const [filtreStatut, setFiltreStatut] = useState<string>("Tous");
  const [filtreFiliere, setFiltreFiliere] = useState("Toutes");

  const filieres = useMemo(
    () => ["Toutes", ...Array.from(new Set(candidatures.map((c) => c.filiere)))],
    [candidatures]
  );

  const compteurs = useMemo(
    () => ({
      total: candidatures.length,
      "En attente": candidatures.filter((c) => c.statut === "En attente").length,
      Validé: candidatures.filter((c) => c.statut === "Validé").length,
      Incomplet: candidatures.filter((c) => c.statut === "Incomplet").length,
      Rejeté: candidatures.filter((c) => c.statut === "Rejeté").length,
    }),
    [candidatures]
  );

  const filtered = useMemo(
    () =>
      candidatures.filter((c) => {
        const matchSearch =
          `${c.prenom} ${c.nom} ${c.email} ${c.id} ${c.filiere}`
            .toLowerCase()
            .includes(search.toLowerCase());
        const matchStatut = filtreStatut === "Tous" || c.statut === filtreStatut;
        const matchFiliere = filtreFiliere === "Toutes" || c.filiere === filtreFiliere;
        return matchSearch && matchStatut && matchFiliere;
      }),
    [candidatures, search, filtreStatut, filtreFiliere]
  );

  const pagination = usePagination(filtered, 10);

  const hasActiveFilters =
    search.length > 0 || filtreStatut !== "Tous" || filtreFiliere !== "Toutes";

  function resetFilters() {
    setSearch("");
    setFiltreStatut("Tous");
    setFiltreFiliere("Toutes");
    pagination.setPage(1);
  }

  function handleStatutFilter(statut: StatutDossier) {
    setFiltreStatut((current) => (current === statut ? "Tous" : statut));
    pagination.setPage(1);
  }

  const filterChips = [
    ...(search
      ? [{ id: "search", label: `« ${search} »`, tone: "gray" as const, onRemove: () => setSearch("") }]
      : []),
    ...(filtreStatut !== "Tous"
      ? [{ id: "statut", label: filtreStatut, tone: "blue" as const, onRemove: () => setFiltreStatut("Tous") }]
      : []),
    ...(filtreFiliere !== "Toutes"
      ? [{ id: "filiere", label: filtreFiliere, tone: "blue" as const, onRemove: () => setFiltreFiliere("Toutes") }]
      : []),
  ];

  const indicateurs = [
    {
      key: "En attente" as const,
      label: "En attente",
      value: compteurs["En attente"],
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
      ring: "ring-amber-200",
      activeBg: "bg-amber-500",
    },
    {
      key: "Validé" as const,
      label: "Validés",
      value: compteurs["Validé"],
      icon: CheckCircle2,
      color: "text-blue-600",
      bg: "bg-blue-50",
      ring: "ring-blue-200",
      activeBg: "bg-blue-500",
    },
    {
      key: "Incomplet" as const,
      label: "Incomplets",
      value: compteurs["Incomplet"],
      icon: AlertCircle,
      color: "text-orange-600",
      bg: "bg-orange-50",
      ring: "ring-orange-200",
      activeBg: "bg-orange-500",
    },
    {
      key: "Rejeté" as const,
      label: "Rejetés",
      value: compteurs["Rejeté"],
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
      ring: "ring-red-200",
      activeBg: "bg-red-500",
    },
  ];

  function renderActions(c: (typeof candidatures)[number], compact = false) {
    return (
      <div className={cn("flex items-center gap-1", compact ? "justify-end" : "justify-end")}>
        <Button
          variant="ghost"
          size="sm"
          className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
          onClick={(e) => {
            e.stopPropagation();
            openDossier(c.id);
          }}
        >
          <Eye className="size-4" />
          {!compact && "Détails"}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={(e) => e.stopPropagation()}
              disabled={!peutTraiter}
            >
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          {peutTraiter && (
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
              <CheckCircle2 className="size-4 text-blue-500" />
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
          )}
        </DropdownMenu>
      </div>
    );
  }

  return (
    <FullWidthPage>
      <FullWidthHeader>
        <PageHeader
          className="mb-0"
          title="Candidatures"
          badge="Module F3"
          description="Gestion des dossiers d'inscription soumis — suivi, validation et traitement des pièces justificatives."
          icon={FileText}
          actionLabel={peutSoumettre ? "Nouvelle candidature" : undefined}
          onAction={
            peutSoumettre
              ? () => openModal({ type: "candidature" })
              : undefined
          }
        />
      </FullWidthHeader>

      <FullWidthKpiGrid cols={4}>
        {indicateurs.map((ind) => (
          <KpiCard
            key={ind.key}
            label={ind.label}
            value={ind.value}
            icon={ind.icon}
            color={ind.color}
            bg={ind.bg}
            ring={ind.ring}
            activeBg={ind.activeBg}
            isActive={filtreStatut === ind.key}
            pct={compteurs.total ? Math.round((ind.value / compteurs.total) * 100) : 0}
            onClick={() => handleStatutFilter(ind.key)}
          />
        ))}
      </FullWidthKpiGrid>

      <FullWidthSection
        title="Liste des dossiers"
        subtitle={filteredSubtitle(filtered.length, hasActiveFilters)}
        headerAction={hasActiveFilters ? <ResetFiltersButton onClick={resetFilters} /> : undefined}
        toolbar={
          <>
            <Toolbar
              search={search}
              onSearch={(v) => {
                setSearch(v);
                pagination.setPage(1);
              }}
            >
              <Select
                value={filtreStatut}
                onValueChange={(v) => {
                  setFiltreStatut(v);
                  pagination.setPage(1);
                }}
              >
                <SelectTrigger className="h-9 w-full sm:w-[150px]">
                  <Filter className="mr-1.5 size-3.5 text-gray-400" />
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
              <Select
                value={filtreFiliere}
                onValueChange={(v) => {
                  setFiltreFiliere(v);
                  pagination.setPage(1);
                }}
              >
                <SelectTrigger className="h-9 w-full sm:w-[150px]">
                  <GraduationCap className="mr-1.5 size-3.5 text-gray-400" />
                  <SelectValue placeholder="Filière" />
                </SelectTrigger>
                <SelectContent>
                  {filieres.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Toolbar>
          </>
        }
        footer={
          pagination.paged.length > 0 ? (
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
          ) : undefined
        }
      >
        <ActiveFilterChips chips={filterChips} />

        <MobileOnly>
          {pagination.paged.map((c) => {
            const piecesPresentes = c.pieces.filter((p) => p.present).length;
            return (
              <MobileCard
                key={c.id}
                onActivate={() => openDossier(c.id)}
                body={
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <PersonAvatar
                          initials={`${c.prenom.charAt(0)}${c.nom.charAt(0)}`}
                          gradient={avatarGradient(c.statut)}
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900">
                            {c.prenom} {c.nom}
                          </p>
                          <p className="truncate text-xs text-gray-400">{c.id}</p>
                        </div>
                      </div>
                      <StatusBadge
                        label={c.statut}
                        className={cn("shrink-0 gap-1", statutBadge(c.statut))}
                      />
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <GraduationCap className="size-3.5 text-gray-400" />
                        {c.filiere}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Paperclip className="size-3.5 text-gray-400" />
                        {piecesPresentes}/{c.pieces.length} pièces
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="size-3.5 text-gray-400" />
                        {c.dateSoumission}
                      </span>
                      <span className="font-medium text-gray-700">{c.completude}% complet</span>
                    </div>
                  </>
                }
                footer={renderActions(c, true)}
              />
            );
          })}
        </MobileOnly>

        <DesktopOnly>
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="border-gray-100 hover:bg-transparent">
                  <TableHead className={tableHeadClass}>Candidat</TableHead>
                  <TableHead className={tableHeadClass}>Filière</TableHead>
                  <TableHead className={tableHeadClass}>Soumission</TableHead>
                  <TableHead className={tableHeadClass}>Complétude</TableHead>
                  <TableHead className={tableHeadClass}>Statut</TableHead>
                  <TableHead className={`text-right ${tableHeadClass}`}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagination.paged.map((c) => {
                  const StatutIcon = statutIcons[c.statut];
                  const piecesPresentes = c.pieces.filter((p) => p.present).length;

                  return (
                    <TableRow
                      key={c.id}
                      className={cn("cursor-pointer", tableRowClass)}
                      onClick={() => openDossier(c.id)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <PersonAvatar
                            initials={`${c.prenom.charAt(0)}${c.nom.charAt(0)}`}
                            gradient={avatarGradient(c.statut)}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900">
                              {c.prenom} {c.nom}
                            </p>
                            <p className="flex items-center gap-1 truncate text-xs text-gray-400">
                              <Mail className="size-3 shrink-0" />
                              {c.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{c.filiere}</p>
                          <p className="text-xs text-gray-400">{c.niveau}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-gray-700">{c.dateSoumission}</p>
                        <p className="text-xs text-gray-400">{c.id}</p>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-20 overflow-hidden rounded-full bg-gray-100">
                              <div
                                className={cn("h-full rounded-full transition-all", completudeColor(c.completude))}
                                style={{ width: `${c.completude}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold tabular-nums text-gray-700">
                              {c.completude}%
                            </span>
                          </div>
                          <p className="flex items-center gap-1 text-[11px] text-gray-400">
                            <Paperclip className="size-3" />
                            {piecesPresentes}/{c.pieces.length} pièces jointes
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                            statutBadge(c.statut)
                          )}
                        >
                          <StatutIcon className="size-3" />
                          {c.statut}
                        </span>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        {renderActions(c)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </DesktopOnly>

        {pagination.paged.length === 0 && (
            <EmptyState
              icon={Inbox}
              title="Aucun dossier trouvé"
              description={
                hasActiveFilters
                  ? "Aucune candidature ne correspond à vos critères de recherche."
                  : "Aucune candidature n'a encore été soumise."
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
