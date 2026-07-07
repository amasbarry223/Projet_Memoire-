"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  Save,
  Bell,
  Shield,
  Globe,
  Clock,
  Building2,
  Workflow,
  KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader, Panel } from "./shared";
import { useToast } from "@/hooks/use-toast";
import { useDataStore } from "@/lib/data-store";
import type { AppParametres } from "@/components/dashboard/data";
import { cn } from "@/lib/utils";

const tabs = [
  { value: "etablissement", label: "Établissement", icon: Building2 },
  { value: "securite", label: "Sécurité", icon: Shield },
  { value: "notifications", label: "Notifications", icon: Bell },
  { value: "integrations", label: "Intégrations", icon: Workflow },
] as const;

function SectionIntro({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        <Icon className="size-4" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
}

function SettingCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-gray-100 bg-gray-50/50 p-4">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-gray-500 shadow-xs">
          <Icon className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900">{title}</p>
          <p className="text-xs text-gray-400">{description}</p>
        </div>
      </div>
      <div className="mt-auto flex justify-end">{children}</div>
    </div>
  );
}

export function ParametresView() {
  const { toast } = useToast();
  const stored = useDataStore((s) => s.parametres);
  const saveParametres = useDataStore((s) => s.saveParametres);
  const [form, setForm] = useState<AppParametres>(stored);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(stored);
  }, [stored]);

  async function handleSave() {
    setSaving(true);
    try {
      await saveParametres(form);
      toast({
        title: "Paramètres enregistrés",
        description: "La configuration globale a été mise à jour dans Supabase.",
      });
    } catch (e) {
      toast({
        title: "Erreur",
        description: e instanceof Error ? e.message : "Échec de l'enregistrement",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Paramètres"
        description="Configuration globale de l'établissement (F6)"
        icon={Settings}
      />

      <Tabs defaultValue="etablissement">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-xl bg-gray-100 p-1 sm:grid-cols-4">
          {tabs.map(({ value, label, icon: Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className={cn(
                "h-10 gap-1.5 rounded-lg text-sm font-medium text-gray-500",
                "data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
              )}
            >
              <Icon className="size-4" />
              <span className="truncate">{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="etablissement" className="mt-6">
          <Panel className="p-5 sm:p-6">
            <SectionIntro
              icon={Building2}
              title="Informations de l'établissement"
              description="Ces informations apparaissent sur les documents et communications officielles."
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="eta-nom">Nom de l&apos;établissement</Label>
                <Input
                  id="eta-nom"
                  value={form.etablissement.nom}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      etablissement: { ...f.etablissement, nom: e.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eta-tel">Téléphone</Label>
                <Input
                  id="eta-tel"
                  value={form.etablissement.tel}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      etablissement: { ...f.etablissement, tel: e.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eta-email">Email contact</Label>
                <Input
                  id="eta-email"
                  type="email"
                  value={form.etablissement.email}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      etablissement: { ...f.etablissement, email: e.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="eta-addr">Adresse</Label>
                <Textarea
                  id="eta-addr"
                  rows={1}
                  value={form.etablissement.adresse}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      etablissement: { ...f.etablissement, adresse: e.target.value },
                    }))
                  }
                />
              </div>
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="securite" className="mt-6">
          <Panel className="p-5 sm:p-6">
            <SectionIntro
              icon={Shield}
              title="Sécurité & session"
              description="Contrôle des accès et des règles de protection des données (R1)."
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <SettingCard
                icon={Clock}
                title="Expiration de session"
                description="Durée avant déconnexion automatique"
              >
                <Select
                  value={form.securite.sessionHours}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      securite: { ...f.securite, sessionHours: v },
                    }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8">8 heures</SelectItem>
                    <SelectItem value="24">24 heures</SelectItem>
                    <SelectItem value="72">3 jours</SelectItem>
                  </SelectContent>
                </Select>
              </SettingCard>
              <SettingCard
                icon={KeyRound}
                title="RLS Supabase"
                description="Row Level Security activé sur toutes les tables (R1)"
              >
                <Switch
                  checked={form.securite.rlsEnabled}
                  onCheckedChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      securite: { ...f.securite, rlsEnabled: v },
                    }))
                  }
                />
              </SettingCard>
              <SettingCard
                icon={Globe}
                title="HTTPS obligatoire"
                description="Force le chiffrement des échanges"
              >
                <Switch
                  checked={form.securite.httpsOnly}
                  onCheckedChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      securite: { ...f.securite, httpsOnly: v },
                    }))
                  }
                />
              </SettingCard>
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Panel className="p-5 sm:p-6">
            <SectionIntro
              icon={Bell}
              title="Notifications n8n"
              description="Communications automatiques envoyées aux candidats et responsables."
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <SettingCard
                icon={Bell}
                title="Email de confirmation candidat"
                description="Envoyé via n8n à la soumission d'un dossier (CA2)"
              >
                <Switch
                  checked={form.notifications.emailConfirmation}
                  onCheckedChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      notifications: { ...f.notifications, emailConfirmation: v },
                    }))
                  }
                />
              </SettingCard>
              <SettingCard
                icon={Bell}
                title="Notification de validation/rejet"
                description="Notifie le candidat du traitement de son dossier"
              >
                <Switch
                  checked={form.notifications.validationRejet}
                  onCheckedChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      notifications: { ...f.notifications, validationRejet: v },
                    }))
                  }
                />
              </SettingCard>
              <SettingCard
                icon={Bell}
                title="Alertes IA hebdomadaires"
                description="Synthèse pédagogique envoyée aux responsables"
              >
                <Switch
                  checked={form.notifications.alertesHebdo}
                  onCheckedChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      notifications: { ...f.notifications, alertesHebdo: v },
                    }))
                  }
                />
              </SettingCard>
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="integrations" className="mt-6">
          <Panel className="p-5 sm:p-6">
            <SectionIntro
              icon={Workflow}
              title="Intégration IA & n8n"
              description="Connexion aux services d'automatisation et d'analyse par IA."
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="n8n-url">URL du webhook n8n</Label>
                <Input
                  id="n8n-url"
                  value={form.integrations.n8nUrl}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      integrations: { ...f.integrations, n8nUrl: e.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ia-key">Modèle IA (Claude)</Label>
                <Select
                  value={form.integrations.iaModel}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      integrations: { ...f.integrations, iaModel: v },
                    }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="claude">Claude (Anthropic)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <SettingCard
                icon={Globe}
                title="Mention d'usage de l'IA"
                description="Affiche l'information de traitement IA aux candidats"
              >
                <Switch
                  checked={form.integrations.mentionIa}
                  onCheckedChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      integrations: { ...f.integrations, mentionIa: v },
                    }))
                  }
                />
              </SettingCard>
            </div>
          </Panel>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end">
        <Button
          className="bg-blue-500 text-white hover:bg-blue-700"
          onClick={handleSave}
          disabled={saving}
        >
          <Save className="size-4" />
          {saving ? "Enregistrement…" : "Enregistrer les paramètres"}
        </Button>
      </div>
    </div>
  );
}
