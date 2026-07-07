"use client";

import { useMemo, useState } from "react";
import {
  GraduationCap,
  Eye,
  Pencil,
  ClipboardEdit,
  Trash2,
  MoreVertical,
  UserPlus,
  Users,
  Activity,
  Filter,
  Mail,
} from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppStore } from "@/lib/view-store";
import { useDataStore } from "@/lib/data-store";
import { type Etudiant } from "@/components/dashboard/data";
import { cn } from "@/lib/utils";
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
import { EtudiantFormModal } from "../modals/etudiant-form-modal";
import { EtudiantDetailModal } from "../modals/etudiant-detail-modal";
import { EtudiantDeleteDialog } from "../modals/etudiant-delete-dialog";
import { useToast } from "@/hooks/use-toast";

function moyenneColor(m: number) {
  if (m >= 14) return "text-blue-700";
  if (m >= 10) return "text-gray-700";
  return "text-red-500";
}

function assiduiteColor(a: number) {
  if (a >= 90) return "bg-blue-500";
  if (a >= 75) return "bg-yellow-500";
  return "bg-red-500";
}

function avatarGradient(e: Etudiant) {
  if (e.statut !== "Actif") return "from-gray-400 to-gray-600";
  if (e.assiduite >= 90) return "from-blue-500 to-blue-700";
  if (e.assiduite >= 75) return "from-amber-400 to-orange-500";
  return "from-orange-400 to-red-500";
}

export function EtudiantsView() {
  const openModal = useAppStore((s) => s.openModal);
  const { toast } = useToast();

  const filieresStore = useDataStore((s) => s.filieres);
  const list = useDataStore((s) => s.etudiants);
  const addEtudiant = useDataStore((s) => s.addEtudiant);
  const updateEtudiant = useDataStore((s) => s.updateEtudiant);
  const deleteEtudiant = useDataStore((s) => s.deleteEtudiant);

  const [search, setSearch] = useState("");
  const [filiere, setFiliere] = useState("Toutes");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Etudiant | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [viewing, setViewing] = useState<Etudiant | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<Etudiant | null>(null);

  const filieresUniques = [
    "Toutes",
    ...Array.from(new Set(filieresStore.map((f) => f.nom))),
  ];

  const filtered = list.filter((e) => {
    const matchSearch = `${e.prenom} ${e.nom} ${e.matricule} ${e.email}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchFiliere = filiere === "Toutes" || e.filiere === filiere;
    return matchSearch && matchFiliere;
  });

  const pagination = usePagination(filtered);

  const hasActiveFilters = search.length > 0 || filiere !== "Toutes";

  function resetFilters() {
    setSearch("");
    setFiliere("Toutes");
    pagination.setPage(1);
  }

  const filterChips = [
    ...(search
      ? [{ id: "search", label: `« ${search} »`, tone: "gray" as const, onRemove: () => setSearch("") }]
      : []),
    ...(filiere !== "Toutes"
      ? [{ id: "filiere", label: filiere, tone: "blue" as const, onRemove: () => setFiliere("Toutes") }]
      : []),
  ];

  const stats = useMemo(() => {
    const actifs = list.filter((e) => e.statut === "Actif").length;
    const assiduiteMoy =
      list.length > 0
        ? Math.round(list.reduce((s, e) => s + e.assiduite, 0) / list.length)
        : 0;
    return { total: list.length, actifs, assiduiteMoy };
  }, [list]);

  function handleAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function handleView(e: Etudiant) {
    setViewing(e);
    setDetailOpen(true);
  }

  function handleEditFromDetail() {
    setEditing(viewing);
    setDetailOpen(false);
    setFormOpen(true);
  }

  function handleEdit(e: Etudiant) {
    setEditing(e);
    setFormOpen(true);
  }

  function handleDelete(e: Etudiant) {
    setDeleting(e);
    requestAnimationFrame(() => setDeleteOpen(true));
  }

  function renderActions(e: Etudiant, compact = false) {
    return (
      <div className="flex items-center justify-end gap-1">
        <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50" onClick={() => handleView(e)}>
          <Eye className="size-4" />
          {!compact && <span className="hidden lg:inline">Fiche</span>}
        </Button>
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
            <DropdownMenuItem onClick={() => openModal({ type: "note", etudiant: e.id })}>
              <ClipboardEdit className="size-4 text-blue-500" />
              Saisir une note
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600 focus:text-red-700" onClick={() => handleDelete(e)}>
              <Trash2 className="size-4" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  async function handleSave(data: Omit<Etudiant, "id"> & { id?: string }) {
    try {
      if (data.id) {
        await updateEtudiant(data.id, data);
        toast({
          title: "Étudiant modifié",
          description: `${data.prenom} ${data.nom} a été mis à jour. Action journalisée.`,
        });
      } else {
        const { id: _id, ...rest } = data;
        void _id;
        await addEtudiant(rest);
        toast({
          title: "Étudiant créé",
          description: `${data.prenom} ${data.nom} a été ajouté à l'établissement.`,
        });
      }
      setFormOpen(false);
      setEditing(null);
    } catch (e) {
      toast({
        title: "Erreur",
        description: e instanceof Error ? e.message : "Opération échouée",
        variant: "destructive",
      });
    }
  }

  async function handleConfirmDelete() {
    const target = deleting;
    if (!target) return;
    try {
      await deleteEtudiant(target.id);
      toast({
        title: "Étudiant supprimé",
        description: `${target.prenom} ${target.nom} (${target.matricule}) a été supprimé. Journalisé dans l'audit.`,
        variant: "destructive",
      });
      setDeleteOpen(false);
      setDeleting(null);
    } catch (e) {
      toast({
        title: "Erreur",
        description: e instanceof Error ? e.message : "Suppression échouée",
        variant: "destructive",
      });
    }
  }

  return (
    <FullWidthPage>
      <FullWidthHeader>
        <PageHeader
          className="mb-0"
          title="Étudiants"
          badge="Module F4"
          description="Liste des étudiants inscrits — consultation des notes et assiduité (F4.2)"
          icon={GraduationCap}
          actionLabel="Ajouter un étudiant"
          onAction={handleAdd}
        />
      </FullWidthHeader>

      <FullWidthKpiGrid cols={3}>
        <KpiCard
          label="Total inscrits"
          value={stats.total}
          icon={Users}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <KpiCard
          label="Actifs"
          value={stats.actifs}
          icon={GraduationCap}
          color="text-emerald-600"
          bg="bg-emerald-50"
          pct={stats.total ? Math.round((stats.actifs / stats.total) * 100) : 0}
        />
        <KpiCard
          label="Assiduité moyenne"
          value={`${stats.assiduiteMoy}%`}
          icon={Activity}
          color="text-amber-600"
          bg="bg-amber-50"
        />
      </FullWidthKpiGrid>

      <FullWidthSection
        title="Liste des étudiants"
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
              value={filiere}
              onValueChange={(v) => {
                setFiliere(v);
                pagination.setPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-full sm:w-[180px]">
                <Filter className="mr-1.5 size-3.5 text-gray-400" />
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
              onActivate={() => handleView(e)}
              body={
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <PersonAvatar
                        initials={`${e.prenom.charAt(0)}${e.nom.charAt(0)}`}
                        gradient={avatarGradient(e)}
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900">{e.prenom} {e.nom}</p>
                        <p className="truncate text-xs text-gray-400">{e.matricule}</p>
                      </div>
                    </div>
                    <StatusBadge
                      label={e.statut}
                      className={e.statut === "Actif" ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-500"}
                    />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <GraduationCap className="size-3.5 text-gray-400" />
                      {e.filiere}
                    </span>
                    <span className={`font-bold ${moyenneColor(e.moyenne)}`}>
                      {e.moyenne.toFixed(1)}/20
                    </span>
                    <span>{e.classe}</span>
                    <span className="font-medium text-gray-700">{e.assiduite}% assiduité</span>
                  </div>
                </>
              }
              footer={renderActions(e, true)}
            />
          ))}
        </MobileOnly>

        <DesktopOnly>
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="border-gray-100 hover:bg-transparent">
                <TableHead className={tableHeadClass}>Étudiant</TableHead>
                <TableHead className={tableHeadClass}>Matricule</TableHead>
                <TableHead className={tableHeadClass}>Filière</TableHead>
                <TableHead className={tableHeadClass}>Classe</TableHead>
                <TableHead className={tableHeadClass}>Moyenne</TableHead>
                <TableHead className={tableHeadClass}>Assiduité</TableHead>
                <TableHead className={tableHeadClass}>Statut</TableHead>
                <TableHead className={`text-right ${tableHeadClass}`}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagination.paged.map((e) => (
                <TableRow
                  key={e.id}
                  className={cn("cursor-pointer", tableRowClass)}
                  onClick={() => handleView(e)}
                >
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
                  <TableCell className="font-mono text-sm text-gray-600">
                    {e.matricule}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">{e.filiere}</TableCell>
                  <TableCell className="text-sm text-gray-600">{e.classe}</TableCell>
                  <TableCell>
                    <span className={`text-sm font-bold ${moyenneColor(e.moyenne)}`}>
                      {e.moyenne.toFixed(1)}/20
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 overflow-hidden rounded-full bg-gray-100">
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
                          ? "bg-blue-50 text-blue-700"
                          : "bg-gray-100 text-gray-500"
                      }
                    />
                  </TableCell>
                  <TableCell className="text-right" onClick={(ev) => ev.stopPropagation()}>
                    {renderActions(e)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        </DesktopOnly>

        {pagination.paged.length === 0 && (
          <EmptyState
            icon={GraduationCap}
            title="Aucun étudiant trouvé"
            description={
              hasActiveFilters
                ? "Aucun étudiant ne correspond à vos critères."
                : "Modifiez votre recherche ou ajoutez un nouvel étudiant."
            }
            action={
              hasActiveFilters ? (
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  Effacer les filtres
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  onClick={handleAdd}
                >
                  <UserPlus className="size-4" />
                  Ajouter un étudiant
                </Button>
              )
            }
          />
        )}
      </FullWidthSection>

      <EtudiantFormModal
        open={formOpen}
        etudiant={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
      />
      <EtudiantDetailModal
        open={detailOpen}
        etudiant={viewing}
        onClose={() => {
          setDetailOpen(false);
          setViewing(null);
        }}
        onEdit={handleEditFromDetail}
      />
      <EtudiantDeleteDialog
        open={deleteOpen}
        etudiant={deleting}
        onClose={() => {
          setDeleteOpen(false);
          setDeleting(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </FullWidthPage>
  );
}
