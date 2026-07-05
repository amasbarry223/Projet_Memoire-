"use client";

import { useState } from "react";
import {
  Mail,
  Lock,
  LogIn,
  ShieldCheck,
  BrainCircuit,
  Workflow,
  Users,
  ArrowRight,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/auth-store";
import { Logo } from "./logo";
import { useAppStore } from "@/lib/view-store";
import {
  demoAccounts,
  roleLabels,
  roleBadgeBg,
  defaultView,
  type Role,
} from "@/components/dashboard/data";
import { useToast } from "@/hooks/use-toast";

const roleIcons: Record<Role, React.ComponentType<{ className?: string }>> = {
  admin: ShieldCheck,
  responsable: Users,
  enseignant: Users,
  etudiant: Workflow,
  candidat: BrainCircuit,
};

const roleDesc: Record<Role, string> = {
  admin: "Accès complet à toutes les fonctionnalités et à la configuration.",
  responsable: "Suivi pédagogique, alertes IA, rapports et journal d'audit.",
  enseignant: "Saisie des notes et absences pour vos classes et matières.",
  etudiant: "Consultation de vos notes, absences et dossier d'inscription.",
  candidat: "Soumission et suivi de votre dossier d'inscription.",
};

export function LoginView() {
  const login = useAuthStore((s) => s.login);
  const loginAs = useAuthStore((s) => s.loginAs);
  const setView = useAppStore((s) => s.setView);
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  function afterLogin(role: Role) {
    setView(defaultView[role]);
    toast({
      title: "Connexion réussie",
      description: `Bienvenue — connecté en tant que ${roleLabels[role]}.`,
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setTimeout(() => {
      const result = login(email, password);
      setLoading(false);
      if (!result.ok) {
        setError(result.error ?? "Échec de la connexion.");
        return;
      }
      const account = demoAccounts.find(
        (a) => a.email.toLowerCase() === email.toLowerCase()
      );
      if (account) afterLogin(account.role);
    }, 400);
  }

  function quickLogin(role: Role) {
    const account = demoAccounts.find((a) => a.role === role);
    if (!account) return;
    loginAs(account);
    afterLogin(account.role);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-emerald-50/40 px-4 py-8">
      {/* Décor d'arrière-plan */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 size-80 rounded-full bg-emerald-100/40 blur-3xl" />
        <div className="absolute -right-24 -bottom-24 size-96 rounded-full bg-emerald-100/30 blur-3xl" />
      </div>

      {/* Conteneur centré */}
      <div className="relative w-full max-w-md">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xl shadow-emerald-900/5 sm:p-8">
          {/* Logo centré — bien visible */}
          <div className="flex justify-center">
            <Logo size={220} showText={false} />
          </div>

          {/* Séparateur */}
          <div className="mt-2 mb-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Connexion
            </span>
            <span className="h-px flex-1 bg-gray-200" />
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Adresse email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="amadou.toure@esgic.ml"
                  className="h-11 pl-10"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mot de passe</Label>
                <button
                  type="button"
                  className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
                >
                  Mot de passe oublié ?
                </button>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 pl-10"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                <AlertCircle className="size-4 shrink-0" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-60"
            >
              {loading ? (
                "Connexion…"
              ) : (
                <>
                  <LogIn className="size-4" />
                  Se connecter
                </>
              )}
            </Button>
          </form>

          {/* Bascule comptes démo (masqués par défaut) */}
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowDemo((v) => !v)}
              className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
              aria-expanded={showDemo}
            >
              <span className="flex items-center gap-2">
                <Users className="size-4 text-gray-400" />
                Comptes de démonstration
              </span>
              <ChevronDown
                className={`size-4 text-gray-400 transition-transform ${
                  showDemo ? "rotate-180" : ""
                }`}
              />
            </button>

            {showDemo && (
              <div className="mt-2 space-y-2">
                {demoAccounts.map((account) => {
                  const Icon = roleIcons[account.role];
                  return (
                    <button
                      key={account.role}
                      type="button"
                      onClick={() => quickLogin(account.role)}
                      className="group flex w-full items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 text-left transition hover:border-emerald-300 hover:bg-emerald-50/40"
                    >
                      <div className="flex size-9 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition group-hover:bg-emerald-100 group-hover:text-emerald-600">
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">
                            {roleLabels[account.role]}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${roleBadgeBg[account.role]}`}
                          >
                            {account.role}
                          </span>
                        </div>
                        <p className="truncate text-xs text-gray-400">
                          {roleDesc[account.role]}
                        </p>
                      </div>
                      <ArrowRight className="size-4 text-gray-300 transition group-hover:text-emerald-500" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Pied */}
        <p className="mt-6 text-center text-xs text-gray-400">
          © 2024 ESGic — Projet de mémoire · Vercel × Supabase × n8n × Claude
        </p>
      </div>
    </div>
  );
}
