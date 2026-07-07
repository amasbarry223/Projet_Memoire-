"use client";

import { ChevronRight, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { navItems } from "./data";
import { Logo } from "./logo";
import { useAppStore } from "@/lib/view-store";
import { useAuthStore } from "@/lib/auth-store";

export function Sidebar() {
  const view = useAppStore((s) => s.view);
  const setView = useAppStore((s) => s.setView);
  const logout = useAuthStore((s) => s.logout);
  const allowedViews = useAuthStore((s) => s.allowedViews());

  const visibleItems = navItems.filter((item) =>
    allowedViews.includes(item.key)
  );

  return (
    <aside className="hidden lg:flex w-[260px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-[4px_0_24px_-4px_rgba(0,36,96,0.18)]">
      {/* Logo centré et agrandi */}
      <div className="flex h-28 items-center justify-center border-b border-white/10 px-6">
        <Logo size={64} showText={false} />
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
        <ul className="space-y-1">
          {visibleItems.map((item) => {
            const isActive = view === item.key;
            const Icon = item.icon;
            return (
              <li key={item.key}>
                <button
                  type="button"
                  onClick={() => setView(item.key)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-500 text-white shadow-md shadow-blue-500/30"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Icon
                    className={cn(
                      "size-[18px] shrink-0",
                      isActive ? "text-white" : "text-slate-400 group-hover:text-blue-300"
                    )}
                  />
                  <span className="flex-1 text-left">{item.label}</span>
                  {isActive && <ChevronRight className="size-4 text-white/80" />}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Déconnexion */}
      <div className="border-t border-white/10 p-3">
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-red-500/15 hover:text-red-300"
        >
          <LogOut className="size-[18px] text-slate-400" />
          <span className="flex-1 text-left">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
