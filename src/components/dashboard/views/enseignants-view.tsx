"use client";

import { useMemo, useState } from "react";
import { Users, Mail, BookOpen, Pencil, Trash2, MoreVertical, UserPlus } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type Enseignant } from "@/components/dashboard/data";
import { useDataStore } from "@/lib/data-store";
import {
  PageHeader,
  Toolbar,
  StatusBadge,
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
import { EnseignantFormModal } from "../modals/enseignant-form-modal";
import { EnseignantDeleteDialog } from "../modals/enseignant-delete-dialog";
import { useToast } from "@/hooks/use-toast";

function avatarGradient(e: Enseignant) {
  return e.statut === "Actif" ? "from-amber-400 to-orange-500" : "from-gray-400 to-gray-600";
}

export function EnseignantsView() {
  const { toast } = useToast();
  const list = useDataStore((s) => s.enseignants);
  const addEnseignant = useDataStore((s) => s.addEnseignant);
  const updateEnseignant = useDataStore((s) => s.updateEnseignant);
  const deleteEnseignant = useDataStore((s) => s.deleteEnseignant);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Enseignant | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<Enseignant | null>(null);

  const filtered = list.filter((e) =>
    `${e.prenom} ${e.nom} ${e.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const pagination = usePagination(filtered);

  const hasActiveFilters = search.length > 0;

  function resetFilters() {
    setSearch("");
    pagination.setPage(1);
  }

  const filterChips = search
    ? [{ id: "search", label: `« ${search} »`, tone: "gray" as const, onRemove: () => setSearch("") }]
    : [];

  const stats = useMemo(
    () => ({
      enseignants: list.length,
      actifs: list.filter((e) => e.statut === "Actif").length,
      matieres: new Set(list.flatMap((e) => e.matieres)).size,
      classes: new Set(list.flatMap((e) => e.classes)).size,
    }),
    [list]
  );

  function handleAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function handleEdit(e: Enseignant) {
    setEditing(e);
    setFormOpen(true);
  }

  function handleDelete(e: Enseignant) {
    setDeleting(e);
    requestAnimationFrame(() => setDeleteOpen(true));
  }

  function renderActions(e: Enseignant) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleEdit(e)}>
            <Pencil className="size-4 text-gray-500" />
            Modifier
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600 focus:text-red-700"
            onClick={() => handleDelete(e)}
          >
            <Trash2 className="size-4" />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  async function handleSave(data: Omit<Enseignant, "id"> & { id?: string }) {
    try {
      if (data.id) {
        await updateEnseignant(data.id, data);
        toast({ title: "Enseignant modifié", description: `${data.prenom} ${data.nom} a été mis à jour.` });
      } else {
        const { id: _id, ...rest } = data;
        void _id;
        await addEnseignant(rest);
        toast({ title: "Enseignant créé", description: `${data.prenom} ${data.nom} a été ajouté au corps enseignant.` });
      }
      setFormOpen(false);
      setEditing(null);
    } catch (e) {
      toast({ title: "Erreur", description: e instanceof Error ? e.message : "Opération échouée", variant: "destructive" });
    }
  }

  async function handleConfirmDelete() {
    const target = deleting;
    if (!target) return;
    try {
      await deleteEnseignant(target.id);
      toast({ title: "Enseignant supprimé", description: `${target.prenom} ${target.nom} a été supprimé.`, variant: "destructive" });
      setDeleteOpen(false);
      setDeleting(null);
    } catch (e) {
      toast({ title: "Erreur", description: e instanceof Error ? e.message : "Suppression échouée", variant: "destructive" });
    }
  }

  return (
    <FullWidthPage>
      <FullWidthHeader>
        <PageHeader
          className="mb-0"
          title="Enseignants"
          badge="Module F4"
          description="Corps enseignant et affectations aux classes/matières (F4.1 — R3)"
          icon={Users}
          actionLabel="Ajouter un enseignant"
          onAction={handleAdd}
        />
      </FullWidthHeader>

      <FullWidthKpiGrid cols={3}>
        <KpiCard
          label="Enseignants"
          value={stats.enseignants}
          icon={Users}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <KpiCard
          label="Actifs"
          value={stats.actifs}
          icon={Users}
          color="text-emerald-600"
          bg="bg-emerald-50"
          pct={stats.enseignants ? Math.round((stats.actifs / stats.enseignants) * 100) : 0}
        />
        <KpiCard
          label="Matières couvertes"
          value={stats.matieres}
          icon={BookOpen}
          color="text-amber-600"
          bg="bg-amber-50"
        />
      </FullWidthKpiGrid>

      <FullWidthSection
        title="Corps enseignant"
        subtitle={filteredSubtitle(filtered.length, hasActiveFilters)}
        headerAction={hasActiveFilters ? <ResetFiltersButton onClick={resetFilters} /> : undefined}
        toolbar={
          <Toolbar
            search={search}
            onSearch={(v) => {
              setSearch(v);
              pagination.setPage(1);
            }}
          />
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
          {pagination.paged.map((e) => (
            <MobileCard
              key={e.id}
              onActivate={() => handleEdit(e)}
              body={
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <PersonAvatar
                        initials={`${e.prenom.charAt(0)}${e.nom.charAt(0)}`}
                        gradient={avatarGradient(e)}
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900">
                          {e.prenom} {e.nom}
                        </p>
                        <p className="flex items-center gap-1 truncate text-xs text-gray-400">
                          <Mail className="size-3 shrink-0" />
                          {e.email}
                        </p>
                      </div>
                    </div>
                    <StatusBadge
                      label={e.statut}
                      className={
                        e.statut === "Actif"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-gray-100 text-gray-500"
                      }
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {e.matieres.slice(0, 3).map((m) => (
                      <Badge key={m} variant="secondary" className="bg-blue-50 font-normal text-blue-800">
                        {m}
                      </Badge>
                    ))}
                    {e.matieres.length > 3 && (
                      <Badge variant="secondary" className="bg-gray-100 font-normal text-gray-500">
                        +{e.matieres.length - 3}
                      </Badge>
                    )}
                  </div>
                </>
              }
              footer={renderActions(e)}
            />
          ))}
        </MobileOnly>

        <DesktopOnly>
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="border-gray-100 hover:bg-transparent">
                  <TableHead className={tableHeadClass}>Enseignant</TableHead>
                  <TableHead className={tableHeadClass}>Matières</TableHead>
                  <TableHead className={tableHeadClass}>Classes affectées</TableHead>
                  <TableHead className={tableHeadClass}>Statut</TableHead>
                  <TableHead className={`text-right ${tableHeadClass}`}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagination.paged.map((e) => (
                  <TableRow key={e.id} className={tableRowClass}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <PersonAvatar
                          initials={`${e.prenom.charAt(0)}${e.nom.charAt(0)}`}
                          gradient={avatarGradient(e)}
                          size="sm"
                        />
                        <div>
                          <p className="font-medium text-gray-900">
                            {e.prenom} {e.nom}
                          </p>
                          <p className="flex items-center gap-1 text-xs text-gray-400">
                            <Mail className="size-3" />
                            {e.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {e.matieres.map((m) => (
                          <Badge
                            key={m}
                            variant="secondary"
                            className="bg-blue-50 font-normal text-blue-800"
                          >
                            {m}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {e.classes.map((c) => (
                          <Badge
                            key={c}
                            variant="secondary"
                            className="bg-gray-100 font-normal text-gray-600"
                          >
                            {c}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        label={e.statut}
                        className={
                          e.statut === "Actif"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-gray-100 text-gray-500"
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right">{renderActions(e)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DesktopOnly>

        {pagination.paged.length === 0 && (
          <EmptyState
            icon={Users}
            title="Aucun enseignant trouvé"
            description={
              hasActiveFilters
                ? "Aucun enseignant ne correspond à vos critères."
                : "Modifiez votre recherche ou ajoutez un enseignant."
            }
            action={
              hasActiveFilters ? (
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  Effacer les filtres
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={handleAdd}>
                  <UserPlus className="size-4" />
                  Ajouter un enseignant
                </Button>
              )
            }
          />
        )}
      </FullWidthSection>

      <EnseignantFormModal
        open={formOpen}
        enseignant={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
      />
      <EnseignantDeleteDialog
        open={deleteOpen}
        enseignant={deleting}
        onClose={() => {
          setDeleteOpen(false);
          setDeleting(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </FullWidthPage>
  );
}
