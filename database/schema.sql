-- ============================================================
-- SMART SMOE IFDL — PostgreSQL Schema Complet
-- Université Hassan 1er · ESEF Berrechid · Master IFDL
-- ISO 21001 — Version 1.0.0
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE user_role AS ENUM (
  'admin', 'responsable_qualite', 'coordonnateur',
  'enseignant', 'personnel_admin', 'etudiant', 'auditeur'
);

CREATE TYPE document_status AS ENUM (
  'brouillon', 'en_revision', 'approuve', 'publie', 'archive', 'obsolete'
);

CREATE TYPE document_type AS ENUM (
  'manuel_qualite', 'procedure', 'fiche_processus',
  'formulaire', 'rapport', 'charte', 'politique', 'autre'
);

CREATE TYPE process_type AS ENUM (
  'pilotage', 'realisation', 'support', 'evaluation'
);

CREATE TYPE risk_level AS ENUM ('faible', 'modere', 'eleve', 'critique');
CREATE TYPE risk_status AS ENUM ('identifie', 'analyse', 'traite', 'surveille', 'clos');

CREATE TYPE kpi_status AS ENUM ('vert', 'orange', 'rouge');
CREATE TYPE kpi_frequency AS ENUM ('journalier', 'hebdomadaire', 'mensuel', 'trimestriel', 'annuel', 'semestriel');

CREATE TYPE audit_type AS ENUM ('interne', 'externe', 'certification', 'surveillance');
CREATE TYPE audit_status AS ENUM ('planifie', 'en_cours', 'termine', 'annule', 'reporte');

CREATE TYPE finding_type AS ENUM ('non_conformite', 'observation', 'point_amelioration', 'bonne_pratique');
CREATE TYPE finding_severity AS ENUM ('mineure', 'majeure', 'critique');

CREATE TYPE action_status AS ENUM ('ouverte', 'en_cours', 'verifiee', 'cloturee', 'annulee');
CREATE TYPE action_priority AS ENUM ('basse', 'normale', 'haute', 'urgente');

CREATE TYPE complaint_type AS ENUM ('reclamation', 'recours', 'suggestion', 'appel');
CREATE TYPE complaint_status AS ENUM ('deposee', 'en_cours', 'resolue', 'cloturee', 'rejetee');

CREATE TYPE survey_status AS ENUM ('brouillon', 'actif', 'clos', 'archive');
CREATE TYPE survey_target AS ENUM ('etudiant', 'enseignant', 'employeur', 'laureat', 'all');

CREATE TYPE notif_type AS ENUM ('info', 'warning', 'success', 'error', 'task');

-- ============================================================
-- TABLE: roles
-- ============================================================
CREATE TABLE roles (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        user_role NOT NULL UNIQUE,
  label       VARCHAR(100) NOT NULL,
  permissions JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: users
-- ============================================================
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  matricule       VARCHAR(20) UNIQUE,
  nom             VARCHAR(100) NOT NULL,
  prenom          VARCHAR(100) NOT NULL,
  email           VARCHAR(255) NOT NULL UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,
  role            user_role NOT NULL DEFAULT 'etudiant',
  role_id         UUID REFERENCES roles(id),
  avatar_url      TEXT,
  telephone       VARCHAR(20),
  departement     VARCHAR(100),
  poste           VARCHAR(100),
  is_active       BOOLEAN DEFAULT TRUE,
  email_verified  BOOLEAN DEFAULT FALSE,
  last_login      TIMESTAMPTZ,
  refresh_token   TEXT,
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMPTZ,
  preferences     JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- ============================================================
-- TABLE: processes
-- ============================================================
CREATE TABLE processes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code            VARCHAR(10) NOT NULL UNIQUE, -- PR-01, PR-02...
  nom             VARCHAR(200) NOT NULL,
  type            process_type NOT NULL,
  objectif        TEXT,
  description     TEXT,
  entrees         TEXT[],
  sorties         TEXT[],
  ressources      TEXT[],
  indicateurs     TEXT[],
  pilote_id       UUID REFERENCES users(id),
  responsable_id  UUID REFERENCES users(id),
  bpmn_xml        TEXT,
  statut          VARCHAR(50) DEFAULT 'actif',
  version         VARCHAR(10) DEFAULT '1.0',
  date_revision   DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: documents
-- ============================================================
CREATE TABLE documents (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference       VARCHAR(50) NOT NULL UNIQUE,
  titre           VARCHAR(300) NOT NULL,
  type            document_type NOT NULL,
  statut          document_status NOT NULL DEFAULT 'brouillon',
  version         VARCHAR(10) NOT NULL DEFAULT '1.0',
  description     TEXT,
  contenu         TEXT,
  file_url        TEXT,
  file_size       BIGINT,
  file_type       VARCHAR(50),
  tags            TEXT[],
  process_id      UUID REFERENCES processes(id),
  redacteur_id    UUID REFERENCES users(id),
  verificateur_id UUID REFERENCES users(id),
  approbateur_id  UUID REFERENCES users(id),
  date_creation   DATE,
  date_approbation DATE,
  date_revision   DATE,
  date_peremption DATE,
  historique      JSONB DEFAULT '[]',
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documents_type ON documents(type);
CREATE INDEX idx_documents_statut ON documents(statut);
CREATE INDEX idx_documents_process ON documents(process_id);

-- ============================================================
-- TABLE: kpis
-- ============================================================
CREATE TABLE kpis (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code            VARCHAR(20) NOT NULL UNIQUE,
  libelle         VARCHAR(300) NOT NULL,
  description     TEXT,
  unite           VARCHAR(50),
  formule         TEXT,
  type            VARCHAR(50), -- taux, nombre, indice, score
  frequence       kpi_frequency NOT NULL DEFAULT 'mensuel',
  valeur_cible    NUMERIC(10,2),
  seuil_alerte    NUMERIC(10,2),
  seuil_critique  NUMERIC(10,2),
  valeur_actuelle NUMERIC(10,2),
  statut          kpi_status DEFAULT 'vert',
  process_id      UUID REFERENCES processes(id),
  responsable_id  UUID REFERENCES users(id),
  axe_strategique VARCHAR(100),
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: kpi_mesures (historical values)
-- ============================================================
CREATE TABLE kpi_mesures (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kpi_id      UUID NOT NULL REFERENCES kpis(id) ON DELETE CASCADE,
  valeur      NUMERIC(10,2) NOT NULL,
  periode     DATE NOT NULL,
  statut      kpi_status,
  commentaire TEXT,
  saisie_par  UUID REFERENCES users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kpi_mesures_kpi ON kpi_mesures(kpi_id);
CREATE INDEX idx_kpi_mesures_periode ON kpi_mesures(periode);

-- ============================================================
-- TABLE: risks
-- ============================================================
CREATE TABLE risks (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code            VARCHAR(20) NOT NULL UNIQUE,
  titre           VARCHAR(300) NOT NULL,
  description     TEXT,
  categorie       VARCHAR(100), -- strategique, operationnel, financier, ...
  type            VARCHAR(50) DEFAULT 'risque', -- risque, opportunite
  probabilite     SMALLINT CHECK (probabilite BETWEEN 1 AND 5),
  gravite         SMALLINT CHECK (gravite BETWEEN 1 AND 5),
  detection       SMALLINT CHECK (detection BETWEEN 1 AND 5),
  criticite       SMALLINT GENERATED ALWAYS AS (probabilite * gravite) STORED,
  niveau          risk_level,
  statut          risk_status NOT NULL DEFAULT 'identifie',
  process_id      UUID REFERENCES processes(id),
  owner_id        UUID REFERENCES users(id),
  causes          TEXT[],
  consequences    TEXT[],
  mesures_actuelles TEXT,
  plan_traitement TEXT,
  date_identification DATE DEFAULT CURRENT_DATE,
  date_revision   DATE,
  date_cloture    DATE,
  residual_probability SMALLINT,
  residual_gravity SMALLINT,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_risks_statut ON risks(statut);
CREATE INDEX idx_risks_niveau ON risks(niveau);
CREATE INDEX idx_risks_process ON risks(process_id);

-- ============================================================
-- TABLE: audits
-- ============================================================
CREATE TABLE audits (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference       VARCHAR(50) NOT NULL UNIQUE,
  titre           VARCHAR(300) NOT NULL,
  type            audit_type NOT NULL DEFAULT 'interne',
  statut          audit_status NOT NULL DEFAULT 'planifie',
  objectif        TEXT,
  perimetre       TEXT[],
  criteres        TEXT[],
  date_prevue     DATE,
  date_debut      DATE,
  date_fin        DATE,
  responsable_id  UUID REFERENCES users(id),
  auditeurs       UUID[],
  audites         UUID[],
  process_ids     UUID[],
  checklist_data  JSONB DEFAULT '{}',
  observations    TEXT,
  conclusion      TEXT,
  rapport_url     TEXT,
  score_conformite NUMERIC(5,2),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audits_statut ON audits(statut);
CREATE INDEX idx_audits_type ON audits(type);

-- ============================================================
-- TABLE: findings (constats d'audit)
-- ============================================================
CREATE TABLE findings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference       VARCHAR(50) NOT NULL UNIQUE,
  type            finding_type NOT NULL,
  severite        finding_severity,
  titre           VARCHAR(300) NOT NULL,
  description     TEXT NOT NULL,
  evidence        TEXT,
  exigence_iso    VARCHAR(50), -- clause ISO 21001
  audit_id        UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  process_id      UUID REFERENCES processes(id),
  responsable_id  UUID REFERENCES users(id),
  statut          action_status DEFAULT 'ouverte',
  date_constat    DATE DEFAULT CURRENT_DATE,
  date_echeance   DATE,
  date_cloture    DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: corrective_actions
-- ============================================================
CREATE TABLE corrective_actions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference       VARCHAR(50) NOT NULL UNIQUE,
  titre           VARCHAR(300) NOT NULL,
  description     TEXT NOT NULL,
  type            VARCHAR(50) DEFAULT 'corrective', -- corrective, preventive, amelioration
  priorite        action_priority NOT NULL DEFAULT 'normale',
  statut          action_status NOT NULL DEFAULT 'ouverte',
  cause_racine    TEXT,
  analyse_5why    JSONB DEFAULT '{}',
  analyse_ishikawa JSONB DEFAULT '{}',
  finding_id      UUID REFERENCES findings(id),
  risk_id         UUID REFERENCES risks(id),
  responsable_id  UUID NOT NULL REFERENCES users(id),
  verificateur_id UUID REFERENCES users(id),
  process_id      UUID REFERENCES processes(id),
  avancement      SMALLINT DEFAULT 0 CHECK (avancement BETWEEN 0 AND 100),
  date_ouverture  DATE DEFAULT CURRENT_DATE,
  date_echeance   DATE,
  date_realisation DATE,
  date_verification DATE,
  date_cloture    DATE,
  ressources      TEXT,
  cout_estime     NUMERIC(10,2),
  efficacite      TEXT,
  pieces_jointes  TEXT[],
  historique      JSONB DEFAULT '[]',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: complaints
-- ============================================================
CREATE TABLE complaints (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference       VARCHAR(50) NOT NULL UNIQUE,
  type            complaint_type NOT NULL DEFAULT 'reclamation',
  objet           VARCHAR(300) NOT NULL,
  description     TEXT NOT NULL,
  statut          complaint_status NOT NULL DEFAULT 'deposee',
  priorite        action_priority DEFAULT 'normale',
  declarant_id    UUID REFERENCES users(id),
  declarant_nom   VARCHAR(200), -- si anonyme
  declarant_email VARCHAR(255),
  traitement_id   UUID REFERENCES users(id),
  process_id      UUID REFERENCES processes(id),
  reponse         TEXT,
  satisfaction_note SMALLINT CHECK (satisfaction_note BETWEEN 1 AND 5),
  pieces_jointes  TEXT[],
  is_anonymous    BOOLEAN DEFAULT FALSE,
  date_depot      DATE DEFAULT CURRENT_DATE,
  date_traitement DATE,
  date_cloture    DATE,
  delai_traitement INT, -- jours
  historique      JSONB DEFAULT '[]',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: satisfaction_surveys
-- ============================================================
CREATE TABLE satisfaction_surveys (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titre           VARCHAR(300) NOT NULL,
  description     TEXT,
  cible           survey_target NOT NULL,
  statut          survey_status NOT NULL DEFAULT 'brouillon',
  questions       JSONB NOT NULL DEFAULT '[]',
  periode_debut   DATE,
  periode_fin     DATE,
  created_by      UUID REFERENCES users(id),
  google_form_url TEXT,
  resultats       JSONB DEFAULT '{}',
  score_moyen     NUMERIC(4,2),
  nb_reponses     INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: survey_responses
-- ============================================================
CREATE TABLE survey_responses (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  survey_id       UUID NOT NULL REFERENCES satisfaction_surveys(id) ON DELETE CASCADE,
  respondent_id   UUID REFERENCES users(id),
  reponses        JSONB NOT NULL,
  score           NUMERIC(4,2),
  commentaire     TEXT,
  is_anonymous    BOOLEAN DEFAULT FALSE,
  submitted_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: trainings
-- ============================================================
CREATE TABLE trainings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code            VARCHAR(20) UNIQUE,
  titre           VARCHAR(300) NOT NULL,
  type            VARCHAR(100), -- interne, externe, e-learning, ...
  objectifs       TEXT[],
  contenu         TEXT,
  duree_heures    NUMERIC(6,2),
  cout            NUMERIC(10,2),
  organisme       VARCHAR(200),
  formateur       VARCHAR(200),
  date_debut      DATE,
  date_fin        DATE,
  lieu            VARCHAR(200),
  statut          VARCHAR(50) DEFAULT 'planifie',
  nb_places       INT,
  inscrits        UUID[],
  responsable_id  UUID REFERENCES users(id),
  evaluation_url  TEXT,
  score_moyen     NUMERIC(4,2),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: competencies
-- ============================================================
CREATE TABLE competencies (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code            VARCHAR(20) UNIQUE,
  nom             VARCHAR(200) NOT NULL,
  description     TEXT,
  categorie       VARCHAR(100),
  niveau_requis   SMALLINT DEFAULT 3 CHECK (niveau_requis BETWEEN 1 AND 5),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: user_competencies (matrice)
-- ============================================================
CREATE TABLE user_competencies (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  competency_id   UUID NOT NULL REFERENCES competencies(id),
  niveau_actuel   SMALLINT CHECK (niveau_actuel BETWEEN 0 AND 5),
  niveau_cible    SMALLINT CHECK (niveau_cible BETWEEN 1 AND 5),
  date_evaluation DATE DEFAULT CURRENT_DATE,
  evaluateur_id   UUID REFERENCES users(id),
  commentaire     TEXT,
  UNIQUE(user_id, competency_id)
);

-- ============================================================
-- TABLE: reports
-- ============================================================
CREATE TABLE reports (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titre           VARCHAR(300) NOT NULL,
  type            VARCHAR(100) NOT NULL, -- revue_direction, audit, kpi, satisfaction, ...
  periode         VARCHAR(50),
  annee           INT,
  contenu         JSONB NOT NULL DEFAULT '{}',
  file_url        TEXT,
  statut          VARCHAR(50) DEFAULT 'brouillon',
  generated_by    UUID REFERENCES users(id),
  generated_at    TIMESTAMPTZ DEFAULT NOW(),
  approved_by     UUID REFERENCES users(id),
  approved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: notifications
-- ============================================================
CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type            notif_type NOT NULL DEFAULT 'info',
  titre           VARCHAR(200) NOT NULL,
  message         TEXT NOT NULL,
  recipient_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_id       UUID REFERENCES users(id),
  entity_type     VARCHAR(50), -- audit, risk, action, complaint ...
  entity_id       UUID,
  link            TEXT,
  is_read         BOOLEAN DEFAULT FALSE,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- ============================================================
-- TABLE: audit_trail (log complet)
-- ============================================================
CREATE TABLE audit_trail (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id),
  action      VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id   UUID,
  old_data    JSONB,
  new_data    JSONB,
  ip_address  INET,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_trail_user ON audit_trail(user_id);
CREATE INDEX idx_audit_trail_entity ON audit_trail(entity_type, entity_id);
CREATE INDEX idx_audit_trail_date ON audit_trail(created_at);

-- ============================================================
-- TABLE: iso_clauses (référentiel ISO 21001)
-- ============================================================
CREATE TABLE iso_clauses (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code            VARCHAR(20) NOT NULL UNIQUE, -- 4.1, 5.1, 6.1...
  titre           VARCHAR(300) NOT NULL,
  description     TEXT,
  parent_code     VARCHAR(20),
  niveau          SMALLINT DEFAULT 1,
  exigences       TEXT[],
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: maturity_assessments
-- ============================================================
CREATE TABLE maturity_assessments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titre           VARCHAR(200) NOT NULL,
  annee           INT NOT NULL,
  periode         VARCHAR(50),
  scores          JSONB NOT NULL DEFAULT '{}', -- { clause_code: score }
  score_global    NUMERIC(4,2),
  niveau_maturite VARCHAR(50), -- initial, defini, maitrise, optimise
  commentaires    JSONB DEFAULT '{}',
  realise_par     UUID REFERENCES users(id),
  valide_par      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Roles
INSERT INTO roles (name, label, permissions) VALUES
('admin', 'Administrateur SMOE', '{"all": true}'),
('responsable_qualite', 'Responsable Qualité', '{"dashboard":true,"kpi":true,"risks":true,"audits":true,"findings":true,"actions":true,"documents":true,"reports":true,"iso_center":true}'),
('coordonnateur', 'Coordonnateur Master', '{"dashboard":true,"processes":true,"kpi":true,"documents":true,"reports":true,"satisfaction":true}'),
('enseignant', 'Enseignant', '{"dashboard":true,"documents":["read"],"kpi":["read"],"complaints":["create","read"],"satisfaction":["respond"]}'),
('personnel_admin', 'Personnel Administratif', '{"dashboard":true,"documents":true,"complaints":true,"notifications":true}'),
('etudiant', 'Étudiant', '{"dashboard":["read"],"complaints":["create","read"],"satisfaction":["respond"],"documents":["read"]}'),
('auditeur', 'Auditeur Interne', '{"dashboard":true,"audits":true,"findings":true,"documents":["read"],"processes":["read"]}');

-- Processus SMOE
INSERT INTO processes (code, nom, type, objectif, description) VALUES
('PR-01', 'Pilotage Stratégique', 'pilotage', 'Définir et piloter la stratégie et les orientations du Master IFDL', 'Processus de direction et gouvernance du SMOE, revue de direction, planification stratégique'),
('PR-02', 'Réalisation Pédagogique', 'realisation', 'Assurer la qualité des enseignements et de la formation', 'Conception, délivrance et évaluation des formations du Master IFDL'),
('PR-03', 'Support et Ressources', 'support', 'Gérer les ressources humaines, matérielles et numériques', 'Gestion RH, infrastructure, LMS Moodle, bibliothèque, systèmes d information'),
('PR-04', 'Évaluation et Amélioration Continue', 'evaluation', 'Mesurer les performances et améliorer en continu le SMOE', 'Audits internes, gestion des NC, actions correctives, satisfaction, indicateurs');

-- KPIs initiaux
INSERT INTO kpis (code, libelle, unite, frequence, valeur_cible, seuil_alerte, type, process_id)
SELECT k.code, k.libelle, k.unite, k.frequence::kpi_frequency, k.cible, k.alerte, k.type, p.id
FROM (VALUES
  ('KPI-01', 'Taux de satisfaction des étudiants', '%', 'semestriel', 80.0, 70.0, 'taux'),
  ('KPI-02', 'Taux de réussite aux examens', '%', 'semestriel', 85.0, 75.0, 'taux'),
  ('KPI-03', 'Taux de diplomation', '%', 'annuel', 90.0, 80.0, 'taux'),
  ('KPI-04', 'Taux d insertion professionnelle', '%', 'annuel', 75.0, 65.0, 'taux'),
  ('KPI-05', 'Disponibilité plateforme Moodle', '%', 'mensuel', 99.0, 95.0, 'taux'),
  ('KPI-06', 'Délai moyen traitement réclamations', 'jours', 'mensuel', 10.0, 15.0, 'nombre'),
  ('KPI-07', 'Taux de traitement des NC', '%', 'trimestriel', 95.0, 85.0, 'taux'),
  ('KPI-08', 'Taux de satisfaction des enseignants', '%', 'annuel', 78.0, 68.0, 'taux'),
  ('KPI-09', 'Nombre de publications scientifiques', 'nb', 'annuel', 10.0, 5.0, 'nombre'),
  ('KPI-10', 'Score conformité ISO 21001', '%', 'semestriel', 85.0, 70.0, 'score')
) AS k(code, libelle, unite, frequence, cible, alerte, type)
CROSS JOIN (SELECT id FROM processes WHERE code = 'PR-04' LIMIT 1) p;

-- ISO 21001 Clauses
INSERT INTO iso_clauses (code, titre, niveau) VALUES
('4', 'Contexte de l organisme', 1),
('4.1', 'Compréhension de l organisme et de son contexte', 2),
('4.2', 'Compréhension des besoins et attentes des parties intéressées', 2),
('4.3', 'Détermination du domaine d application du SMOE', 2),
('4.4', 'Système de management des organismes d éducation', 2),
('5', 'Leadership', 1),
('5.1', 'Leadership et engagement', 2),
('5.2', 'Politique qualité', 2),
('5.3', 'Rôles, responsabilités et autorités', 2),
('6', 'Planification', 1),
('6.1', 'Actions face aux risques et opportunités', 2),
('6.2', 'Objectifs qualité et planification', 2),
('6.3', 'Planification des modifications', 2),
('7', 'Support', 1),
('7.1', 'Ressources', 2),
('7.2', 'Compétences', 2),
('7.3', 'Sensibilisation', 2),
('7.4', 'Communication', 2),
('7.5', 'Informations documentées', 2),
('8', 'Réalisation des activités opérationnelles', 1),
('8.1', 'Planification et maîtrise opérationnelles', 2),
('8.2', 'Conception et développement', 2),
('8.3', 'Prestataires externes', 2),
('9', 'Évaluation des performances', 1),
('9.1', 'Surveillance, mesure, analyse et évaluation', 2),
('9.2', 'Audit interne', 2),
('9.3', 'Revue de direction', 2),
('10', 'Amélioration', 1),
('10.1', 'Non-conformités et actions correctives', 2),
('10.2', 'Amélioration continue', 2),
('10.3', 'Amélioration continue du SMOE', 2);

-- Admin user (password: Admin@SMOE2024)
INSERT INTO users (matricule, nom, prenom, email, password_hash, role, is_active, email_verified)
VALUES (
  'ADM-001',
  'Administrateur',
  'SMOE',
  'admin@smoe-ifdl.ma',
  crypt('Admin@SMOE2024', gen_salt('bf')),
  'admin',
  TRUE,
  TRUE
);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all main tables
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'users','processes','documents','kpis','risks','audits',
    'findings','corrective_actions','complaints','satisfaction_surveys',
    'trainings','reports'
  ]
  LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_%s_updated_at BEFORE UPDATE ON %s
       FOR EACH ROW EXECUTE FUNCTION update_updated_at()', t, t
    );
  END LOOP;
END;
$$;

-- Auto calculate risk level
CREATE OR REPLACE FUNCTION calculate_risk_level()
RETURNS TRIGGER AS $$
BEGIN
  NEW.niveau = CASE
    WHEN NEW.criticite >= 20 THEN 'critique'::risk_level
    WHEN NEW.criticite >= 12 THEN 'eleve'::risk_level
    WHEN NEW.criticite >= 6  THEN 'modere'::risk_level
    ELSE 'faible'::risk_level
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_risk_level
BEFORE INSERT OR UPDATE ON risks
FOR EACH ROW EXECUTE FUNCTION calculate_risk_level();

-- Auto update KPI status
CREATE OR REPLACE FUNCTION update_kpi_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.valeur_actuelle IS NOT NULL THEN
    NEW.statut = CASE
      WHEN NEW.valeur_actuelle >= NEW.valeur_cible THEN 'vert'::kpi_status
      WHEN NEW.seuil_alerte IS NOT NULL AND NEW.valeur_actuelle >= NEW.seuil_alerte THEN 'orange'::kpi_status
      ELSE 'rouge'::kpi_status
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_kpi_status
BEFORE INSERT OR UPDATE ON kpis
FOR EACH ROW EXECUTE FUNCTION update_kpi_status();

-- ============================================================
-- VIEWS
-- ============================================================

CREATE VIEW v_dashboard_summary AS
SELECT
  (SELECT COUNT(*) FROM kpis WHERE statut = 'rouge' AND is_active) AS kpi_rouge,
  (SELECT COUNT(*) FROM kpis WHERE statut = 'orange' AND is_active) AS kpi_orange,
  (SELECT COUNT(*) FROM kpis WHERE statut = 'vert' AND is_active) AS kpi_vert,
  (SELECT COUNT(*) FROM risks WHERE statut NOT IN ('clos') AND niveau IN ('eleve','critique')) AS risques_critiques,
  (SELECT COUNT(*) FROM audits WHERE statut IN ('planifie','en_cours')) AS audits_en_cours,
  (SELECT COUNT(*) FROM corrective_actions WHERE statut IN ('ouverte','en_cours')) AS actions_ouvertes,
  (SELECT COUNT(*) FROM complaints WHERE statut IN ('deposee','en_cours')) AS reclamations_actives,
  (SELECT ROUND(AVG(score_moyen),1) FROM satisfaction_surveys WHERE statut = 'clos') AS satisfaction_moyenne,
  (SELECT COUNT(*) FROM users WHERE is_active) AS utilisateurs_actifs;

CREATE VIEW v_kpi_dashboard AS
SELECT
  k.id, k.code, k.libelle, k.unite, k.valeur_cible,
  k.valeur_actuelle, k.statut, k.frequence, k.axe_strategique,
  p.code AS process_code, p.nom AS process_nom,
  u.nom AS responsable_nom, u.prenom AS responsable_prenom,
  ROUND(CASE WHEN k.valeur_cible > 0 THEN (k.valeur_actuelle / k.valeur_cible * 100) ELSE 0 END, 1) AS taux_realisation
FROM kpis k
LEFT JOIN processes p ON k.process_id = p.id
LEFT JOIN users u ON k.responsable_id = u.id
WHERE k.is_active = TRUE;

CREATE VIEW v_risk_matrix AS
SELECT
  r.id, r.code, r.titre, r.categorie, r.niveau,
  r.probabilite, r.gravite, r.criticite, r.statut,
  p.code AS process_code, p.nom AS process_nom,
  u.nom || ' ' || u.prenom AS owner_nom
FROM risks r
LEFT JOIN processes p ON r.process_id = p.id
LEFT JOIN users u ON r.owner_id = u.id
WHERE r.statut != 'clos';

-- ============================================================
-- INDEXES SUPPLÉMENTAIRES
-- ============================================================
CREATE INDEX idx_corrective_actions_statut ON corrective_actions(statut);
CREATE INDEX idx_corrective_actions_responsable ON corrective_actions(responsable_id);
CREATE INDEX idx_complaints_statut ON complaints(statut);
CREATE INDEX idx_findings_audit ON findings(audit_id);
CREATE INDEX idx_findings_statut ON findings(statut);
