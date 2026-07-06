"use client";

import { Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// En-tête de page standard pour toutes les vues
export function PageHeader({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="mt-0.5 flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
            <Icon className="size-5" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </div>
      </div>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="bg-blue-500 text-white hover:bg-blue-700"
        >
          <Plus className="size-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

// Barre d'outils de tableau (recherche + filtres)
export function Toolbar({
  search,
  onSearch,
  children,
}: {
  search: string;
  onSearch: (v: string) => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        <Input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Rechercher…"
          className="h-9 pl-9"
        />
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

// Carte conteneur standard
export function Panel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-gray-100 bg-white shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

// Badge de statut générique
export function StatusBadge({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        className
      )}
    >
      {label}
    </span>
  );
}

// Badge de niveau de risque pour les alertes IA
export function niveauBadge(niveau: string) {
  if (niveau === "Élevé") return "bg-red-50 text-red-600";
  if (niveau === "Moyen") return "bg-orange-50 text-orange-600";
  return "bg-yellow-50 text-yellow-700";
}

// Badge de statut de dossier
export function statutBadge(statut: string) {
  switch (statut) {
    case "Validé":
      return "bg-blue-50 text-blue-700";
    case "En attente":
      return "bg-yellow-50 text-yellow-700";
    case "Incomplet":
      return "bg-orange-50 text-orange-600";
    case "Rejeté":
      return "bg-red-50 text-red-500";
    default:
      return "bg-gray-100 text-gray-600";
  }
}
