-- Enums
CREATE TYPE app_role AS ENUM ('candidat','etudiant','enseignant','responsable','admin');
CREATE TYPE statut_dossier AS ENUM ('En attente','Validé','Incomplet','Rejeté');
CREATE TYPE statut_compte AS ENUM ('Actif','Désactivé');
CREATE TYPE statut_etudiant AS ENUM ('Actif','Suspendu');
CREATE TYPE statut_enseignant AS ENUM ('Actif','Congé');
CREATE TYPE niveau_alerte AS ENUM ('Élevé','Moyen','Faible');
CREATE TYPE statut_alerte AS ENUM ('Nouvelle','Prise en charge','Clôturée');
CREATE TYPE type_rapport AS ENUM ('Mensuel','Hebdomadaire','Trimestriel','Ponctuel');

-- Filieres
CREATE TABLE filieres (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id text UNIQUE,
  code text NOT NULL,
  nom text NOT NULL,
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id text UNIQUE,
  filiere_id uuid NOT NULL REFERENCES filieres(id) ON DELETE CASCADE,
  nom text NOT NULL,
  niveau text NOT NULL,
  effectif integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE matieres (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id text UNIQUE,
  filiere_id uuid NOT NULL REFERENCES filieres(id) ON DELETE CASCADE,
  nom text NOT NULL,
  coefficient numeric(4,1) NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  legacy_id text UNIQUE,
  email text NOT NULL UNIQUE,
  nom text NOT NULL,
  prenom text NOT NULL,
  role app_role NOT NULL DEFAULT 'candidat',
  statut statut_compte NOT NULL DEFAULT 'Actif',
  derniere_connexion timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE enseignants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id text UNIQUE,
  profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  nom text NOT NULL,
  prenom text NOT NULL,
  email text NOT NULL,
  statut statut_enseignant NOT NULL DEFAULT 'Actif',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE enseignant_matieres (
  enseignant_id uuid NOT NULL REFERENCES enseignants(id) ON DELETE CASCADE,
  matiere_id uuid NOT NULL REFERENCES matieres(id) ON DELETE CASCADE,
  PRIMARY KEY (enseignant_id, matiere_id)
);

CREATE TABLE enseignant_classes (
  enseignant_id uuid NOT NULL REFERENCES enseignants(id) ON DELETE CASCADE,
  classe_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  PRIMARY KEY (enseignant_id, classe_id)
);

CREATE TABLE etudiants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id text UNIQUE,
  profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  matricule text NOT NULL UNIQUE,
  nom text NOT NULL,
  prenom text NOT NULL,
  email text NOT NULL,
  classe_id uuid REFERENCES classes(id) ON DELETE SET NULL,
  moyenne numeric(4,1) NOT NULL DEFAULT 0,
  assiduite integer NOT NULL DEFAULT 100,
  statut statut_etudiant NOT NULL DEFAULT 'Actif',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE candidatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id text NOT NULL UNIQUE,
  nom text NOT NULL,
  prenom text NOT NULL,
  email text NOT NULL,
  telephone text NOT NULL DEFAULT '',
  date_naissance text NOT NULL DEFAULT '',
  adresse text NOT NULL DEFAULT '',
  filiere_id uuid REFERENCES filieres(id) ON DELETE SET NULL,
  filiere_nom text NOT NULL DEFAULT '',
  niveau text NOT NULL DEFAULT '',
  statut statut_dossier NOT NULL DEFAULT 'En attente',
  date_soumission timestamptz NOT NULL DEFAULT now(),
  pieces jsonb NOT NULL DEFAULT '[]'::jsonb,
  synthese_ia text NOT NULL DEFAULT '',
  completude integer NOT NULL DEFAULT 0,
  historique jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  etudiant_id uuid NOT NULL REFERENCES etudiants(id) ON DELETE CASCADE,
  matiere_id uuid REFERENCES matieres(id) ON DELETE SET NULL,
  matiere_nom text NOT NULL DEFAULT '',
  classe_id uuid REFERENCES classes(id) ON DELETE SET NULL,
  classe_nom text NOT NULL DEFAULT '',
  note numeric(5,2),
  sur numeric(5,2) NOT NULL DEFAULT 20,
  coefficient numeric(4,1) NOT NULL DEFAULT 1,
  periode text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE absences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  etudiant_id uuid NOT NULL REFERENCES etudiants(id) ON DELETE CASCADE,
  classe_id uuid REFERENCES classes(id) ON DELETE SET NULL,
  classe_nom text NOT NULL DEFAULT '',
  matiere text NOT NULL DEFAULT '',
  date_absence date NOT NULL,
  justifiee boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE alertes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id text UNIQUE,
  etudiant_id uuid NOT NULL REFERENCES etudiants(id) ON DELETE CASCADE,
  classe_nom text NOT NULL DEFAULT '',
  niveau niveau_alerte NOT NULL DEFAULT 'Moyen',
  motif text NOT NULL DEFAULT '',
  date_alerte timestamptz NOT NULL DEFAULT now(),
  statut statut_alerte NOT NULL DEFAULT 'Nouvelle',
  indicator_color text NOT NULL DEFAULT 'bg-orange-500',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id text UNIQUE,
  utilisateur text NOT NULL DEFAULT 'Système',
  action text NOT NULL,
  cible text NOT NULL DEFAULT '',
  details text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE rapports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id text UNIQUE,
  titre text NOT NULL,
  periode text NOT NULL DEFAULT '',
  date_generation timestamptz NOT NULL DEFAULT now(),
  type type_rapport NOT NULL DEFAULT 'Mensuel',
  taille text NOT NULL DEFAULT '',
  genere_par text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE dashboard_charts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  data jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE parametres (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_candidatures_statut ON candidatures(statut);
CREATE INDEX idx_candidatures_email ON candidatures(email);
CREATE INDEX idx_alertes_statut ON alertes(statut);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX idx_etudiants_classe_id ON etudiants(classe_id);
CREATE INDEX idx_notes_etudiant_id ON notes(etudiant_id);
CREATE INDEX idx_absences_etudiant_id ON absences(etudiant_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_filieres_updated BEFORE UPDATE ON filieres FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_classes_updated BEFORE UPDATE ON classes FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_matieres_updated BEFORE UPDATE ON matieres FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_profiles_updated BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_enseignants_updated BEFORE UPDATE ON enseignants FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_etudiants_updated BEFORE UPDATE ON etudiants FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_candidatures_updated BEFORE UPDATE ON candidatures FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_notes_updated BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_absences_updated BEFORE UPDATE ON absences FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_alertes_updated BEFORE UPDATE ON alertes FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_rapports_updated BEFORE UPDATE ON rapports FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_dashboard_charts_updated BEFORE UPDATE ON dashboard_charts FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_parametres_updated BEFORE UPDATE ON parametres FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Auto-create profile on auth user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nom, prenom, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nom', ''),
    COALESCE(NEW.raw_user_meta_data->>'prenom', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'candidat')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Audit helper
CREATE OR REPLACE FUNCTION log_audit(p_action text, p_cible text, p_details text)
RETURNS void AS $$
DECLARE
  v_user text;
BEGIN
  SELECT COALESCE(prenom || ' ' || nom, 'Système') INTO v_user
  FROM profiles WHERE id = auth.uid();
  IF v_user IS NULL THEN v_user := 'Système'; END IF;
  INSERT INTO audit_log (utilisateur, action, cible, details)
  VALUES (v_user, p_action, p_cible, p_details);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
