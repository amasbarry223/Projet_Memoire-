"use client";

import { Settings, Save, Bell, Shield, Globe, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader, Panel } from "./shared";
import { useToast } from "@/hooks/use-toast";

function SettingRow({
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
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="flex items-start gap-3">
        <div className="flex size-9 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
          <Icon className="size-4" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{title}</p>
          <p className="text-xs text-gray-400">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

export function ParametresView() {
  const { toast } = useToast();

  function handleSave() {
    toast({
      title: "Paramètres enregistrés",
      description: "La configuration globale a été mise à jour.",
    });
  }

  return (
    <div>
      <PageHeader
        title="Paramètres"
        description="Configuration globale de l'établissement (F6)"
        icon={Settings}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Établissement */}
        <Panel className="p-5">
          <h3 className="mb-4 text-base font-semibold text-gray-900">
            Informations de l&apos;établissement
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="eta-nom">Nom</Label>
              <Input id="eta-nom" defaultValue="Institut ScolaFlow du Mali" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="eta-email">Email contact</Label>
                <Input id="eta-email" type="email" defaultValue="contact@scolaflow.ml" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eta-tel">Téléphone</Label>
                <Input id="eta-tel" defaultValue="+223 20 22 33 44" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="eta-addr">Adresse</Label>
              <Textarea id="eta-addr" rows={2} defaultValue="Avenue de l'Indépendance, ACI 2000, Bamako" />
            </div>
          </div>
        </Panel>

        {/* Sécurité & session */}
        <Panel className="p-5">
          <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
            <Shield className="size-4 text-emerald-500" />
            Sécurité & session
          </h3>
          <div className="divide-y divide-gray-100">
            <SettingRow
              icon={Clock}
              title="Expiration de session"
              description="Durée avant déconnexion automatique"
            >
              <Select defaultValue="24">
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8">8 heures</SelectItem>
                  <SelectItem value="24">24 heures</SelectItem>
                  <SelectItem value="72">3 jours</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>
            <SettingRow
              icon={Shield}
              title="RLS Supabase"
              description="Row Level Security activé sur toutes les tables (R1)"
            >
              <Switch defaultChecked />
            </SettingRow>
            <SettingRow
              icon={Globe}
              title="HTTPS obligatoire"
              description="Force le chiffrement des échanges"
            >
              <Switch defaultChecked />
            </SettingRow>
          </div>
        </Panel>

        {/* Notifications */}
        <Panel className="p-5">
          <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
            <Bell className="size-4 text-amber-500" />
            Notifications n8n
          </h3>
          <div className="divide-y divide-gray-100">
            <SettingRow
              icon={Bell}
              title="Email de confirmation candidat"
              description="Envoyé via n8n à la soumission d'un dossier (CA2)"
            >
              <Switch defaultChecked />
            </SettingRow>
            <SettingRow
              icon={Bell}
              title="Notification de validation/rejet"
              description="Notifie le candidat du traitement de son dossier"
            >
              <Switch defaultChecked />
            </SettingRow>
            <SettingRow
              icon={Bell}
              title="Alertes IA hebdomadaires"
              description="Synthèse pédagogique envoyée aux responsables"
            >
              <Switch defaultChecked />
            </SettingRow>
          </div>
        </Panel>

        {/* Intégration IA */}
        <Panel className="p-5">
          <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
            <Globe className="size-4 text-emerald-500" />
            Intégration IA & n8n
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="n8n-url">URL du webhook n8n</Label>
              <Input id="n8n-url" defaultValue="https://n8n.local/webhook/scolaflow" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ia-key">Modèle IA (Claude)</Label>
              <Select defaultValue="claude">
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="claude">Claude (Anthropic)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <SettingRow
              icon={Globe}
              title="Mention d'usage de l'IA"
              description="Affiche l'information de traitement IA aux candidats"
            >
              <Switch defaultChecked />
            </SettingRow>
          </div>
        </Panel>
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          className="bg-emerald-500 text-white hover:bg-emerald-600"
          onClick={handleSave}
        >
          <Save className="size-4" />
          Enregistrer les paramètres
        </Button>
      </div>
    </div>
  );
}
