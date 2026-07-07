-- Helper functions
CREATE OR REPLACE FUNCTION auth_role() RETURNS app_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_admin() RETURNS boolean AS $$
  SELECT auth_role() = 'admin'
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_responsable_or_admin() RETURNS boolean AS $$
  SELECT auth_role() IN ('responsable', 'admin')
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_staff() RETURNS boolean AS $$
  SELECT auth_role() IN ('enseignant', 'responsable', 'admin')
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION current_profile_email() RETURNS text AS $$
  SELECT email FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION current_etudiant_id() RETURNS uuid AS $$
  SELECT id FROM etudiants WHERE profile_id = auth.uid() OR email = current_profile_email() LIMIT 1
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION current_enseignant_id() RETURNS uuid AS $$
  SELECT id FROM enseignants WHERE profile_id = auth.uid() OR email = current_profile_email() LIMIT 1
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION enseignant_has_classe(p_classe_id uuid) RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM enseignant_classes ec
    WHERE ec.enseignant_id = current_enseignant_id() AND ec.classe_id = p_classe_id
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Enable RLS
ALTER TABLE filieres ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matieres ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE enseignants ENABLE ROW LEVEL SECURITY;
ALTER TABLE enseignant_matieres ENABLE ROW LEVEL SECURITY;
ALTER TABLE enseignant_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE etudiants ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE absences ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE rapports ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE parametres ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY profiles_select_own ON profiles FOR SELECT USING (id = auth.uid() OR is_admin() OR is_responsable_or_admin());
CREATE POLICY profiles_update_own ON profiles FOR UPDATE USING (id = auth.uid() OR is_admin());
CREATE POLICY profiles_insert_admin ON profiles FOR INSERT WITH CHECK (is_admin());
CREATE POLICY profiles_delete_admin ON profiles FOR DELETE USING (is_admin());

-- Filieres (admin full, staff read)
CREATE POLICY filieres_select ON filieres FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY filieres_write_admin ON filieres FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Classes
CREATE POLICY classes_select ON classes FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY classes_write_admin ON classes FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Matieres
CREATE POLICY matieres_select ON matieres FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY matieres_write_admin ON matieres FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Enseignants
CREATE POLICY enseignants_select ON enseignants FOR SELECT USING (
  is_admin() OR is_responsable_or_admin() OR profile_id = auth.uid() OR auth_role() = 'enseignant'
);
CREATE POLICY enseignants_write ON enseignants FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Enseignant junctions
CREATE POLICY enseignant_matieres_select ON enseignant_matieres FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY enseignant_matieres_write ON enseignant_matieres FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY enseignant_classes_select ON enseignant_classes FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY enseignant_classes_write ON enseignant_classes FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Etudiants
CREATE POLICY etudiants_select ON etudiants FOR SELECT USING (
  is_admin() OR is_responsable_or_admin()
  OR profile_id = auth.uid()
  OR (auth_role() = 'enseignant' AND classe_id IS NOT NULL AND enseignant_has_classe(classe_id))
);
CREATE POLICY etudiants_write ON etudiants FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Candidatures
CREATE POLICY candidatures_select ON candidatures FOR SELECT USING (
  is_admin() OR is_responsable_or_admin()
  OR (auth_role() = 'candidat' AND email = current_profile_email())
  OR auth_role() = 'etudiant'
);
CREATE POLICY candidatures_write ON candidatures FOR ALL USING (is_admin() OR is_responsable_or_admin()) WITH CHECK (is_admin() OR is_responsable_or_admin());

-- Notes
CREATE POLICY notes_select ON notes FOR SELECT USING (
  is_admin() OR is_responsable_or_admin()
  OR etudiant_id = current_etudiant_id()
  OR (auth_role() = 'enseignant' AND classe_id IS NOT NULL AND enseignant_has_classe(classe_id))
);
CREATE POLICY notes_insert ON notes FOR INSERT WITH CHECK (
  is_admin() OR (auth_role() = 'enseignant' AND classe_id IS NOT NULL AND enseignant_has_classe(classe_id))
);
CREATE POLICY notes_update ON notes FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY notes_delete ON notes FOR DELETE USING (is_admin());

-- Absences
CREATE POLICY absences_select ON absences FOR SELECT USING (
  is_admin() OR is_responsable_or_admin()
  OR etudiant_id = current_etudiant_id()
  OR (auth_role() = 'enseignant' AND classe_id IS NOT NULL AND enseignant_has_classe(classe_id))
);
CREATE POLICY absences_write ON absences FOR ALL USING (is_admin() OR is_responsable_or_admin()) WITH CHECK (is_admin() OR is_responsable_or_admin());

-- Alertes
CREATE POLICY alertes_select ON alertes FOR SELECT USING (is_staff());
CREATE POLICY alertes_write ON alertes FOR ALL USING (is_admin() OR is_responsable_or_admin() OR auth_role() = 'enseignant') WITH CHECK (is_staff());

-- Audit log
CREATE POLICY audit_select ON audit_log FOR SELECT USING (is_admin() OR auth_role() = 'responsable');
CREATE POLICY audit_insert ON audit_log FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Rapports
CREATE POLICY rapports_select ON rapports FOR SELECT USING (is_responsable_or_admin());
CREATE POLICY rapports_write ON rapports FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Dashboard charts
CREATE POLICY dashboard_charts_select ON dashboard_charts FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY dashboard_charts_write ON dashboard_charts FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Parametres
CREATE POLICY parametres_select ON parametres FOR SELECT USING (is_admin());
CREATE POLICY parametres_write ON parametres FOR ALL USING (is_admin()) WITH CHECK (is_admin());
