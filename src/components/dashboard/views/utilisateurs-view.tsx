"use client";

import { useEffect, useMemo, useState } from "react";
import { UserCog, Pencil, Shield, MoreVertical, Trash2, UserPlus, Users, Filter, Mail, CheckCircle2, AlertCircle, X } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
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
import {
  roleLabels,
  roleBadgeBg,
  type Role,
  type Utilisateur,
} from "@/components/dashboard/data";
import { useDataStore } from "@/lib/data-store";
import { useAuthStore } from "@/lib/auth-store";
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
import { UtilisateurFormModal, type UtilisateurFormData } from "../modals/utilisateur-form-modal";
import { UtilisateurDeleteDialog } from "../modals/utilisateur-delete-dialog";

type Feedback = { type: "success" | "error"; title: string; description: string };

function initials(prenom: string, nom: string) {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
}

function avatarGradient(role: Role) {
  switch (role) {
    case "admin":
      return "from-blue-500 to-blue-700";
    case "responsable":
      return "from-orange-400 to-red-500";
    case "enseignant":
      return "from-amber-400 to-orange-500";
    case "etudiant":
      return "from-blue-400 to-blue-600";
    default:
      return "from-gray-400 to-gray-600";
  }
}

export function UtilisateursView() {
  const session = useAuthStore((s) => s.session);
  const list = useDataStore((s) => s.utilisateurs);
  const reloadUtilisateurs = useDataStore((s) => s.reloadUtilisateurs);
  const addUtilisateur = useDataStore((s) => s.addUtilisateur);
  const updateUtilisateur = useDataStore((s) => s.updateUtilisateur);
  const deleteUtilisateur = useDataStore((s) => s.deleteUtilisateur);
  const [search, setSearch] = useState("");
  const [filtreRole, setFiltreRole] = useState("Tous");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Utilisateur | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<Utilisateur | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    void reloadUtilisateurs().catch((e) => {
      setFeedback({
        type: "error",
        title: "Chargement impossible",
        description: e instanceof Error ? e.message : "Impossible de charger les utilisateurs.",
      });
    });
  }, [reloadUtilisateurs]);

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 6000);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const roles: ("Tous" | Role)[] = [
    "Tous",
    "candidat",
    "etudiant",
    "enseignant",
    "responsable",
    "admin",
  ];

  const filtered = list.filter((u) => {
    const matchSearch = `${u.prenom} ${u.nom} ${u.email}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchRole = filtreRole === "Tous" || u.role === filtreRole;
    return matchSearch && matchRole;
  });

  const pagination = usePagination(filtered, 10);

  const hasActiveFilters = search.length > 0 || filtreRole !== "Tous";

  function resetFilters() {
    setSearch("");
    setFiltreRole("Tous");
    pagination.setPage(1);
  }

  const filterChips = [
    ...(search
      ? [{ id: "search", label: `« ${search} »`, tone: "gray" as const, onRemove: () => setSearch("") }]
      : []),
    ...(filtreRole !== "Tous"
      ? [{ id: "role", label: roleLabels[filtreRole as Role], tone: "blue" as const, onRemove: () => setFiltreRole("Tous") }]
      : []),
  ];

  const stats = useMemo(
    () => ({
      total: list.length,
      actifs: list.filter((u) => u.statut === "Actif").length,
      admins: list.filter((u) => u.role === "admin").length,
    }),
    [list]
  );

  function handleAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function handleEdit(u: Utilisateur) {
    setEditing(u);
    setFormOpen(true);
  }

  function handleDelete(u: Utilisateur) {
    setDeleting(u);
    requestAnimationFrame(() => setDeleteOpen(true));
  }

  function renderActions(u: Utilisateur) {
    return (
      <div className="flex items-center justify-end gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => handleEdit(u)}
          aria-label="Modifier"
        >
          <Pencil className="size-4" />
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
            <DropdownMenuItem onClick={() => handleEdit(u)}>
              <Pencil className="size-4 text-gray-500" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-700"
              disabled={session?.email === u.email}
              onClick={() => handleDelete(u)}
            >
              <Trash2 className="size-4" />
              {session?.email === u.email
                ? "Supprimer (verrouillé — votre compte)"
                : "Supprimer"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  async function handleSave(data: UtilisateurFormData) {
    try {
      if (data.id) {
        await updateUtilisateur(data.id, data);
        setFeedback({
          type: "success",
          title: "Utilisateur modifié",
          description: `${data.prenom} ${data.nom} — Rôle : ${roleLabels[data.role]}.`,
        });
      } else {
        const { id: _id, ...rest } = data;
        void _id;
        await addUtilisateur(rest);
        setSearch(`${data.prenom} ${data.nom}`.trim());
        setFiltreRole("Tous");
        pagination.setPage(1);
        setFeedback({
          type: "success",
          title: "Utilisateur créé",
          description: `${data.prenom} ${data.nom} — Rôle : ${roleLabels[data.role]}.`,
        });
      }
      setFormOpen(false);
      setEditing(null);
    } catch (e) {
      setFeedback({
        type: "error",
        title: "Erreur",
        description: e instanceof Error ? e.message : "Opération échouée",
      });
    }
  }

  async function handleConfirmDelete() {
    const target = deleting;
    if (!target) return;
    const result = await deleteUtilisateur(target.id);
    if (!result.ok) {
      setFeedback({ type: "error", title: "Suppression refusée", description: result.error ?? "Échec de la suppression." });
      setDeleteOpen(false);
      setDeleting(null);
      return;
    }
    setFeedback({
      type: "success",
      title: "Utilisateur supprimé",
      description: `${target.prenom} ${target.nom} a été supprimé.`,
    });
    setDeleteOpen(false);
    setDeleting(null);
  }

  return (
    <FullWidthPage>
      <FullWidthHeader>
        <PageHeader
          className="mb-0"
          title="Utilisateurs & Rôles"
          badge="Module F6"
          description="Gestion des comptes et des rôles RBAC (F6.1 — R2)"
          icon={UserCog}
          actionLabel="Nouvel utilisateur"
          onAction={handleAdd}
        />
      </FullWidthHeader>

      {feedback && (
        <div className="shrink-0 px-3 pt-3 sm:px-4 lg:px-5">
          <Alert variant={feedback.type === "success" ? "success" : "destructive"}>
            {feedback.type === "success" ? <CheckCircle2 /> : <AlertCircle />}
            <AlertTitle>{feedback.title}</AlertTitle>
            <AlertDescription>{feedback.description}</AlertDescription>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              aria-label="Fermer"
              className="absolute right-3 top-3 text-current/60 hover:text-current"
            >
              <X className="size-4" />
            </button>
          </Alert>
        </div>
      )}

      <FullWidthKpiGrid cols={3}>
        <KpiCard
          label="Comptes"
          value={stats.total}
          icon={Users}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <KpiCard
          label="Actifs"
          value={stats.actifs}
          icon={UserCog}
          color="text-emerald-600"
          bg="bg-emerald-50"
          pct={stats.total ? Math.round((stats.actifs / stats.total) * 100) : 0}
        />
        <KpiCard
          label="Administrateurs"
          value={stats.admins}
          icon={Shield}
          color="text-orange-600"
          bg="bg-orange-50"
        />
      </FullWidthKpiGrid>

      <div className="shrink-0 border-b border-gray-200 bg-gray-50/80 px-3 py-2.5 sm:px-4 lg:px-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <Shield className="size-4 text-blue-500" />
          Contrôle d&apos;accès basé sur les rôles (RBAC)
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {(Object.keys(roleLabels) as Role[]).map((r) => (
            <span
              key={r}
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${roleBadgeBg[r]}`}
            >
              {roleLabels[r]}
            </span>
          ))}
        </div>
      </div>

      <FullWidthSection
        title="Liste des utilisateurs"
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
              value={filtreRole}
              onValueChange={(v) => {
                setFiltreRole(v);
                pagination.setPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-full sm:w-[200px]">
                <Filter className="mr-1.5 size-3.5 text-gray-400" />
                <SelectValue placeholder="Rôle" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r === "Tous" ? "Tous les rôles" : roleLabels[r as Role]}
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
          {pagination.paged.map((u) => (
            <MobileCard
              key={u.id}
              onActivate={() => handleEdit(u)}
              body={
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <PersonAvatar
                        initials={initials(u.prenom, u.nom)}
                        gradient={avatarGradient(u.role)}
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900">
                          {u.prenom} {u.nom}
                        </p>
                        <p className="flex items-center gap-1 truncate text-xs text-gray-400">
                          <Mail className="size-3 shrink-0" />
                          {u.email}
                        </p>
                      </div>
                    </div>
                    <StatusBadge
                      label={u.statut}
                      className={
                        u.statut === "Actif"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-gray-100 text-gray-500"
                      }
                    />
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${roleBadgeBg[u.role]}`}>
                      {roleLabels[u.role]}
                    </span>
                    <span className="text-xs text-gray-400">{u.derniereConnexion}</span>
                  </div>
                </>
              }
              footer={renderActions(u)}
            />
          ))}
        </MobileOnly>

        <DesktopOnly>
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="border-gray-100 hover:bg-transparent">
                <TableHead className={tableHeadClass}>Utilisateur</TableHead>
                <TableHead className={tableHeadClass}>Email</TableHead>
                <TableHead className={tableHeadClass}>Rôle</TableHead>
                <TableHead className={tableHeadClass}>Statut</TableHead>
                <TableHead className={tableHeadClass}>Dernière connexion</TableHead>
                <TableHead className={`text-right ${tableHeadClass}`}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagination.paged.map((u) => (
                <TableRow key={u.id} className={tableRowClass}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <PersonAvatar
                        initials={initials(u.prenom, u.nom)}
                        gradient={avatarGradient(u.role)}
                        size="sm"
                      />
                      <div>
                        <p className="font-medium text-gray-900">
                          {u.prenom} {u.nom}
                        </p>
                        <p className="text-xs text-gray-400">{u.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">{u.email}</TableCell>
                  <TableCell>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${roleBadgeBg[u.role]}`}
                    >
                      {roleLabels[u.role]}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      label={u.statut}
                      className={
                        u.statut === "Actif"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-gray-100 text-gray-500"
                      }
                    />
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {u.derniereConnexion}
                  </TableCell>
                  <TableCell className="text-right">{renderActions(u)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        </DesktopOnly>

        {pagination.paged.length === 0 && (
          <EmptyState
            icon={UserCog}
            title="Aucun utilisateur trouvé"
            description={
              hasActiveFilters
                ? "Aucun utilisateur ne correspond à vos critères."
                : "Modifiez votre recherche ou créez un nouvel utilisateur."
            }
            action={
              hasActiveFilters ? (
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  Effacer les filtres
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={handleAdd}>
                  <UserPlus className="size-4" />
                  Nouvel utilisateur
                </Button>
              )
            }
          />
        )}
      </FullWidthSection>

      <UtilisateurFormModal
        // Remonte tout le formulaire (donc réinitialise inviteByEmail) dès
        // que la cible change — même raison que enseignant-form-modal.
        key={editing?.id ?? "new"}
        open={formOpen}
        utilisateur={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
      />
      <UtilisateurDeleteDialog
        open={deleteOpen}
        utilisateur={deleting}
        onClose={() => {
          setDeleteOpen(false);
          setDeleting(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </FullWidthPage>
  );
}
