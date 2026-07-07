DROP POLICY IF EXISTS absences_write ON absences;
CREATE POLICY absences_insert ON absences FOR INSERT WITH CHECK (
  is_admin() OR is_responsable_or_admin()
  OR (auth_role() = 'enseignant' AND classe_id IS NOT NULL AND enseignant_has_classe(classe_id))
);
CREATE POLICY absences_update ON absences FOR UPDATE USING (is_admin() OR is_responsable_or_admin()) WITH CHECK (is_admin() OR is_responsable_or_admin());
CREATE POLICY absences_delete ON absences FOR DELETE USING (is_admin() OR is_responsable_or_admin());

INSERT INTO parametres (key, value) VALUES
  ('etablissement', '{"nom":"École Supérieure ESGIC","tel":"+223 20 22 33 44","email":"contact@esgic.ml","adresse":"Avenue de l''Indépendance, ACI 2000, Bamako"}'::jsonb),
  ('securite', '{"sessionHours":"24","rlsEnabled":true,"httpsOnly":true}'::jsonb),
  ('notifications', '{"emailConfirmation":true,"validationRejet":true,"alertesHebdo":true}'::jsonb),
  ('integrations', '{"n8nUrl":"","iaModel":"claude","mentionIa":true}'::jsonb)
ON CONFLICT (key) DO NOTHING;
