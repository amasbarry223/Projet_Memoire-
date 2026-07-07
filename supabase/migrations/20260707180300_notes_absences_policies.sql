-- Enseignants : mise à jour / suppression de leurs notes et absences
CREATE POLICY notes_update_enseignant ON notes
  FOR UPDATE TO authenticated
  USING (
    public.auth_role() = 'enseignant'
    AND EXISTS (
      SELECT 1 FROM enseignant_classes ec
      JOIN enseignants e ON e.id = ec.enseignant_id
      JOIN profiles p ON p.id = e.profile_id
      WHERE p.id = auth.uid()
        AND ec.classe_id = notes.classe_id
    )
  );

CREATE POLICY notes_delete_enseignant ON notes
  FOR DELETE TO authenticated
  USING (
    public.auth_role() = 'enseignant'
    AND EXISTS (
      SELECT 1 FROM enseignant_classes ec
      JOIN enseignants e ON e.id = ec.enseignant_id
      JOIN profiles p ON p.id = e.profile_id
      WHERE p.id = auth.uid()
        AND ec.classe_id = notes.classe_id
    )
  );

CREATE POLICY absences_update_enseignant ON absences
  FOR UPDATE TO authenticated
  USING (
    public.auth_role() = 'enseignant'
    AND EXISTS (
      SELECT 1 FROM enseignant_classes ec
      JOIN enseignants e ON e.id = ec.enseignant_id
      JOIN profiles p ON p.id = e.profile_id
      WHERE p.id = auth.uid()
        AND ec.classe_id = absences.classe_id
    )
  );

CREATE POLICY absences_delete_enseignant ON absences
  FOR DELETE TO authenticated
  USING (
    public.auth_role() = 'enseignant'
    AND EXISTS (
      SELECT 1 FROM enseignant_classes ec
      JOIN enseignants e ON e.id = ec.enseignant_id
      JOIN profiles p ON p.id = e.profile_id
      WHERE p.id = auth.uid()
        AND ec.classe_id = absences.classe_id
    )
  );

-- Admin peut supprimer candidatures
CREATE POLICY candidatures_delete_admin ON candidatures
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- Admin/responsable peut créer des alertes
CREATE POLICY alertes_insert_staff ON alertes
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_admin()
    OR public.auth_role() = 'responsable'
  );

CREATE POLICY alertes_delete_admin ON alertes
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- Admin/responsable peut supprimer rapports
CREATE POLICY rapports_delete_staff ON rapports
  FOR DELETE TO authenticated
  USING (
    public.is_admin()
    OR public.auth_role() = 'responsable'
  );
