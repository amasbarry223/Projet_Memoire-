import { getSupabase } from "@/lib/supabase/client";

const CANDIDATURES_BUCKET = "candidatures";
const RAPPORTS_BUCKET = "rapports";

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export async function uploadCandidaturePiece(
  userId: string,
  candidatureId: string,
  pieceKey: string,
  file: File
): Promise<{ path: string; taille: string }> {
  const sb = getSupabase();
  const ext = file.name.split(".").pop() ?? "pdf";
  const path = `${userId}/${candidatureId}/${pieceKey}.${ext}`;
  const { error } = await sb.storage.from(CANDIDATURES_BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type || "application/pdf",
  });
  if (error) throw error;
  return { path, taille: formatFileSize(file.size) };
}

export async function getSignedDownloadUrl(
  bucket: string,
  path: string,
  expiresIn = 900
): Promise<string> {
  const sb = getSupabase();
  const { data, error } = await sb.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}

export async function deleteStorageFiles(bucket: string, paths: string[]) {
  if (paths.length === 0) return;
  const sb = getSupabase();
  const { error } = await sb.storage.from(bucket).remove(paths);
  if (error) throw error;
}

export async function listCandidatureFiles(prefix: string): Promise<string[]> {
  const sb = getSupabase();
  const { data, error } = await sb.storage.from(CANDIDATURES_BUCKET).list(prefix);
  if (error) throw error;
  return (data ?? []).map((f) => `${prefix}/${f.name}`);
}

export { CANDIDATURES_BUCKET, RAPPORTS_BUCKET };
