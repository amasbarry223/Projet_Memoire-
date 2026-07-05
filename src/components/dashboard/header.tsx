"use client";

import { Search, Bell, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Header() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-gray-100 bg-white px-4 lg:px-6">
      {/* Search */}
      <div className="relative max-w-md flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search students, teachers, classes..."
          className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-700 placeholder:text-gray-400 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
        />
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

        <div className="hidden sm:flex items-center gap-3 rounded-lg border border-gray-100 py-1.5 pl-1.5 pr-3">
          <Avatar className="size-8 border border-gray-100">
            <AvatarFallback className="bg-emerald-500 text-xs font-semibold text-white">
              AU
            </AvatarFallback>
          </Avatar>
          <div className="text-left">
            <p className="text-sm font-semibold leading-tight text-gray-900">
              Admin User
            </p>
            <p className="text-xs leading-tight text-gray-400">Super Admin</p>
          </div>
          <ChevronDown className="size-4 text-gray-400" />
        </div>
      </div>
    </header>
  );
}
