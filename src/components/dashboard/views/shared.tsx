"use client";

import { Plus, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// En-tête de page standard pour toutes les vues
export function PageHeader({
  title,
  description,
  badge,
  actionLabel,
  onAction,
  icon: Icon,
  className,
}: {
  title: string;
  description?: string;
  badge?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}) {
  return (
    <div className={cn("mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-md shadow-blue-500/25">
            <Icon className="size-5" />
          </div>
        )}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h1>
            {badge && (
              <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-blue-700 ring-1 ring-blue-100">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="mt-1 text-sm leading-relaxed text-gray-500">{description}</p>
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
      <div className="relative w-full sm:max-w-sm">
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

// ─── Layout pleine largeur (pattern Candidatures) ────────────────────────────

export const tableHeadClass =
  "text-xs font-semibold uppercase tracking-wide text-gray-400";
export const tableRowClass =
  "border-gray-50 transition-colors hover:bg-blue-50/40";

export function FullWidthPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full min-h-0 w-full flex-col">{children}</div>
  );
}

export function FullWidthHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "shrink-0 border-b border-gray-200 bg-white px-3 py-3 sm:px-4 lg:px-5",
        className
      )}
    >
      {children}
    </div>
  );
}

export function FullWidthKpiGrid({
  children,
  cols = 4,
  className,
}: {
  children: React.ReactNode;
  cols?: 2 | 3 | 4;
  className?: string;
}) {
  const gridCols =
    cols === 2
      ? "sm:grid-cols-2"
      : cols === 3
        ? "sm:grid-cols-3"
        : "sm:grid-cols-2 lg:grid-cols-4";

  return (
    <div
      className={cn(
        "shrink-0 grid grid-cols-2 gap-2 border-b border-gray-200 bg-white p-2 sm:gap-3 sm:p-3 lg:px-5",
        gridCols,
        className
      )}
    >
      {children}
    </div>
  );
}

export function KpiCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
  ring,
  activeBg,
  pct,
  isActive,
  onClick,
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  ring?: string;
  activeBg?: string;
  pct?: number;
  isActive?: boolean;
  onClick?: () => void;
}) {
  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-lg border p-3 text-left transition-all sm:p-3.5",
        onClick && "cursor-pointer",
        isActive
          ? `border-transparent bg-blue-50/50 shadow-sm ring-2 ${ring ?? "ring-blue-200"}`
          : "border-gray-100 bg-gray-50/50 hover:border-gray-200 hover:bg-white hover:shadow-sm"
      )}
    >
      {isActive && activeBg && (
        <div className={cn("absolute inset-x-0 top-0 h-1", activeBg)} />
      )}
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-xl transition-colors",
            isActive && activeBg ? `${activeBg} text-white` : bg
          )}
        >
          <Icon className={cn("size-5", isActive && activeBg ? "text-white" : color)} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-2xl font-bold tabular-nums text-gray-900">{value}</p>
          <p className="text-xs font-medium text-gray-500">{label}</p>
        </div>
        {pct !== undefined && (
          <span className="text-[10px] font-medium text-gray-400">{pct}%</span>
        )}
      </div>
    </Wrapper>
  );
}

export function FullWidthSection({
  title,
  subtitle,
  headerAction,
  toolbar,
  children,
  footer,
  className,
}: {
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  toolbar?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-h-0 flex-1 flex-col bg-white", className)}>
      {(title || headerAction) && (
        <div className="flex shrink-0 flex-col gap-1 border-b border-gray-200 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-4 lg:px-5">
          <div>
            {title && (
              <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
            )}
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
          {headerAction}
        </div>
      )}
      <div className="flex min-h-0 flex-1 flex-col px-3 py-3 sm:px-4 lg:px-5">
        {toolbar}
        {children}
        {footer && (
          <div className="mt-auto shrink-0 border-t border-gray-100 pt-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-gray-100">
        <Icon className="size-7 text-gray-300" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-gray-500">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/** Chips de filtres actifs — pattern Candidatures */
export type FilterChip = {
  id: string;
  label: string;
  tone?: "gray" | "blue";
  onRemove: () => void;
};

export function ActiveFilterChips({ chips }: { chips: FilterChip[] }) {
  if (chips.length === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <span className="text-xs text-gray-400">Filtres :</span>
      {chips.map((chip) => (
        <span
          key={chip.id}
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs",
            chip.tone === "gray"
              ? "bg-gray-100 text-gray-600"
              : "bg-blue-50 text-blue-700"
          )}
        >
          {chip.label}
          <button
            type="button"
            onClick={chip.onRemove}
            aria-label={`Retirer filtre ${chip.id}`}
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
    </div>
  );
}

export function ResetFiltersButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="h-8 text-xs text-gray-500 hover:text-gray-700"
    >
      <X className="size-3.5" />
      Réinitialiser les filtres
    </Button>
  );
}

/** Avatar initiales avec dégradé — pattern Candidatures */
export function PersonAvatar({
  initials,
  gradient = "from-blue-500 to-blue-700",
  size = "md",
}: {
  initials: string;
  gradient?: string;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "size-9 text-sm" : "size-10 text-sm";
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white shadow-sm",
        dim,
        gradient
      )}
    >
      {initials}
    </div>
  );
}

/** Carte mobile : corps cliquable + pied d'actions séparé (évite button dans button) */
export function MobileCard({
  onActivate,
  body,
  footer,
}: {
  onActivate?: () => void;
  body: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-gray-100 bg-gray-50/50 transition hover:border-blue-200 hover:bg-blue-50/30">
      {onActivate ? (
        <div
          role="button"
          tabIndex={0}
          onClick={onActivate}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onActivate();
            }
          }}
          className="cursor-pointer p-4 text-left"
        >
          {body}
        </div>
      ) : (
        <div className="p-4">{body}</div>
      )}
      {footer && (
        <div className="border-t border-gray-100 px-4 py-3">{footer}</div>
      )}
    </div>
  );
}

export function MobileOnly({ children }: { children: React.ReactNode }) {
  return <div className="space-y-3 md:hidden">{children}</div>;
}

export function DesktopOnly({ children }: { children: React.ReactNode }) {
  return <div className="hidden md:block">{children}</div>;
}

export function filteredSubtitle(count: number, hasFilters: boolean) {
  const base = `${count} résultat${count !== 1 ? "s" : ""}`;
  return hasFilters ? `${base} (filtré)` : base;
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

/** Normalise une note sur 20 quel que soit le barème (`sur`) — la saisie de
 * notes accepte un barème arbitraire, donc toute comparaison ou moyenne doit
 * passer par cette fonction plutôt que comparer la note brute. */
export function noteSur20(note: number | null, sur: number) {
  if (note === null || sur <= 0) return 0;
  return (note / sur) * 20;
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
