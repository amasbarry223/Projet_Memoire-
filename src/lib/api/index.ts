export { useDataStore } from "@/lib/data-store";

/**
 * Couche API — architecture retenue : Zustand (`useDataStore`) comme source unique.
 * React Query n'est pas utilisé : le store centralise fetch, cache et mutations Supabase.
 * Ce module expose des helpers pour recharger toutes les données si besoin.
 */
export async function refreshAllData() {
  const { useDataStore } = await import("@/lib/data-store");
  await useDataStore.getState().refresh();
}
