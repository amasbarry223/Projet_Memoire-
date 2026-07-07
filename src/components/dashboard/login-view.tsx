"use client";

import { useState } from "react";
import { Mail, Lock, LogIn, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/auth-store";
import { Logo } from "./logo";
import { useAppStore } from "@/lib/view-store";
import { roleLabels, defaultView } from "@/components/dashboard/data";
import { useToast } from "@/hooks/use-toast";

export function LoginView() {
  const login = useAuthStore((s) => s.login);
  const resetPassword = useAuthStore((s) => s.resetPassword);
  const setView = useAppStore((s) => s.setView);
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  async function handleForgotPassword() {
    setError(null);
    setForgotLoading(true);
    const result = await resetPassword(email);
    setForgotLoading(false);
    if (result.ok) {
      toast({
        title: "Email envoyé",
        description:
          "Si un compte existe pour cette adresse, vous recevrez un lien de réinitialisation.",
      });
      return;
    }
    setError(result.error ?? "Impossible d'envoyer l'email de réinitialisation.");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? "Échec de la connexion.");
      return;
    }
    const session = useAuthStore.getState().session;
    if (!session) {
      setError("Session introuvable après connexion.");
      return;
    }
    setView(defaultView[session.role]);
    toast({
      title: "Connexion réussie",
      description: `Bienvenue — connecté en tant que ${roleLabels[session.role]}.`,
    });
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-8">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/bg.jpg')" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[#002460]/55"
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-2xl border border-white/20 bg-white/95 p-6 shadow-2xl shadow-blue-950/30 backdrop-blur-sm sm:p-8">
          <div className="flex justify-center">
            <Logo size={140} showText={false} />
          </div>

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Connexion
            </span>
            <span className="h-px flex-1 bg-gray-200" />
          </div>

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
                  placeholder="votre.email@esgic.ml"
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
                  className="text-xs font-medium text-blue-700 hover:text-blue-800 disabled:opacity-50"
                  onClick={handleForgotPassword}
                  disabled={forgotLoading || loading}
                >
                  {forgotLoading ? "Envoi…" : "Mot de passe oublié ?"}
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
              className="h-11 w-full bg-blue-500 text-white hover:bg-blue-700 disabled:opacity-60"
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
        </div>

        <p className="mt-6 text-center text-xs text-white/60">
          © 2024 ESGIC — Projet de mémoire · Vercel × Supabase × n8n × Claude
        </p>
      </div>
    </div>
  );
}
