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
import { roleLabels, roleBadgeBg } from "./data";

function initials(prenom: string, nom: string) {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
}

function avatarBg(role: string) {
  switch (role) {
    case "admin":
      return "bg-emerald-500";
    case "responsable":
      return "bg-orange-500";
    case "enseignant":
      return "bg-amber-500";
    case "etudiant":
      return "bg-emerald-400";
    default:
      return "bg-gray-400";
  }
}

export function Header() {
  const session = useAuthStore((s) => s.session);
  const logout = useAuthStore((s) => s.logout);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-gray-100 bg-white px-4 lg:px-6">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <MobileNav />
        {/* Search */}
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un étudiant, un dossier, une classe…"
            className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-700 placeholder:text-gray-400 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
          />
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          className="relative flex size-10 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
          aria-label="Notifications"
        >
          <Bell className="size-5" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-amber-500 ring-2 ring-white" />
        </button>

        {session && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="hidden sm:flex items-center gap-3 rounded-lg border border-gray-100 py-1.5 pl-1.5 pr-3 transition hover:bg-gray-50">
                <Avatar className="size-8 border border-gray-100">
                  <AvatarFallback
                    className={`text-xs font-semibold text-white ${avatarBg(session.role)}`}
                  >
                    {initials(session.prenom, session.nom)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="text-sm font-semibold leading-tight text-gray-900">
                    {session.prenom} {session.nom}
                  </p>
                  <p className="text-xs leading-tight text-gray-400">
                    {roleLabels[session.role]}
                  </p>
                </div>
                <ChevronDown className="size-4 text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>
                  {session.prenom} {session.nom}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${roleBadgeBg[session.role]}`}
                >
                  {session.role}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-xs text-gray-500" disabled>
                {session.email}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-700"
                onClick={logout}
              >
                <LogOut className="size-4" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Avatar seul sur mobile */}
        {session && (
          <Avatar className="sm:hidden size-8">
            <AvatarFallback
              className={`text-xs font-semibold text-white ${avatarBg(session.role)}`}
            >
              {initials(session.prenom, session.nom)}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </header>
  );
}
