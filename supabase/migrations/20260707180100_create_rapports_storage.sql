-- Bucket rapports PDF
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'rapports',
  'rapports',
  false,
  20971520,
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE rapports
  ADD COLUMN IF NOT EXISTS fichier_path text,
  ADD COLUMN IF NOT EXISTS taille_octets bigint;

CREATE POLICY rapports_storage_select ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'rapports'
    AND (
      public.is_admin()
      OR public.auth_role() = 'responsable'
    )
  );

CREATE POLICY rapports_storage_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'rapports'
    AND (
      public.is_admin()
      OR public.auth_role() = 'responsable'
    )
  );

CREATE POLICY rapports_storage_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'rapports'
    AND (
      public.is_admin()
      OR public.auth_role() = 'responsable'
    )
  );
