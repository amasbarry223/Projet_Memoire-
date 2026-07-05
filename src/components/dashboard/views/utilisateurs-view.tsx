"use client";

import { useState } from "react";
import { UserCog, Pencil, UserPlus, Shield } from "lucide-react";
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
import { useAppStore } from "@/lib/view-store";
import {
  utilisateurs,
  roleLabels,
  roleBadgeBg,
  type Role,
} from "@/components/dashboard/data";
import { PageHeader, Toolbar, Panel, StatusBadge } from "./shared";

function initials(prenom: string, nom: string) {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
}

function avatarBg(role: Role) {
  switch (role) {
    case "admin":
      return "bg-emerald-500";
    case "responsable":
      return "bg-orange-500";
    case "enseignant":
      return "bg-amber-500";
    case "etudiant":
      return "bg-emerald-100 text-emerald-700";
    default:
      return "bg-gray-300";
  }
}

export function UtilisateursView() {
  const openModal = useAppStore((s) => s.openModal);
  const [search, setSearch] = useState("");
  const [filtreRole, setFiltreRole] = useState("Tous");

  const roles: ("Tous" | Role)[] = [
    "Tous",
    "candidat",
    "etudiant",
    "enseignant",
    "responsable",
    "admin",
  ];

  const filtered = utilisateurs.filter((u) => {
    const matchSearch = `${u.prenom} ${u.nom} ${u.email}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchRole = filtreRole === "Tous" || u.role === filtreRole;
    return matchSearch && matchRole;
  });

  return (
    <div>
      <PageHeader
        title="Utilisateurs & Rôles"
        description="Gestion des comptes et des rôles RBAC (F6.1 — R2)"
        icon={UserCog}
        actionLabel="Nouvel utilisateur"
        onAction={() => openModal({ type: "utilisateur" })}
      />

      {/* Légende RBAC */}
      <Panel className="mb-6 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <Shield className="size-4 text-emerald-500" />
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
              <TableHead className="text-right text-gray-500">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((u) => (
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
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-gray-100 text-gray-500"
                    }
                  />
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {u.derniereConnexion}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      openModal({ type: "utilisateur", userId: u.id })
                    }
                  >
                    <Pencil className="size-4" />
                    Modifier
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Panel>

      <div className="mt-4 flex items-center justify-center">
        <Button
          variant="outline"
          className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
          onClick={() => openModal({ type: "utilisateur" })}
        >
          <UserPlus className="size-4" />
          Créer un compte
        </Button>
      </div>
    </div>
  );
}
