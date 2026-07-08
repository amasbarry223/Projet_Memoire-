# Supabase — ESGIC / ScolaFlow

Projet distant : `xttajufueeacefrvxbrq`

## Migrations

Les migrations SQL appliquées sur le projet Supabase sont versionnées dans [`migrations/`](./migrations/).

Pour régénérer les fichiers depuis la base distante :

```bash
npm run export:migrations
```

Cela lit `supabase_migrations.schema_migrations` et écrit un fichier `.sql` par migration.

## Appliquer sur un nouvel environnement

1. Configurer `.env.local` avec les clés Supabase
2. Exécuter les migrations dans l'ordre (Supabase CLI ou MCP `apply_migration`)

## Points d'attention

### Migration `20260708000000_fix_audit_log_integrity.sql` — À APPLIQUER MANUELLEMENT

La policy RLS `audit_insert` permettait à **n'importe quel utilisateur authentifié** (candidat, étudiant…) d'insérer directement une ligne dans `audit_log` avec un champ `utilisateur` totalement arbitraire — en contournant `log_audit()` qui résout l'auteur de façon fiable. N'importe qui pouvait donc falsifier le journal d'audit et usurper l'identité d'un admin.

Cette migration restreint l'insertion directe (`WITH CHECK (false)`) — seule la fonction `log_audit()` (SECURITY DEFINER) et les routes API (client service-role, qui contourne la RLS) peuvent écrire dans cette table.

**Cette migration doit être appliquée manuellement** (pas d'outil MCP/CLI authentifié disponible dans cette session) :

```sql
DROP POLICY IF EXISTS audit_insert ON audit_log;
CREATE POLICY audit_insert ON audit_log FOR INSERT WITH CHECK (false);
```

Après application, vérifiez qu'une action normale (ex. modifier un étudiant) crée toujours bien une entrée dans le journal d'audit — `log_audit()` étant `SECURITY DEFINER`, elle devrait continuer de fonctionner normalement malgré la policy plus stricte, mais mieux vaut confirmer.

### Migration `20260707190000_fix_handle_new_user_trigger.sql`

La création d'utilisateur (`Nouvel utilisateur`, mot de passe ou invitation par email) échouait avec `500 Database error creating new user` : le trigger `handle_new_user()` sur `auth.users` levait une exception non interceptée dès qu'il ne pouvait pas insérer dans `public.profiles`. Cette migration rend le trigger tolérant aux erreurs — `/api/users` fait de toute façon un upsert complet du profil juste après.

**Statut** : appliquée sur le projet distant `xttajufueeacefrvxbrq` (juillet 2026).

Pour un nouvel environnement, exécuter le fichier [`migrations/20260707190000_fix_handle_new_user_trigger.sql`](./migrations/20260707190000_fix_handle_new_user_trigger.sql).

### Migration `20260707160150_fix_absences_insert_enseignant.sql`

Cette migration insère les paramètres par défaut (`ON CONFLICT DO NOTHING`). Si elle a **déjà été appliquée** en production avec une URL n8n factice (`https://n8n.local/webhook/esgic`), **modifier le fichier SQL ne met pas à jour la base** : la ligne `integrations` existe déjà.

**Action manuelle** : Paramètres → Intégrations → vider ou reconfigurer le champ « URL du webhook n8n », puis enregistrer.

Alternative SQL (admin) :

```sql
UPDATE parametres
SET value = jsonb_set(value, '{n8nUrl}', '""'::jsonb, true)
WHERE key = 'integrations';
```

### Comportements voulus (non bugs)

- **Paramètres pour non-admins** : la table `parametres` est protégée par RLS ; le fallback côté client masque gracieusement l'accès refusé.
- **Libellés / couleurs UI** : constantes d'interface, pas des données métier persistées.

### Mot de passe oublié (config Supabase)

Pour que le lien reçu par email fonctionne :

1. **Authentication → URL Configuration → Redirect URLs** : ajouter l'URL de l'app (ex. `http://localhost:3000/` et `https://projet-memoire-esgic.vercel.app/`).
2. **SMTP / Email** : configurer l'envoi d'emails dans Supabase ; sinon `resetPasswordForEmail` peut réussir côté API sans qu'aucun email n'arrive.

L'app affiche l'écran « Définir un nouveau mot de passe » lors de l'événement `PASSWORD_RECOVERY` (lien de réinitialisation).
