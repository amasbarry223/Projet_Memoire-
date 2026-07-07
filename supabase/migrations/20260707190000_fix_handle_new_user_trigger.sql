-- handle_new_user() fait échouer toute création de compte (createUser /
-- inviteUserByEmail) avec "Database error creating new user" dès que
-- l'INSERT dans public.profiles lève la moindre exception (permissions,
-- RLS, contrainte...). Le seul appelant réel de ce trigger côté application
-- est /api/users, qui fait déjà un upsert explicite et complet juste après
-- via le client service-role — ce trigger n'est qu'un filet de sécurité et
-- ne doit jamais pouvoir bloquer la création du compte auth.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
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
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user: échec de la pré-création du profil pour %: %', NEW.id, SQLERRM;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
