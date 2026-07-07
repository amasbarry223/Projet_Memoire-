-- Bucket privé pour les pièces justificatives des candidatures
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'candidatures',
  'candidatures',
  false,
  5242880,
  ARRAY['application/pdf', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- Lecture : candidat sur ses fichiers, admin sur tout
CREATE POLICY candidatures_storage_select ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'candidatures'
    AND (
      public.is_admin()
      OR (storage.foldername(name))[1] = auth.uid()::text
    )
  );

-- Upload : candidat dans son dossier utilisateur
CREATE POLICY candidatures_storage_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'candidatures'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Suppression : candidat ou admin
CREATE POLICY candidatures_storage_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'candidatures'
    AND (
      public.is_admin()
      OR (storage.foldername(name))[1] = auth.uid()::text
    )
  );
