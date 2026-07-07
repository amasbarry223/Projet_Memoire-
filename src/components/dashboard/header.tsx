"use client";

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

  return (
    <header className="relative z-10 flex h-16 shrink-0 items-center justify-between gap-2 border-b border-gray-200 bg-white px-3 shadow-sm sm:gap-4 sm:px-4 lg:px-6">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <MobileNav />
        {/* Search — réduit sur mobile, max-w sur desktop */}
        <div className="relative min-w-0 flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher…"
            aria-label="Rechercher"
            className="h-10 w-full min-w-0 rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10"
          />
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1 sm:gap-3">
        <button
          type="button"
          className="relative flex size-10 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
          aria-label="Notifications"
        >
          <Bell className="size-5" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        {session && <ProfileButton session={session} />}
      </div>
    </header>
  );
}
