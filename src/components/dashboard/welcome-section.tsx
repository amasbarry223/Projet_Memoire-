"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth-store";
import { roleLabels } from "./data";
import { tabsList } from "./data";

export function WelcomeSection() {
  const [activeTab, setActiveTab] = useState("Candidatures");
  const session = useAuthStore((s) => s.session);

  const now = new Date();
  const dateStr = now.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mb-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bonjour{session ? `, ${session.prenom}` : ""} ! Voici l&apos;activité
            du jour
          </h1>
          <p className="mt-1 text-sm text-gray-500 capitalize">
            {dateStr} · Session en cours
            {session ? ` · ${roleLabels[session.role]}` : ""}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-5 border-b border-gray-200">
        <div className="flex gap-1 overflow-x-auto">
          {tabsList.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "relative whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "text-emerald-600"
                    : "text-gray-500 hover:text-gray-800"
                )}
              >
                {tab}
                {isActive && (
                  <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-emerald-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
