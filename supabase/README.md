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
