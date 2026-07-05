"use client";

import { useState } from "react";
import { Users, Mail, BookOpen, Layers, Pencil, Trash2, MoreVertical, UserPlus } from "lucide-react";
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
import { PageHeader, Toolbar, Panel, StatusBadge } from "./shared";
import { usePagination, DataTablePagination } from "./data-table-pagination";
import { EnseignantFormModal } from "../modals/enseignant-form-modal";
import { EnseignantDeleteDialog } from "../modals/enseignant-delete-dialog";
import { useToast } from "@/hooks/use-toast";

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
    `${e.prenom} ${e.nom} ${e.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const pagination = usePagination(filtered);

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

  function handleSave(data: Omit<Enseignant, "id"> & { id?: string }) {
    if (data.id) {
      updateEnseignant(data.id, data);
      toast({
        title: "Enseignant modifié",
        description: `${data.prenom} ${data.nom} a été mis à jour.`,
      });
    } else {
      const { id: _id, ...rest } = data;
      void _id;
      addEnseignant(rest);
      toast({
        title: "Enseignant créé",
        description: `${data.prenom} ${data.nom} a été ajouté au corps enseignant.`,
      });
    }
    setFormOpen(false);
    setEditing(null);
  }

  function handleConfirmDelete() {
    const target = deleting;
    if (!target) return;
    deleteEnseignant(target.id);
    toast({
      title: "Enseignant supprimé",
      description: `${target.prenom} ${target.nom} a été supprimé. Affectations retirées. Journalisé.`,
      variant: "destructive",
    });
    setDeleteOpen(false);
    setDeleting(null);
  }

  return (
    <div>
      <PageHeader
        title="Enseignants"
        description="Corps enseignant et affectations aux classes/matières (F4.1 — R3)"
        icon={Users}
        actionLabel="Ajouter un enseignant"
        onAction={handleAdd}
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Panel className="flex items-center gap-3 p-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-emerald-50">
            <Users className="size-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{list.length}</p>
            <p className="text-xs text-gray-500">Enseignants</p>
          </div>
        </Panel>
        <Panel className="flex items-center gap-3 p-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-amber-50">
            <BookOpen className="size-5 text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {new Set(list.flatMap((e) => e.matieres)).size}
            </p>
            <p className="text-xs text-gray-500">Matières couvertes</p>
          </div>
        </Panel>
        <Panel className="flex items-center gap-3 p-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-orange-50">
            <Layers className="size-5 text-orange-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {new Set(list.flatMap((e) => e.classes)).size}
            </p>
            <p className="text-xs text-gray-500">Classes affectées</p>
          </div>
        </Panel>
      </div>

      <Panel className="p-4 sm:p-5">
        <Toolbar search={search} onSearch={setSearch} />

        <Table>
          <TableHeader>
            <TableRow className="border-gray-100">
              <TableHead className="text-gray-500">Enseignant</TableHead>
              <TableHead className="text-gray-500">Matières</TableHead>
              <TableHead className="text-gray-500">Classes affectées</TableHead>
              <TableHead className="text-gray-500">Statut</TableHead>
              <TableHead className="text-right text-gray-500">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagination.paged.map((e) => (
              <TableRow key={e.id} className="border-gray-50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-700">
                      {e.prenom.charAt(0)}
                      {e.nom.charAt(0)}
                    </div>
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
                        className="bg-emerald-50 font-normal text-emerald-700"
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
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-gray-100 text-gray-500"
                    }
                  />
                </TableCell>
                <TableCell className="text-right">
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
                </TableCell>
              </TableRow>
            ))}
            {pagination.paged.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-gray-400">
                  Aucun enseignant trouvé.
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
    </div>
  );
}
