"use client";

import { useMemo, useState, useEffect } from "react";
import { useDataStore } from "@/lib/data-store";
import { useAuthStore } from "@/lib/auth-store";
import { roleViews, type ViewKey } from "@/components/dashboard/data";

export type SearchResult = {
  id: string;
  label: string;
  sublabel: string;
  view: ViewKey;
  dossierId?: string;
};

export function useGlobalSearch(query: string) {
  const session = useAuthStore((s) => s.session);
  const etudiants = useDataStore((s) => s.etudiants);
  const candidatures = useDataStore((s) => s.candidatures);
  const enseignants = useDataStore((s) => s.enseignants);
  const alertes = useDataStore((s) => s.alertes);
  const audit = useDataStore((s) => s.audit);
  const [debounced, setDebounced] = useState(query);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  return useMemo(() => {
    if (!session || debounced.trim().length < 2) return [];
    const q = debounced.trim().toLowerCase();
    const allowed = new Set(roleViews[session.role]);
    const results: SearchResult[] = [];

    if (allowed.has("etudiants")) {
      for (const e of etudiants) {
        const label = `${e.prenom} ${e.nom}`;
        if (
          label.toLowerCase().includes(q) ||
          e.matricule.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q)
        ) {
          results.push({
            id: `etu-${e.id}`,
            label,
            sublabel: `${e.classe} — ${e.filiere}`,
            view: "etudiants",
          });
        }
      }
    }

    if (allowed.has("candidatures")) {
      for (const c of candidatures) {
        const label = `${c.prenom} ${c.nom}`;
        if (
          label.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q)
        ) {
          results.push({
            id: `cand-${c.id}`,
            label,
            sublabel: `${c.filiere} — ${c.statut}`,
            view: "candidatures",
            dossierId: c.id,
          });
        }
      }
    }

    if (allowed.has("enseignants")) {
      for (const e of enseignants) {
        const label = `${e.prenom} ${e.nom}`;
        if (label.toLowerCase().includes(q) || e.email.toLowerCase().includes(q)) {
          results.push({
            id: `ens-${e.id}`,
            label,
            sublabel: e.matieres.slice(0, 2).join(", ") || e.email,
            view: "enseignants",
          });
        }
      }
    }

    if (allowed.has("alertes")) {
      for (const a of alertes) {
        if (
          a.etudiant.toLowerCase().includes(q) ||
          a.motif.toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q)
        ) {
          results.push({
            id: `alt-${a.id}`,
            label: a.etudiant,
            sublabel: a.motif.slice(0, 60),
            view: "alertes",
          });
        }
      }
    }

    if (allowed.has("audit")) {
      for (const a of audit.slice(0, 50)) {
        if (
          a.action.toLowerCase().includes(q) ||
          a.cible.toLowerCase().includes(q) ||
          a.details.toLowerCase().includes(q)
        ) {
          results.push({
            id: `aud-${a.id}`,
            label: a.action,
            sublabel: a.cible,
            view: "audit",
          });
        }
      }
    }

    return results.slice(0, 12);
  }, [session, debounced, etudiants, candidatures, enseignants, alertes, audit]);
}

export function useNotifications() {
  const session = useAuthStore((s) => s.session);
  const alertes = useDataStore((s) => s.alertes);
  const candidatures = useDataStore((s) => s.candidatures);
  const rapports = useDataStore((s) => s.rapports);
  const [readIds, setReadIds] = useState<string[]>([]);

  useEffect(() => {
    // Lecture localStorage nécessairement différée dans un effet : un
    // lazy initializer useState() serait exécuté pendant le rendu serveur
    // (où localStorage n'existe pas) et produirait un mismatch d'hydratation
    // puisque readIds influence le rendu (badges lus/non lus).
    try {
      const raw = localStorage.getItem("notifications_read");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setReadIds(JSON.parse(raw) as string[]);
    } catch {
      // ignore
    }
  }, []);

  const items = useMemo(() => {
    if (!session) return [];
    const list: { id: string; title: string; body: string; view: ViewKey }[] = [];

    if (["enseignant", "responsable", "admin"].includes(session.role)) {
      for (const a of alertes.filter((x) => x.statut === "Nouvelle").slice(0, 5)) {
        list.push({
          id: `alt-${a.id}`,
          title: `Alerte — ${a.etudiant}`,
          body: a.motif,
          view: "alertes",
        });
      }
    }

    if (session.role === "candidat") {
      for (const c of candidatures.filter((x) => x.email === session.email).slice(0, 3)) {
        const last = c.historique[c.historique.length - 1];
        if (last) {
          list.push({
            id: `cand-${c.id}-${last.date}`,
            title: `Dossier ${c.id}`,
            body: last.action,
            view: "candidatures",
          });
        }
      }
    }

    if (["responsable", "admin"].includes(session.role)) {
      for (const r of rapports.slice(0, 2)) {
        list.push({
          id: `rap-${r.id}`,
          title: "Nouveau rapport",
          body: r.titre,
          view: "rapports",
        });
      }
    }

    return list;
  }, [session, alertes, candidatures, rapports]);

  const unread = items.filter((i) => !readIds.includes(i.id));

  function markAllRead() {
    const ids = [...new Set([...readIds, ...items.map((i) => i.id)])];
    setReadIds(ids);
    localStorage.setItem("notifications_read", JSON.stringify(ids));
  }

  function markRead(id: string) {
    const ids = [...new Set([...readIds, id])];
    setReadIds(ids);
    localStorage.setItem("notifications_read", JSON.stringify(ids));
  }

  return { items, unread, markAllRead, markRead };
}
