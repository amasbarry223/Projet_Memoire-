"use client";

import { useState } from "react";
import { Menu, ChevronRight, LogOut } from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { navItems } from "./data";
import { Logo } from "./logo";
import { useAppStore } from "@/lib/view-store";
import { useAuthStore } from "@/lib/auth-store";
import { logoutSession } from "@/lib/session-actions";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const view = useAppStore((s) => s.view);
  const setView = useAppStore((s) => s.setView);
  const allowedViews = useAuthStore((s) => s.allowedViews());

  const visibleItems = navItems.filter((item) =>
    allowedViews.includes(item.key)
  );

  function handleSelect(key: typeof view) {
    setView(key);
    setOpen(false);
  }

  function handleLogout() {
    setOpen(false);
    logoutSession();
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Ouvrir le menu"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] border-sidebar-border bg-sidebar p-0 text-sidebar-foreground flex flex-col">
        <SheetHeader className="flex h-24 items-center justify-center border-b border-white/10 px-6 py-0">
          <SheetTitle>
            <Logo size={52} showText={false} />
          </SheetTitle>
        </SheetHeader>
        <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
          <ul className="space-y-1">
            {visibleItems.map((item) => {
              const isActive = view === item.key;
              const Icon = item.icon;
              return (
                <li key={item.key}>
                  <SheetClose asChild>
                    <button
                      type="button"
                      onClick={() => handleSelect(item.key)}
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
                          isActive
                            ? "text-white"
                            : "text-slate-400 group-hover:text-blue-300"
                        )}
                      />
                      <span className="flex-1 text-left">{item.label}</span>
                      {isActive && (
                        <ChevronRight className="size-4 text-white/80" />
                      )}
                    </button>
                  </SheetClose>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t border-white/10 p-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-red-500/15 hover:text-red-300"
          >
            <LogOut className="size-[18px] text-slate-400" />
            <span className="flex-1 text-left">Déconnexion</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
