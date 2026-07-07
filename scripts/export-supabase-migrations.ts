/**
 * Exporte les migrations depuis un fichier JSON MCP (stdin ou chemin en argument).
 * Usage: npx tsx scripts/export-supabase-migrations.ts [chemin-export.json]
 */
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

type MigrationRow = { version: string; name: string; sql: string };

function extractRows(raw: string): MigrationRow[] {
  let content = raw.trim();

  try {
    const outer = JSON.parse(content) as { result?: string };
    if (typeof outer.result === "string") {
      content = outer.result;
    }
  } catch {
    // Fichier brut MCP ou tableau JSON direct
  }

  const marker = content.indexOf('[{"version"');
  if (marker === -1) {
    throw new Error("Tableau de migrations introuvable dans l'export");
  }

  let depth = 0;
  let end = marker;
  for (let i = marker; i < content.length; i++) {
    const ch = content[i];
    if (ch === "[") depth++;
    if (ch === "]") {
      depth--;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }
  return JSON.parse(content.slice(marker, end)) as MigrationRow[];
}

const inputPath = process.argv[2];
const raw = inputPath
  ? readFileSync(inputPath, "utf8")
  : readFileSync(0, "utf8");

const rows = extractRows(raw);
const dir = join(process.cwd(), "supabase", "migrations");
mkdirSync(dir, { recursive: true });

for (const row of rows) {
  const file = join(dir, `${row.version}_${row.name}.sql`);
  writeFileSync(file, row.sql.replace(/\\n/g, "\n") + "\n");
  console.log("Écrit", file);
}

writeFileSync(
  join(dir, "MIGRATIONS.md"),
  `# Index des migrations\n\nProjet : xttajufueeacefrvxbrq\n\n${rows
    .map((r) => `- \`${r.version}_${r.name}.sql\``)
    .join("\n")}\n`
);

console.log(`Export terminé : ${rows.length} fichiers.`);
