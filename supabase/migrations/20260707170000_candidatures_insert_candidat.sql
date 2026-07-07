-- Permettre aux candidats de soumettre leur propre dossier (F3)
CREATE POLICY candidatures_insert_own ON candidatures FOR INSERT WITH CHECK (
  auth_role() = 'candidat' AND email = current_profile_email()
);
