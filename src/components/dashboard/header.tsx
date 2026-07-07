"use client";

import { useState } from "react";
import { Search, Bell, ChevronDown, LogOut } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MobileNav } from "./mobile-nav";
import { useAuthStore } from "@/lib/auth-store";
import { logoutSession } from "@/lib/session-actions";
import { roleLabels, roleBadgeBg } from "./data";
import { useGlobalSearch, useNotifications } from "@/hooks/use-global-search";
import { useAppStore } from "@/lib/view-store";

function initials(prenom: string, nom: string) {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
}

function avatarBg(role: string) {
  switch (role) {
    case "admin":
      return "bg-blue-600";
    case "responsable":
      return "bg-orange-500";
    case "enseignant":
      return "bg-yellow-500";
    case "etudiant":
      return "bg-blue-400";
    default:
      return "bg-gray-400";
  }
}

function ProfileButton({
  session,
  compact = false,
}: {
  session: { prenom: string; nom: string; role: keyof typeof roleLabels; email: string };
  compact?: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`flex items-center gap-2 rounded-lg border border-gray-100 py-1.5 pl-1.5 transition hover:bg-gray-50 ${
            compact ? "pr-1.5" : "pr-3"
          }`}
          aria-label="Menu utilisateur"
        >
          <Avatar className="size-8 border border-gray-100">
            <AvatarFallback
              className={`text-xs font-semibold text-white ${avatarBg(session.role)}`}
            >
              {initials(session.prenom, session.nom)}
            </AvatarFallback>
          </Avatar>
          {!compact && (
            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold leading-tight text-gray-900">
                {session.prenom} {session.nom}
              </p>
              <p className="text-xs leading-tight text-gray-400">
                {roleLabels[session.role]}
              </p>
            </div>
          )}
          {!compact && <ChevronDown className="hidden size-4 text-gray-400 sm:block" />}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center justify-between gap-2">
          <span className="truncate">
            {session.prenom} {session.nom}
          </span>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${roleBadgeBg[session.role]}`}
          >
            {session.role}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-xs text-gray-500" disabled>
          <span className="truncate">{session.email}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 focus:text-red-700"
          onClick={() => void logoutSession()}
        >
          <LogOut className="size-4" />
          Déconnexion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Header() {
  const session = useAuthStore((s) => s.session);
  const setView = useAppStore((s) => s.setView);
  const openDossier = useAppStore((s) => s.openDossier);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const results = useGlobalSearch(searchQuery);
  const { items: notifications, unread, markAllRead, markRead } = useNotifications();

  function navigateTo(result: (typeof results)[0]) {
    setView(result.view);
    if (result.dossierId) openDossier(result.dossierId);
    setSearchQuery("");
    setSearchOpen(false);
  }

  return (
    <header className="relative z-10 flex h-16 shrink-0 items-center justify-between gap-2 border-b border-gray-200 bg-white px-3 shadow-sm sm:gap-4 sm:px-4 lg:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <MobileNav />
        <div className="relative min-w-0 max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher…"
            aria-label="Rechercher"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
            className="h-10 w-full min-w-0 rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10"
          />
          {searchOpen && results.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              {results.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className="flex w-full flex-col px-3 py-2 text-left hover:bg-gray-50"
                  onMouseDown={() => navigateTo(r)}
                >
                  <span className="text-sm font-medium text-gray-900">{r.label}</span>
                  <span className="truncate text-xs text-gray-500">{r.sublabel}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="relative flex size-10 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
              aria-label="Notifications"
            >
              <Bell className="size-5" />
              {unread.length > 0 && (
                <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                  {unread.length > 9 ? "9+" : unread.length}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              {unread.length > 0 && (
                <button
                  type="button"
                  className="text-xs font-normal text-blue-600 hover:underline"
                  onClick={markAllRead}
                >
                  Tout marquer lu
                </button>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <DropdownMenuItem disabled>Aucune notification</DropdownMenuItem>
            ) : (
              notifications.map((n) => (
                <DropdownMenuItem
                  key={n.id}
                  className="flex flex-col items-start gap-0.5"
                  onClick={() => {
                    markRead(n.id);
                    setView(n.view);
                  }}
                >
                  <span className="text-sm font-medium">{n.title}</span>
                  <span className="line-clamp-2 text-xs text-gray-500">{n.body}</span>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {session && <ProfileButton session={session} />}
      </div>
    </header>
  );
}
