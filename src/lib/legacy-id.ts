const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Construit le filtre PostgREST pour résoudre une ligne par son legacy_id
// (ex. "FIL-1783470963862") OU son id UUID interne. La clause `id.eq.X` ne
// peut être incluse que si X est syntaxiquement un UUID : sinon Postgres
// lève "invalid input syntax for type uuid" pour TOUTE la requête .or(),
// même quand legacy_id matche — Postgres type-checke les deux branches du
// OR avant de les évaluer, il n'y a pas de court-circuit. Comme tous les
// identifiants affichés côté UI sont des legacy_id (jamais des UUID), ce
// bug faisait échouer silencieusement (ou avec une erreur) quasiment toutes
// les mises à jour/suppressions de l'application.
export function legacyOrIdFilter(value: string): string {
  return UUID_RE.test(value)
    ? `legacy_id.eq.${value},id.eq.${value}`
    : `legacy_id.eq.${value}`;
}
