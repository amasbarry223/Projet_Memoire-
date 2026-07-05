"use client";

import { useState } from "react";
import { Menu, GraduationCap, ChevronRight, LifeBuoy } from "lucide-react";
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
import { useAppStore } from "@/lib/view-store";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const view = useAppStore((s) => s.view);
  const setView = useAppStore((s) => s.setView);

  function handleSelect(key: typeof view) {
    setView(key);
    setOpen(false);
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
      <SheetContent side="left" className="w-[280px] p-0">
        <SheetHeader className="px-6 py-4">
          <SheetTitle className="flex items-center gap-2 text-left">
            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500 text-white">
              <GraduationCap className="size-5" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Scola<span className="text-emerald-500">Flow</span>
            </span>
          </SheetTitle>
        </SheetHeader>
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Espace Administrateur
          </p>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = view === item.key;
              const Icon = item.icon;
              return (
                <li key={item.key}>
                  <SheetClose asChild>
                    <button
                      type="button"
                      onClick={() => handleSelect(item.key)}
                      className={cn(
                        "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-emerald-500 text-white"
                          : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-600"
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-[18px] shrink-0",
                          isActive
                            ? "text-white"
                            : "text-gray-400 group-hover:text-emerald-500"
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
        <div className="p-3">
          <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-4 text-white">
            <div className="flex items-center gap-2">
              <LifeBuoy className="size-4" />
              <p className="text-sm font-semibold">Besoin d&apos;aide ?</p>
            </div>
            <p className="mt-1 text-xs text-white/80">
              Consultez la documentation technique.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
