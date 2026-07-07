INSERT INTO audit_log (legacy_id, utilisateur, action, cible, details, created_at) VALUES
('AUD-024', 'Amadou Touré', 'Validation dossier', 'CAND-2024-047', 'Dossier validé — statut passé à « Validé »', '2024-11-01 08:15:00+00'),
('AUD-023', 'Amadou Touré', 'Marquage incomplet', 'CAND-2024-046', 'Pièces manquantes : Relevé L2, Lettre de motivation', '2024-10-30 16:45:00+00'),
('AUD-022', 'Amadou Touré', 'Rejet dossier', 'CAND-2024-045', 'Motif : profil inadapté à la filière', '2024-10-30 09:00:00+00'),
('AUD-021', 'Rokia Keïta', 'Clôture alerte', 'ALT-006', 'Élève suivi, situation régularisée', '2024-10-29 14:30:00+00'),
('AUD-020', 'Drissa Coulibaly', 'Saisie de notes', 'BTS SIO 2 — Dév. Web', '8 notes saisies pour le semestre 1', '2024-10-28 11:20:00+00'),
('AUD-019', 'Amadou Touré', 'Modification rôle', 'U-7 (Kadiatou Konaté)', 'Rôle « candidat » → « étudiant »', '2024-10-27 15:45:00+00'),
('AUD-018', 'Rokia Keïta', 'Création compte', 'U-3 (Drissa Coulibaly)', 'Compte enseignant créé', '2024-10-26 10:10:00+00'),
('AUD-017', 'Amadou Touré', 'Désactivation compte', 'U-8 (Salimata Sidibé)', 'Compte désactivé (congé)', '2024-10-25 17:30:00+00');

INSERT INTO rapports (legacy_id, titre, periode, date_generation, type, taille, genere_par) VALUES
('RAP-001', 'Rapport mensuel — Octobre 2024', 'Octobre 2024', '2024-11-01', 'Mensuel', '1.8 Mo', 'IA (Claude)'),
('RAP-002', 'Suivi pédagogique BTS SIO — S44', 'Semaine 44', '2024-10-31', 'Hebdomadaire', '0.6 Mo', 'IA (Claude)'),
('RAP-003', 'Bilan trimestriel — Q3 2024', 'Juillet–Septembre 2024', '2024-10-05', 'Trimestriel', '3.2 Mo', 'IA (Claude)'),
('RAP-004', 'Analyse des candidatures — Octobre', 'Octobre 2024', '2024-11-02', 'Ponctuel', '0.9 Mo', 'IA (Claude)'),
('RAP-005', 'Rapport d''assiduité global', 'Septembre–Octobre 2024', '2024-10-30', 'Ponctuel', '1.1 Mo', 'IA (Claude)');

INSERT INTO dashboard_charts (key, data) VALUES
('inscriptions', '[{"mois":"Jan","inscriptions":182},{"mois":"Fév","inscriptions":215},{"mois":"Mar","inscriptions":198},{"mois":"Avr","inscriptions":243},{"mois":"Mai","inscriptions":221},{"mois":"Juin","inscriptions":248}]'::jsonb),
('absenteisme', '[{"mois":"Jan","taux":8.2},{"mois":"Fév","taux":7.5},{"mois":"Mar","taux":9.1},{"mois":"Avr","taux":6.8},{"mois":"Mai","taux":7.2},{"mois":"Juin","taux":6.5}]'::jsonb);
