"use client";

import { useState } from "react";
import { UserCog, Pencil, Shield, MoreVertical, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { PageHeader, Toolbar, Panel, StatusBadge } from "./shared";
import { usePagination, DataTablePagination } from "./data-table-pagination";
import { UtilisateurFormModal } from "../modals/utilisateur-form-modal";
import { UtilisateurDeleteDialog } from "../modals/utilisateur-delete-dialog";
import { useToast } from "@/hooks/use-toast";

function initials(prenom: string, nom: string) {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
}

function avatarBg(role: Role) {
  switch (role) {
    case "admin":
      return "bg-blue-500";
    case "responsable":
      return "bg-orange-500";
    case "enseignant":
      return "bg-amber-500";
    case "etudiant":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-300";
  }
}

export function UtilisateursView() {
  const { toast } = useToast();
  const session = useAuthStore((s) => s.session);
  const list = useDataStore((s) => s.utilisateurs);
  const addUtilisateur = useDataStore((s) => s.addUtilisateur);
  const updateUtilisateur = useDataStore((s) => s.updateUtilisateur);
  const deleteUtilisateur = useDataStore((s) => s.deleteUtilisateur);
  const [search, setSearch] = useState("");
  const [filtreRole, setFiltreRole] = useState("Tous");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Utilisateur | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<Utilisateur | null>(null);

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

  const pagination = usePagination(filtered);

  function handleAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function handleEdit(u: Utilisateur) {
    setEditing(u);
    setFormOpen(true);
  }

  function handleDelete(u: Utilisateur) {
    // Défer l'ouverture du dialog pour éviter le conflit de focus Radix
    // entre la fermeture du DropdownMenu et l'ouverture de l'AlertDialog.
    setDeleting(u);
    requestAnimationFrame(() => setDeleteOpen(true));
  }

  function handleSave(
    data: Omit<Utilisateur, "id" | "derniereConnexion"> & { id?: string }
  ) {
    if (data.id) {
      updateUtilisateur(data.id, data);
      toast({
        title: "Utilisateur modifié",
        description: `${data.prenom} ${data.nom} — Rôle : ${roleLabels[data.role]}. Journalisé dans l'audit.`,
      });
    } else {
      const { id: _id, ...rest } = data;
      void _id;
      addUtilisateur(rest);
      toast({
        title: "Utilisateur créé",
        description: `${data.prenom} ${data.nom} — Rôle : ${roleLabels[data.role]}.`,
      });
    }
    setFormOpen(false);
    setEditing(null);
  }

  function handleConfirmDelete() {
    // Capture locale : l'AlertDialogAction ferme le dialog automatiquement,
    // ce qui peut clearer `deleting` avant la fin de cette fonction.
    const target = deleting;
    if (!target) return;
    const result = deleteUtilisateur(target.id);
    if (!result.ok) {
      toast({
        title: "Suppression refusée",
        description: result.error,
        variant: "destructive",
      });
      setDeleteOpen(false);
      setDeleting(null);
      return;
    }
    toast({
      title: "Utilisateur supprimé",
      description: `${target.prenom} ${target.nom} a été supprimé. Journalisé dans l'audit.`,
      variant: "destructive",
    });
    setDeleteOpen(false);
    setDeleting(null);
  }

  return (
    <div>
      <PageHeader
        title="Utilisateurs & Rôles"
        description="Gestion des comptes et des rôles RBAC (F6.1 — R2)"
        icon={UserCog}
        actionLabel="Nouvel utilisateur"
        onAction={handleAdd}
      />

      {/* Légende RBAC */}
      <Panel className="mb-6 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <Shield className="size-4 text-blue-500" />
          Contrôle d&apos;accès basé sur les rôles (RBAC)
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {(Object.keys(roleLabels) as Role[]).map((r) => (
            <span
              key={r}
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${roleBadgeBg[r]}`}
            >
              {roleLabels[r]}
            </span>
          ))}
        </div>
      </Panel>

      <Panel className="p-4 sm:p-5">
        <Toolbar search={search} onSearch={setSearch}>
          <Select value={filtreRole} onValueChange={setFiltreRole}>
            <SelectTrigger className="w-[200px]">
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

        <Table>
          <TableHeader>
            <TableRow className="border-gray-100">
              <TableHead className="text-gray-500">Utilisateur</TableHead>
              <TableHead className="text-gray-500">Email</TableHead>
              <TableHead className="text-gray-500">Rôle</TableHead>
              <TableHead className="text-gray-500">Statut</TableHead>
              <TableHead className="text-gray-500">Dernière connexion</TableHead>
              <TableHead className="text-right text-gray-500">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagination.paged.map((u) => (
              <TableRow key={u.id} className="border-gray-50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarFallback
                        className={`text-xs font-semibold text-white ${avatarBg(u.role)}`}
                      >
                        {initials(u.prenom, u.nom)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900">
                        {u.prenom} {u.nom}
                      </p>
                      <p className="text-xs text-gray-400">{u.id}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {u.email}
                </TableCell>
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
                <TableCell className="text-right">
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
                </TableCell>
              </TableRow>
            ))}
            {pagination.paged.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-gray-400">
                  Aucun utilisateur trouvé.
                </TableCell>
              </TableRow>
            )}
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
      </Panel>

      <UtilisateurFormModal
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
    </div>
  );
}
