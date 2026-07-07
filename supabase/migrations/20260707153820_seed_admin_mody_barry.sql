CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  user_id uuid := gen_random_uuid();
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'modybarry50@gmail.com') THEN
    SELECT id INTO user_id FROM auth.users WHERE email = 'modybarry50@gmail.com';
  ELSE
    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'modybarry50@gmail.com',
      crypt('77773034', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"nom":"Barry","prenom":"Mody","role":"admin"}'::jsonb,
      false,
      '',
      '',
      '',
      ''
    );

    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      user_id,
      jsonb_build_object('sub', user_id::text, 'email', 'modybarry50@gmail.com'),
      'email',
      user_id::text,
      NOW(),
      NOW(),
      NOW()
    );
  END IF;

  INSERT INTO public.profiles (id, legacy_id, email, nom, prenom, role, statut)
  VALUES (user_id, 'U-ADMIN-MODY', 'modybarry50@gmail.com', 'Barry', 'Mody', 'admin', 'Actif')
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    nom = EXCLUDED.nom,
    prenom = EXCLUDED.prenom,
    role = 'admin',
    statut = 'Actif',
    legacy_id = EXCLUDED.legacy_id;

  -- Mettre à jour le mot de passe si le compte existait déjà
  UPDATE auth.users
  SET encrypted_password = crypt('77773034', gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      updated_at = NOW()
  WHERE id = user_id;
END $$;
