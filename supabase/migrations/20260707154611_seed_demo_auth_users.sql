CREATE OR REPLACE FUNCTION public.seed_auth_user(
  p_email text,
  p_password text,
  p_nom text,
  p_prenom text,
  p_role app_role,
  p_legacy_id text,
  p_statut statut_compte DEFAULT 'Actif'
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  user_id uuid;
BEGIN
  SELECT id INTO user_id FROM auth.users WHERE email = p_email;

  IF user_id IS NULL THEN
    user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data, is_super_admin,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      p_email, crypt(p_password, gen_salt('bf')), NOW(), NOW(), NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('nom', p_nom, 'prenom', p_prenom, 'role', p_role::text),
      false, '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (
      gen_random_uuid(), user_id,
      jsonb_build_object('sub', user_id::text, 'email', p_email),
      'email', user_id::text, NOW(), NOW(), NOW()
    );
  ELSE
    UPDATE auth.users SET
      encrypted_password = crypt(p_password, gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      updated_at = NOW()
    WHERE id = user_id;
  END IF;

  INSERT INTO public.profiles (id, legacy_id, email, nom, prenom, role, statut)
  VALUES (user_id, p_legacy_id, p_email, p_nom, p_prenom, p_role, p_statut)
  ON CONFLICT (id) DO UPDATE SET
    legacy_id = EXCLUDED.legacy_id, email = EXCLUDED.email, nom = EXCLUDED.nom,
    prenom = EXCLUDED.prenom, role = EXCLUDED.role, statut = EXCLUDED.statut;

  RETURN user_id;
END;
$$;

DO $$
DECLARE uid uuid;
BEGIN
  uid := public.seed_auth_user('amadou.toure@esgic.ml', 'admin', 'Touré', 'Amadou', 'admin', 'U-1');
  uid := public.seed_auth_user('rokia.keita@esgic.ml', 'resp', 'Keïta', 'Rokia', 'responsable', 'U-2');
  uid := public.seed_auth_user('d.coulibaly@esgic.ml', 'ens', 'Coulibaly', 'Drissa', 'enseignant', 'U-3');
  UPDATE enseignants SET profile_id = uid, email = 'd.coulibaly@esgic.ml' WHERE legacy_id = 'ENS-1';
  uid := public.seed_auth_user('a.traore@esgic.ml', 'demo123', 'Traoré', 'Aminata', 'enseignant', 'U-4');
  UPDATE enseignants SET profile_id = uid, email = 'a.traore@esgic.ml' WHERE legacy_id = 'ENS-2';
  uid := public.seed_auth_user('moussa.diabate@etu.ml', 'etu', 'Diabaté', 'Moussa', 'etudiant', 'U-5');
  UPDATE etudiants SET profile_id = uid, email = 'moussa.diabate@etu.ml' WHERE legacy_id = 'ETU-1';
  uid := public.seed_auth_user('k.sangare@etu.ml', 'demo123', 'Sangaré', 'Korotoumou', 'etudiant', 'U-6');
  UPDATE etudiants SET profile_id = uid, email = 'k.sangare@etu.ml' WHERE legacy_id = 'ETU-5';
  uid := public.seed_auth_user('kadiatou.konate@email.ml', 'cand', 'Konaté', 'Kadiatou', 'candidat', 'U-7');
  uid := public.seed_auth_user('s.sidibe@esgic.ml', 'demo123', 'Sidibé', 'Salimata', 'enseignant', 'U-8', 'Désactivé');
  UPDATE enseignants SET profile_id = uid, email = 's.sidibe@esgic.ml' WHERE legacy_id = 'ENS-4';
END $$;
