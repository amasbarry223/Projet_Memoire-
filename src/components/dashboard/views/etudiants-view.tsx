"use client";

import { useState } from "react";
import {
  GraduationCap,
  Eye,
  Pencil,
  ClipboardEdit,
  Trash2,
  MoreVertical,
  UserPlus,
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
import {
  etudiants as initialEtudiants,
  filieres,
  type Etudiant,
} from "@/components/dashboard/data";
import { PageHeader, Toolbar, Panel, StatusBadge } from "./shared";
import { EtudiantFormModal } from "../modals/etudiant-form-modal";
import { EtudiantDetailModal } from "../modals/etudiant-detail-modal";
import { EtudiantDeleteDialog } from "../modals/etudiant-delete-dialog";
import { useToast } from "@/hooks/use-toast";

function moyenneColor(m: number) {
  if (m >= 14) return "text-emerald-600";
  if (m >= 10) return "text-gray-700";
  return "text-red-500";
}

function assiduiteColor(a: number) {
  if (a >= 90) return "bg-emerald-500";
  if (a >= 75) return "bg-amber-500";
  return "bg-red-500";
}

export function EtudiantsView() {
  const openModal = useAppStore((s) => s.openModal);
  const { toast } = useToast();

  const [list, setList] = useState<Etudiant[]>(initialEtudiants);
  const [search, setSearch] = useState("");
  const [filiere, setFiliere] = useState("Toutes");

  // États des 3 modales CRUD
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Etudiant | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [viewing, setViewing] = useState<Etudiant | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<Etudiant | null>(null);

  const filieresUniques = [
    "Toutes",
    ...Array.from(new Set(filieres.map((f) => f.nom))),
  ];

  const filtered = list.filter((e) => {
    const matchSearch = `${e.prenom} ${e.nom} ${e.matricule} ${e.email}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchFiliere = filiere === "Toutes" || e.filiere === filiere;
    return matchSearch && matchFiliere;
  });

  // ─── Actions CRUD ──────────────────────────────────────────────────────

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
    setDeleteOpen(true);
  }

  function handleSave(data: Omit<Etudiant, "id"> & { id?: string }) {
    if (data.id) {
      // Modification
      setList((prev) =>
        prev.map((e) => (e.id === data.id ? { ...e, ...data, id: e.id } : e))
      );
      toast({
        title: "Étudiant modifié",
        description: `${data.prenom} ${data.nom} a été mis à jour. Action journalisée.`,
      });
    } else {
      // Création
      const newId = `ETU-${Date.now()}`;
      setList((prev) => [{ ...data, id: newId }, ...prev]);
      toast({
        title: "Étudiant créé",
        description: `${data.prenom} ${data.nom} a été ajouté à l'établissement.`,
      });
    }
    setFormOpen(false);
    setEditing(null);
  }

  function handleConfirmDelete() {
    if (!deleting) return;
    setList((prev) => prev.filter((e) => e.id !== deleting.id));
    toast({
      title: "Étudiant supprimé",
      description: `${deleting.prenom} ${deleting.nom} (${deleting.matricule}) a été supprimé. Journalisé dans l'audit.`,
      variant: "destructive",
    });
    setDeleteOpen(false);
    setDeleting(null);
  }

  return (
    <div>
      <PageHeader
        title="Étudiants"
        description="Liste des étudiants inscrits (F4.2 — consultation des notes et assiduité)"
        icon={GraduationCap}
        actionLabel="Ajouter un étudiant"
        onAction={handleAdd}
      />

      <Panel className="p-4 sm:p-5">
        <Toolbar search={search} onSearch={setSearch}>
          <Select value={filiere} onValueChange={setFiliere}>
            <SelectTrigger className="w-[200px]">
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

        <Table>
          <TableHeader>
            <TableRow className="border-gray-100">
              <TableHead className="text-gray-500">Étudiant</TableHead>
              <TableHead className="text-gray-500">Matricule</TableHead>
              <TableHead className="text-gray-500">Filière</TableHead>
              <TableHead className="text-gray-500">Classe</TableHead>
              <TableHead className="text-gray-500">Moyenne</TableHead>
              <TableHead className="text-gray-500">Assiduité</TableHead>
              <TableHead className="text-gray-500">Statut</TableHead>
              <TableHead className="text-right text-gray-500">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((e) => (
              <TableRow key={e.id} className="border-gray-50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
                      {e.prenom.charAt(0)}
                      {e.nom.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {e.prenom} {e.nom}
                      </p>
                      <p className="text-xs text-gray-400">{e.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-600 font-mono">
                  {e.matricule}
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {e.filiere}
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {e.classe}
                </TableCell>
                <TableCell>
                  <span className={`text-sm font-bold ${moyenneColor(e.moyenne)}`}>
                    {e.moyenne.toFixed(1)}/20
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200">
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
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-gray-100 text-gray-500"
                    }
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleView(e)}
                    >
                      <Eye className="size-4" />
                      <span className="hidden lg:inline">Fiche</span>
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
                        <DropdownMenuItem
                          onClick={() =>
                            openModal({ type: "note", etudiant: e.nom })
                          }
                        >
                          <ClipboardEdit className="size-4 text-emerald-500" />
                          Saisir une note
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
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-3 text-gray-400">
                    <div className="flex size-12 items-center justify-center rounded-full bg-gray-100">
                      <GraduationCap className="size-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Aucun étudiant trouvé
                      </p>
                      <p className="text-xs">
                        Modifiez votre recherche ou ajoutez un nouvel étudiant.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                      onClick={handleAdd}
                    >
                      <UserPlus className="size-4" />
                      Ajouter un étudiant
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Panel>

      {/* Modales CRUD */}
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
    </div>
  );
}
