-- La policy actuelle `audit_insert ON audit_log FOR INSERT WITH CHECK
-- (auth.uid() IS NOT NULL)` permet à N'IMPORTE QUEL utilisateur authentifié
-- (candidat, étudiant...) d'insérer directement une ligne dans audit_log
-- avec un champ `utilisateur` totalement arbitraire — en contournant la
-- fonction log_audit() qui, elle, résout l'auteur de façon fiable depuis
-- auth.uid(). N'importe qui peut donc falsifier le journal d'audit et
-- usurper l'identité d'un admin, ce qui contredit l'objectif même du module
-- (R5 — traçabilité, non-répudiation).
--
-- Seule log_audit() (SECURITY DEFINER, exécutée avec les privilèges du
-- propriétaire de la fonction) doit pouvoir écrire dans cette table ; les
-- routes API utilisent de leur côté le client service_role, qui contourne
-- systématiquement la RLS. Aucun insert direct via un rôle authenticated
-- n'est donc légitime.
DROP POLICY IF EXISTS audit_insert ON audit_log;
CREATE POLICY audit_insert ON audit_log FOR INSERT WITH CHECK (false);
