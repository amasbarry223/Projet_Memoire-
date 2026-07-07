"use client";

import { useState } from "react";
import { Lock, KeyRound, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/auth-store";
import { Logo } from "./logo";
import { useToast } from "@/hooks/use-toast";

export function UpdatePasswordView() {
  const updatePassword = useAuthStore((s) => s.updatePassword);
  const logout = useAuthStore((s) => s.logout);
  const { toast } = useToast();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    const result = await updatePassword(password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? "Échec de la mise à jour du mot de passe.");
      return;
    }
    toast({
      title: "Mot de passe mis à jour",
      description: "Vous êtes maintenant connecté avec votre nouveau mot de passe.",
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
              Nouveau mot de passe
            </span>
            <span className="h-px flex-1 bg-gray-200" />
          </div>

          <p className="mb-4 text-center text-sm text-gray-500">
            Choisissez un nouveau mot de passe pour votre compte.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Nouveau mot de passe</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8 caractères min."
                  className="h-11 pl-10"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password-confirm">Confirmation</Label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="new-password-confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Répéter le mot de passe"
                  className="h-11 pl-10"
                  autoComplete="new-password"
                  minLength={8}
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
              {loading ? "Mise à jour…" : "Définir le mot de passe"}
            </Button>

            <button
              type="button"
              className="w-full text-center text-xs font-medium text-gray-400 hover:text-gray-600"
              onClick={() => void logout()}
            >
              Annuler et retourner à la connexion
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
