# Cahier des Charges — Interface Web de Gestion des Inscriptions et du Suivi Pédagogique

**Projet :** Automatisation de la gestion des inscriptions et du suivi pédagogique avec n8n et l'IA
**Composant :** Interface web (frontend + contrôle d'accès basé sur les rôles — RBAC)
**Version :** 1.0
**Date :** Juillet 2026

---

## 1. Contexte et présentation du projet

### 1.1 Contexte

Les établissements d'enseignement gèrent encore souvent les inscriptions et le suivi pédagogique de manière manuelle (dossiers papier, fichiers Excel dispersés, échanges d'emails non tracés). Cela engendre des lenteurs de traitement, des erreurs de saisie, une absence de visibilité en temps réel et une détection tardive des étudiants en difficulté.

### 1.2 Objectif général

Concevoir et développer une interface web centralisée permettant :

- La soumission et le traitement dématérialisé des dossiers d'inscription ;
- Le suivi pédagogique des étudiants (notes, absences, alertes) ;
- Un accès différencié aux fonctionnalités selon le rôle de l'utilisateur (RBAC) ;
- L'interconnexion avec le moteur d'automatisation n8n et les services d'IA.

### 1.3 Périmètre du présent document

Ce cahier des charges couvre exclusivement l'interface web et son système d'authentification/autorisation. Les workflows n8n et les traitements IA font l'objet de spécifications séparées, mais leurs points d'intégration avec l'interface sont décrits ici.

---

## 2. Acteurs et rôles (RBAC)

Le système repose sur un contrôle d'accès basé sur les rôles (Role-Based Access Control). Chaque utilisateur authentifié se voit attribuer exactement un rôle, stocké dans la base de données et vérifié à la fois côté client (affichage conditionnel) et côté serveur (Row Level Security de Supabase — source de vérité).

### 2.1 Définition des rôles

| Rôle | Code | Description |
|---|---|---|
| Candidat | `candidat` | Personne externe soumettant un dossier d'inscription. Compte créé automatiquement lors de la soumission. |
| Étudiant | `etudiant` | Candidat dont le dossier a été validé. Accède à son propre suivi pédagogique. |
| Enseignant | `enseignant` | Saisit les notes et les absences pour les matières et classes qui lui sont affectées. |
| Responsable pédagogique | `responsable` | Supervise le suivi pédagogique, traite les alertes IA, consulte les rapports. |
| Administrateur | `admin` | Gère les dossiers d'inscription, les comptes utilisateurs, les filières et la configuration globale. |

### 2.2 Matrice des permissions

| Fonctionnalité | Candidat | Étudiant | Enseignant | Responsable | Admin |
|---|:---:|:---:|:---:|:---:|:---:|
| Soumettre un dossier d'inscription | ✅ | — | — | — | — |
| Consulter l'état de son propre dossier | ✅ | ✅ | — | — | ✅ |
| Compléter/modifier son dossier (si incomplet) | ✅ | — | — | — | — |
| Consulter ses propres notes et absences | — | ✅ | — | — | — |
| Consulter les notes/absences d'une classe | — | — | ✅ (ses classes) | ✅ | ✅ |
| Saisir/modifier des notes | — | — | ✅ (ses matières) | — | — |
| Saisir des absences | — | — | ✅ (ses classes) | ✅ | — |
| Consulter les alertes pédagogiques (IA) | — | — | ✅ (ses classes) | ✅ | ✅ |
| Traiter/clôturer une alerte | — | — | — | ✅ | ✅ |
| Valider/rejeter un dossier d'inscription | — | — | — | — | ✅ |
| Consulter les rapports et statistiques | — | — | — | ✅ | ✅ |
| Gérer les comptes utilisateurs et rôles | — | — | — | — | ✅ |
| Gérer les filières, classes et matières | — | — | — | — | ✅ |
| Consulter l'historique des communications | — | ✅ (les siennes) | — | ✅ | ✅ |

### 2.3 Règles d'autorisation

- **R1 :** Toute permission est vérifiée côté base de données via les politiques RLS de Supabase. L'interface ne fait que refléter ces droits ; elle ne constitue jamais la seule barrière.
- **R2 :** Un utilisateur ne peut pas modifier son propre rôle.
- **R3 :** Un enseignant n'accède qu'aux classes et matières qui lui sont affectées (table d'affectation `affectations`).
- **R4 :** Le passage du rôle `candidat` au rôle `etudiant` est effectué automatiquement (workflow n8n) lors de la validation du dossier par un administrateur.
- **R5 :** Toute action sensible (validation de dossier, modification de note, changement de rôle) est journalisée dans une table d'audit (`audit_log`) avec l'identifiant de l'auteur, l'horodatage et l'ancien/nouveau état.

---

## 3. Spécifications fonctionnelles

### 3.1 Module Authentification et gestion de session

- **F1.1 :** Inscription par email + mot de passe (Supabase Auth). Vérification de l'adresse email obligatoire avant accès.
- **F1.2 :** Connexion par email + mot de passe, avec récupération de mot de passe par email.
- **F1.3 :** Redirection automatique après connexion vers le tableau de bord correspondant au rôle de l'utilisateur.
- **F1.4 :** Déconnexion et expiration automatique de session (durée paramétrable, 24h par défaut).
- **F1.5 :** Protection de toutes les routes privées : un utilisateur non authentifié est redirigé vers la page de connexion ; un utilisateur authentifié accédant à une route hors de son rôle reçoit une page « Accès refusé » (403).

### 3.2 Module Inscription (espace candidat)

- **F2.1 :** Formulaire d'inscription public multi-étapes : (1) informations personnelles (nom, prénom, date de naissance, téléphone, email, adresse), (2) choix de la filière et du niveau, (3) téléversement des pièces justificatives (formats PDF/JPG/PNG, taille max 5 Mo par fichier), (4) récapitulatif et soumission.
- **F2.2 :** Validation des champs en temps réel (format email, téléphone, champs obligatoires).
- **F2.3 :** Stockage des pièces dans Supabase Storage, dans un dossier privé propre au candidat.
- **F2.4 :** À la soumission, le dossier prend le statut `en_attente` et un événement est émis vers n8n (webhook) pour déclencher l'analyse IA et l'email de confirmation.
- **F2.5 :** Page « Mon dossier » : le candidat visualise le statut de son dossier (`en_attente`, `incomplet`, `validé`, `rejeté`), les commentaires éventuels et peut téléverser les pièces manquantes si le statut est `incomplet`.

### 3.3 Module Gestion des candidatures (espace admin)

- **F3.1 :** Liste paginée et filtrable des candidatures (par statut, filière, date de soumission), avec recherche par nom/email.
- **F3.2 :** Fiche détaillée d'un dossier : informations du candidat, pièces justificatives consultables, synthèse d'analyse générée par l'IA (complétude, points d'attention), historique des actions.
- **F3.3 :** Actions sur un dossier : valider, rejeter (avec motif obligatoire), marquer incomplet (avec liste des pièces manquantes). Chaque action déclenche le workflow n8n de notification correspondant.
- **F3.4 :** Indicateurs en tête de page : nombre de dossiers par statut, délai moyen de traitement.

### 3.4 Module Suivi pédagogique

- **F4.1 (Enseignant) :** Saisie des notes par classe et par matière via une grille éditable ; saisie des absences par séance (liste de présence).
- **F4.2 (Étudiant) :** Consultation de ses notes par matière et par période, de son taux d'assiduité et de la moyenne de sa classe (anonymisée).
- **F4.3 (Responsable) :** Vue consolidée par classe : moyennes, taux d'absentéisme, distribution des notes.
- **F4.4 (Responsable/Enseignant) :** Tableau des alertes pédagogiques générées par l'IA (étudiant concerné, niveau de risque, justification, date), avec possibilité pour le responsable de marquer une alerte comme « prise en charge » ou « clôturée » en ajoutant un commentaire.

### 3.5 Module Rapports et statistiques

- **F5.1 :** Tableau de bord avec graphiques : évolution des inscriptions par mois, répartition par filière, moyennes générales par classe, taux d'absentéisme.
- **F5.2 :** Consultation des rapports mensuels rédigés automatiquement par l'IA (via n8n), avec export PDF.

### 3.6 Module Administration

- **F6.1 :** Gestion des utilisateurs : création de comptes enseignants/responsables, attribution et modification des rôles, désactivation de comptes.
- **F6.2 :** Gestion des référentiels : filières, niveaux, classes, matières, affectations enseignant↔classe/matière.
- **F6.3 :** Consultation du journal d'audit avec filtres (utilisateur, type d'action, période).

---

## 4. Spécifications techniques

### 4.1 Stack technique

| Couche | Technologie | Justification |
|---|---|---|
| Frontend | Next.js 14+ (App Router), React, TypeScript | Rendu hybride, intégration native Vercel, typage fort |
| Style | Tailwind CSS + composants shadcn/ui | Développement rapide, cohérence visuelle |
| Backend as a Service | Supabase (PostgreSQL, Auth, Storage, RLS) | Authentification intégrée, sécurité au niveau des données |
| Hébergement | Vercel | Déploiement continu depuis GitHub |
| Automatisation | n8n (local, exposé via tunnel en développement) | Orchestration des workflows |
| IA | API Claude (Anthropic) | Analyse de dossiers, détection de risque, synthèses |
| Outil de développement | Claude Code | Génération et itération assistées du code |

### 4.2 Architecture d'autorisation

- Les rôles sont stockés dans une table `profiles` (liée à `auth.users` de Supabase) contenant `user_id`, `role`, `nom`, `prenom`.
- Les politiques **RLS** sont définies sur chaque table métier. Exemples :
  - `notes` : SELECT autorisé si `auth.uid()` correspond à l'étudiant, ou si l'utilisateur est enseignant affecté à la matière, ou responsable/admin ; INSERT/UPDATE réservé à l'enseignant affecté.
  - `candidats` : SELECT/UPDATE par le candidat lui-même (statut incomplet uniquement) ou par un admin.
- Côté Next.js, un **middleware** vérifie la session et le rôle pour chaque groupe de routes (`/candidat/*`, `/etudiant/*`, `/enseignant/*`, `/responsable/*`, `/admin/*`).
- Les clés de service Supabase (service_role) ne sont **jamais** exposées côté client ; elles sont réservées aux Route Handlers serveur et à n8n.

### 4.3 Intégration avec n8n

- Émission d'événements via **Database Webhooks Supabase** (INSERT sur `candidats`, UPDATE de statut, INSERT sur `notes`/`absences`) vers les endpoints webhook n8n.
- En développement, n8n local est exposé via un tunnel (ngrok ou tunnel n8n) ; l'URL du webhook est stockée en variable d'environnement.
- n8n écrit en retour dans Supabase (statuts, alertes, historique de communications) via l'API Supabase avec une clé de service dédiée.

### 4.4 Exigences non fonctionnelles

- **Sécurité :** HTTPS obligatoire ; mots de passe hachés (géré par Supabase Auth) ; RLS activé sur 100 % des tables ; validation des entrées côté serveur ; limitation du débit sur le formulaire public (anti-spam).
- **Protection des données :** minimisation des données collectées ; les documents des candidats ne sont accessibles qu'aux rôles autorisés via des URL signées à durée limitée ; mention d'information sur l'usage de l'IA dans le traitement des dossiers.
- **Performance :** chargement initial des pages < 3 s ; pagination systématique des listes (> 20 éléments).
- **Compatibilité :** responsive (mobile, tablette, desktop) ; navigateurs récents (Chrome, Firefox, Edge, Safari).
- **Langue :** interface entièrement en français.
- **Disponibilité :** dépendante de Vercel et Supabase (offres gratuites acceptables pour le cadre du mémoire) ; tolérance à l'indisponibilité de n8n local (les événements manqués sont rattrapables par un workflow de polling de secours).

---

## 5. Parcours utilisateurs clés

1. **Candidat :** arrive sur la page publique → crée un compte → remplit le formulaire multi-étapes → téléverse ses pièces → reçoit un email de confirmation (n8n) → suit l'évolution de son dossier → devient étudiant après validation.
2. **Administrateur :** se connecte → consulte les nouveaux dossiers avec la pré-analyse IA → valide/rejette/demande un complément → le candidat est notifié automatiquement.
3. **Enseignant :** se connecte → sélectionne sa classe et sa matière → saisit notes et absences → les données alimentent l'analyse IA hebdomadaire.
4. **Responsable :** se connecte → consulte les alertes IA de la semaine → prend en charge les cas à risque → consulte le rapport mensuel.

---

## 6. Livrables et critères d'acceptation

### 6.1 Livrables

- Application web déployée sur Vercel avec les 5 espaces (candidat, étudiant, enseignant, responsable, admin) ;
- Schéma SQL Supabase complet avec politiques RLS et données de démonstration ;
- Documentation technique (architecture, variables d'environnement, procédure de déploiement) ;
- Jeu de comptes de test (un par rôle) pour la soutenance.

### 6.2 Critères d'acceptation (extraits)

- **CA1 :** Un utilisateur de rôle X ne peut accéder à aucune donnée ni action réservée à un rôle Y, y compris par appel direct à l'API (test de contournement RLS).
- **CA2 :** Une soumission de dossier déclenche en moins de 2 minutes l'email de confirmation via n8n.
- **CA3 :** Un dossier marqué « incomplet » redevient modifiable par le candidat, uniquement sur les pièces manquantes.
- **CA4 :** Une note saisie par un enseignant est immédiatement visible par l'étudiant concerné et par le responsable, et par personne d'autre.
- **CA5 :** Toute action sensible apparaît dans le journal d'audit avec son auteur et son horodatage.

---

## 7. Planning indicatif

| Phase | Contenu | Durée estimée |
|---|---|---|
| 1 | Schéma Supabase + politiques RLS + table des rôles | 1 semaine |
| 2 | Authentification, middleware de rôles, squelette des 5 espaces | 1 semaine |
| 3 | Module inscription (formulaire public + espace candidat) | 1–2 semaines |
| 4 | Module admin (gestion des candidatures) + intégration webhooks n8n | 1–2 semaines |
| 5 | Module suivi pédagogique (enseignant, étudiant, responsable) | 2 semaines |
| 6 | Rapports, alertes IA, journal d'audit, finitions | 1–2 semaines |
| 7 | Tests des permissions, données de démo, documentation | 1 semaine |
