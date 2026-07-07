"use client";

import { useMemo, useState } from "react";
import { BrainCircuit, ShieldCheck, Clock, AlertCircle, CheckCircle2, Filter, Trash2 } from "lucide-react";
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
import { useDataStore } from "@/lib/data-store";
import { useAuthStore } from "@/lib/auth-store";
import { useToast } from "@/hooks/use-toast";
import {
  PageHeader,
  Toolbar,
  StatusBadge,
  niveauBadge,
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

type AlerteStatut = "Nouvelle" | "Prise en charge" | "Clôturée";

function statutBadgeClass(statut: string) {
  switch (statut) {
    case "Nouvelle":
      return "bg-yellow-50 text-yellow-700";
    case "Prise en charge":
      return "bg-orange-50 text-orange-600";
    case "Clôturée":
      return "bg-blue-50 text-blue-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

function avatarGradient(statut: string) {
  switch (statut) {
    case "Nouvelle":
      return "from-amber-400 to-orange-500";
    case "Prise en charge":
      return "from-orange-400 to-red-500";
    case "Clôturée":
      return "from-blue-500 to-blue-700";
    default:
      return "from-gray-400 to-gray-600";
  }
}

export function AlertesView() {
  const openModal = useAppStore((s) => s.openModal);
  const alertesIAComplete = useDataStore((s) => s.alertes);
  const genererAlertesIA = useDataStore((s) => s.genererAlertesIA);
  const deleteAlerte = useDataStore((s) => s.deleteAlerte);
  const session = useAuthStore((s) => s.session);
  const { toast } = useToast();
  const canManage = session?.role === "admin" || session?.role === "responsable";
  const isAdmin = session?.role === "admin";
  const [generating, setGenerating] = useState(false);
  const [search, setSearch] = useState("");
  const [filtre, setFiltre] = useState("Toutes");

  const filtered = alertesIAComplete.filter((a) => {
    const matchSearch = `${a.etudiant} ${a.classe} ${a.motif}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchFiltre = filtre === "Toutes" || a.statut === filtre;
    return matchSearch && matchFiltre;
  });

  const pagination = usePagination(filtered);

  const compteurs = useMemo(
    () => ({
      total: alertesIAComplete.length,
      Nouvelle: alertesIAComplete.filter((a) => a.statut === "Nouvelle").length,
      "Prise en charge": alertesIAComplete.filter((a) => a.statut === "Prise en charge").length,
      Clôturée: alertesIAComplete.filter((a) => a.statut === "Clôturée").length,
    }),
    [alertesIAComplete]
  );

  const hasActiveFilters = search.length > 0 || filtre !== "Toutes";

  function handleStatutFilter(statut: AlerteStatut) {
    setFiltre((current) => (current === statut ? "Toutes" : statut));
    pagination.setPage(1);
  }

  function resetFilters() {
    setSearch("");
    setFiltre("Toutes");
    pagination.setPage(1);
  }

  const filterChips = [
    ...(search
      ? [{ id: "search", label: `« ${search} »`, tone: "gray" as const, onRemove: () => setSearch("") }]
      : []),
    ...(filtre !== "Toutes"
      ? [{ id: "statut", label: filtre, tone: "blue" as const, onRemove: () => setFiltre("Toutes") }]
      : []),
  ];

  const indicateurs = [
    {
      key: "Nouvelle" as const,
      label: "Nouvelles",
      value: compteurs.Nouvelle,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
      ring: "ring-amber-200",
      activeBg: "bg-amber-500",
    },
    {
      key: "Prise en charge" as const,
      label: "Prises en charge",
      value: compteurs["Prise en charge"],
      icon: AlertCircle,
      color: "text-orange-600",
      bg: "bg-orange-50",
      ring: "ring-orange-200",
      activeBg: "bg-orange-500",
    },
    {
      key: "Clôturée" as const,
      label: "Clôturées",
      value: compteurs.Clôturée,
      icon: CheckCircle2,
      color: "text-blue-600",
      bg: "bg-blue-50",
      ring: "ring-blue-200",
      activeBg: "bg-blue-500",
    },
  ];

  return (
    <FullWidthPage>
      <FullWidthHeader>
        <PageHeader
          className="mb-0"
          title="Alertes IA"
          badge="Module F4.4"
          description="Détection de risque pédagogique générée par l'IA (F4.4)"
          icon={BrainCircuit}
        />
        {canManage && (
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={generating}
              onClick={async () => {
                setGenerating(true);
                const r = await genererAlertesIA();
                setGenerating(false);
                if (r.ok) {
                  toast({
                    title: "Alertes générées",
                    description: `${r.created ?? 0} nouvelle(s) alerte(s) créée(s).`,
                  });
                } else {
                  toast({ title: "Erreur", description: r.error, variant: "destructive" });
                }
              }}
            >
              {generating ? "Analyse…" : "Générer alertes IA"}
            </Button>
            <Button
              size="sm"
              className="bg-blue-500 text-white hover:bg-blue-700"
              onClick={() => openModal({ type: "alerte-form" })}
            >
              Nouvelle alerte
            </Button>
          </div>
        )}
      </FullWidthHeader>

      <FullWidthKpiGrid cols={3}>
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
            isActive={filtre === ind.key}
            pct={compteurs.total ? Math.round((ind.value / compteurs.total) * 100) : 0}
            onClick={() => handleStatutFilter(ind.key)}
          />
        ))}
      </FullWidthKpiGrid>

      <FullWidthSection
        title="Liste des alertes"
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
              value={filtre}
              onValueChange={(v) => {
                setFiltre(v);
                pagination.setPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-full sm:w-[180px]">
                <Filter className="mr-1.5 size-3.5 text-gray-400" />
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
          {pagination.paged.map((a) => {
            const initials = a.etudiant
              .split(" ")
              .map((p) => p.charAt(0))
              .join("")
              .slice(0, 2);
            return (
              <MobileCard
                key={a.id}
                onActivate={() => openModal({ type: "alerte", alerteId: a.id })}
                body={
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <PersonAvatar initials={initials} gradient={avatarGradient(a.statut)} />
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900">{a.etudiant}</p>
                          <p className="text-xs text-gray-400">{a.classe}</p>
                        </div>
                      </div>
                      <StatusBadge label={a.statut} className={statutBadgeClass(a.statut)} />
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-gray-600">{a.motif}</p>
                    <div className="mt-2">
                      <StatusBadge label={a.niveau} className={niveauBadge(a.niveau)} />
                    </div>
                  </>
                }
                footer={
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                    onClick={() => openModal({ type: "alerte", alerteId: a.id })}
                  >
                    <ShieldCheck className="size-4" />
                    Traiter
                  </Button>
                }
              />
            );
          })}
        </MobileOnly>

        <DesktopOnly>
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="border-gray-100 hover:bg-transparent">
                <TableHead className={tableHeadClass}>Réf.</TableHead>
                <TableHead className={tableHeadClass}>Étudiant</TableHead>
                <TableHead className={tableHeadClass}>Classe</TableHead>
                <TableHead className={tableHeadClass}>Motif</TableHead>
                <TableHead className={tableHeadClass}>Niveau</TableHead>
                <TableHead className={tableHeadClass}>Statut</TableHead>
                <TableHead className={`text-right ${tableHeadClass}`}>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagination.paged.map((a) => (
                <TableRow key={a.id} className={tableRowClass}>
                  <TableCell className="font-mono text-xs text-gray-400">{a.id}</TableCell>
                  <TableCell className="font-medium text-gray-900">{a.etudiant}</TableCell>
                  <TableCell className="text-sm text-gray-600">{a.classe}</TableCell>
                  <TableCell className="max-w-xs text-sm text-gray-600">{a.motif}</TableCell>
                  <TableCell>
                    <StatusBadge label={a.niveau} className={niveauBadge(a.niveau)} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge label={a.statut} className={statutBadgeClass(a.statut)} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-blue-200 text-blue-700 hover:bg-blue-50"
                        onClick={() => openModal({ type: "alerte", alerteId: a.id })}
                      >
                        <ShieldCheck className="size-4" />
                        Traiter
                      </Button>
                      {isAdmin && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600"
                          onClick={async () => {
                            if (!confirm(`Supprimer l'alerte ${a.id} ?`)) return;
                            await deleteAlerte(a.id);
                            toast({ title: "Alerte supprimée", description: a.etudiant });
                          }}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        </DesktopOnly>

        {pagination.paged.length === 0 && (
          <EmptyState
            icon={BrainCircuit}
            title="Aucune alerte trouvée"
            description={
              hasActiveFilters
                ? "Aucune alerte ne correspond à vos critères."
                : "Aucune alerte IA pour le moment."
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
