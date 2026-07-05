"use client";

import { useState } from "react";
import {
  GraduationCap,
  Mail,
  Lock,
  LogIn,
  ShieldCheck,
  BrainCircuit,
  Workflow,
  Users,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/auth-store";
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
  enseignant: GraduationCap,
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
    // Simule un court débit réseau
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
    <div className="flex min-h-screen bg-gray-50">
      {/* Panneau gauche — branding */}
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-700 lg:flex lg:flex-col lg:justify-between lg:p-12">
        {/* Décor */}
        <div className="pointer-events-none absolute -right-16 -top-16 size-72 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-24 -left-10 size-80 rounded-full bg-white/5" />

        {/* Logo */}
        <div className="relative flex items-center gap-3 text-white">
          <div className="flex size-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
            <GraduationCap className="size-6" />
          </div>
          <span className="text-2xl font-bold">
            Scola<span className="text-emerald-200">Flow</span>
          </span>
        </div>

        {/* Titre + features */}
        <div className="relative text-white">
          <h1 className="text-4xl font-bold leading-tight">
            Gestion des inscriptions
            <br />
            et suivi pédagogique
          </h1>
          <p className="mt-4 max-w-md text-emerald-50/90">
            Plateforme centralisée avec contrôle d&apos;accès basé sur les rôles
            (RBAC), automatisation n8n et analyse IA.
          </p>

          <ul className="mt-8 space-y-4">
            {[
              { icon: ShieldCheck, text: "Sécurité RLS Supabase sur 100% des tables" },
              { icon: Workflow, text: "Workflows n8n pour les notifications automatiques" },
              { icon: BrainCircuit, text: "Détection IA des étudiants à risque" },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <li key={i} className="flex items-center gap-3 text-emerald-50">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
                    <Icon className="size-5" />
                  </div>
                  <span className="text-sm">{f.text}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Pied */}
        <p className="relative text-xs text-emerald-50/70">
          © 2024 ScolaFlow — Projet de mémoire · Vercel × Supabase × n8n × Claude
        </p>
      </div>

      {/* Panneau droit — formulaire */}
      <div className="flex w-full flex-col justify-center px-6 py-10 lg:w-1/2 lg:px-20">
        <div className="mx-auto w-full max-w-md">
          {/* Logo mobile */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500 text-white">
              <GraduationCap className="size-6" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              Scola<span className="text-emerald-500">Flow</span>
            </span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900">Connexion</h2>
          <p className="mt-1 text-sm text-gray-500">
            Accédez à votre espace selon votre rôle (F1.1 — F1.3).
          </p>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Adresse email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@scolaflow.fr"
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

          {/* Séparateur */}
          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Connexion rapide démo
            </span>
            <span className="h-px flex-1 bg-gray-200" />
          </div>

          {/* Quick login par rôle */}
          <div className="space-y-2">
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

          <p className="mt-6 text-center text-xs text-gray-400">
            Comptes de démonstration — livrable soutenance (§6.1)
          </p>
        </div>
      </div>
    </div>
  );
}
