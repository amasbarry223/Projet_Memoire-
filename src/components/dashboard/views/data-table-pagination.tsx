"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── Hook de pagination réutilisable ─────────────────────────────────────────
// Gère page/pageSize. La page "sécurisée" est dérivée pendant le rendu
// (sans effect) pour rester dans les bornes quand la liste filtrée rétrécit.

export function usePagination<T>(items: T[], initialPageSize = 5) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  // Page effective : borne entre 1 et totalPages (dérivée, pas d'effet)
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, total);
  const paged = items.slice((safePage - 1) * pageSize, safePage * pageSize);

  return {
    page: safePage,
    pageSize,
    totalPages,
    total,
    start,
    end,
    paged,
    setPage,
    setPageSize: (s: number) => {
      setPageSize(s);
      setPage(1);
    },
  };
}

// ─── Composant visuel de pagination ──────────────────────────────────────────

export function DataTablePagination({
  page,
  pageSize,
  totalPages,
  total,
  start,
  end,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
}: {
  page: number;
  pageSize: number;
  totalPages: number;
  total: number;
  start: number;
  end: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (s: number) => void;
  pageSizeOptions?: number[];
}) {
  // Calcule les numéros de pages à afficher (avec ellipsis)
  const pages: (number | "ellipsis")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("ellipsis");
    const from = Math.max(2, page - 1);
    const to = Math.min(totalPages - 1, page + 1);
    for (let i = from; i <= to; i++) pages.push(i);
    if (page < totalPages - 2) pages.push("ellipsis");
    pages.push(totalPages);
  }

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 px-1 py-3 sm:flex-row">
      {/* Infos + sélecteur taille page */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
        <span>
          Affichage de <span className="font-semibold text-gray-700">{start}</span>
          {" "}à{" "}
          <span className="font-semibold text-gray-700">{end}</span> sur{" "}
          <span className="font-semibold text-gray-700">{total}</span>{" "}
          {total > 1 ? "éléments" : "élément"}
        </span>
        <div className="flex items-center gap-1.5">
          <span>Lignes :</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => onPageSizeChange(Number(v))}
          >
            <SelectTrigger className="h-8 w-[72px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((opt) => (
                <SelectItem key={opt} value={String(opt)}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Navigation pages */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          aria-label="Première page"
        >
          <ChevronsLeft className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          aria-label="Page précédente"
        >
          <ChevronLeft className="size-4" />
        </Button>

        {pages.map((p, idx) =>
          p === "ellipsis" ? (
            <span
              key={`e-${idx}`}
              className="flex size-8 items-center justify-center text-gray-400"
            >
              …
            </span>
          ) : (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              size="icon"
              className={
                p === page
                  ? "size-8 bg-blue-500 text-white hover:bg-blue-700"
                  : "size-8"
              }
              onClick={() => onPageChange(p)}
              aria-label={`Page ${p}`}
              aria-current={p === page ? "page" : undefined}
            >
              {p}
            </Button>
          )
        )}

        <Button
          variant="outline"
          size="icon"
          className="size-8"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          aria-label="Page suivante"
        >
          <ChevronRight className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
          aria-label="Dernière page"
        >
          <ChevronsRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
