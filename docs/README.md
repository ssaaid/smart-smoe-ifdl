# SMART SMOE IFDL — Documentation Technique Complète

> **Système Intelligent de Management des Organismes d'Éducation**  
> Master Ingénierie de la Formation et Digital Learning (IFDL)  
> ESEF Berrechid — Université Hassan 1er  
> **Version 1.0.0** · ISO 21001 · 2025–2026

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Architecture globale](#2-architecture-globale)
3. [Structure du projet](#3-structure-du-projet)
4. [Prérequis & Installation](#4-prérequis--installation)
5. [Variables d'environnement](#5-variables-denvironnement)
6. [Base de données](#6-base-de-données)
7. [Backend NestJS — API REST](#7-backend-nestjs--api-rest)
8. [Frontend Next.js](#8-frontend-nextjs)
9. [Déploiement Docker](#9-déploiement-docker)
10. [Guide utilisateur par rôle](#10-guide-utilisateur-par-rôle)
11. [Sécurité & Conformité](#11-sécurité--conformité)
12. [Maintenance](#12-maintenance)

---

## 1. Vue d'ensemble

SMART SMOE IFDL est une plateforme SaaS complète permettant la mise en œuvre, le pilotage et l'amélioration continue du Système de Management des Organismes d'Éducation selon la norme **ISO 21001:2018**.

### Fonctionnalités clés

| Module | Description |
|--------|-------------|
| **Dashboard exécutif** | Score qualité, KPI temps réel, alertes |
| **Gestion documentaire** | GED, versioning, workflow validation |
| **Processus SMOE** | PR-01 à PR-04, cartographie BPMN |
| **KPI & Indicateurs** | Tableau de bord, alertes, graphiques |
| **Gestion des risques** | Registre, matrice 5×5, heatmap |
| **Audits internes** | Programme, checklists ISO 21001, rapports |
| **Non-conformités** | Déclaration, 5 Pourquoi, Ishikawa |
| **Actions correctives** | Plan d'action, workflow, avancement |
| **Satisfaction** | Enquêtes, statistiques, NPS |
| **Réclamations** | Portail en ligne, workflow traitement |
| **Compétences** | Matrice, plan formation, certifications |
| **ISO 21001 Center** | Maturité, radar, GAP analysis |
| **Revue de direction** | Génération automatique, export PDF |
| **IA SMOE Assistant** | Chatbot ISO 21001, recherche intelligente |

---

## 2. Architecture globale

```
┌─────────────────────────────────────────────────────────────┐
│                    SMART SMOE IFDL                          │
├─────────────────────────────────────────────────────────────┤
│  CLIENTS                                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Web Browser  │  │ Mobile PWA   │  │ API Clients      │  │
│  │ Next.js 15   │  │ Responsive   │  │ Intégrations     │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
│         └─────────────────┴──────────────────┘            │
│                         HTTPS / JWT                        │
├─────────────────────────────────────────────────────────────┤
│  NGINX REVERSE PROXY (SSL Termination · Rate Limiting)      │
├─────────────────────────────────────────────────────────────┤
│  BACKEND — NestJS / Node.js                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  API Gateway · Auth (JWT/RBAC) · Validation          │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  Modules: Auth│Users│Dashboard│Processes│Documents   │   │
│  │           KPI│Risks│Audits│Findings│Actions          │   │
│  │           Complaints│Satisfaction│Trainings          │   │
│  │           Reports│Notifications│IsoCenter│AI         │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  DATA LAYER                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  PostgreSQL  │  │  Redis Cache │  │ Supabase Storage │  │
│  │  (Primary)   │  │  (Sessions)  │  │  (Documents)     │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  SERVICES EXTERNES                                          │
│  OpenAI API · SMTP Email · Google Forms · Moodle LMS       │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Structure du projet

```
smart-smoe-ifdl/
├── backend/                    # NestJS API
│   ├── src/
│   │   ├── auth/               # JWT · RBAC · Strategies
│   │   ├── users/              # Gestion utilisateurs
│   │   ├── dashboard/          # Agrégation données exécutives
│   │   ├── processes/          # Cartographie processus PR-01→04
│   │   ├── documents/          # GED · Versioning · Workflow
│   │   ├── kpi/                # KPI · Mesures · Alertes
│   │   ├── risks/              # Registre · Heatmap · Plans
│   │   ├── audits/             # Programme · Checklists
│   │   ├── findings/           # Constats · NC
│   │   ├── corrective-actions/ # Plans d'action · Workflow
│   │   ├── complaints/         # Réclamations · Recours
│   │   ├── satisfaction/       # Enquêtes · Résultats
│   │   ├── trainings/          # Formations · Compétences
│   │   ├── reports/            # Revue direction · PDF
│   │   ├── notifications/      # Email · Push
│   │   ├── iso-center/         # Maturité · GAP · Radar
│   │   ├── common/             # Guards · Decorators · Filters
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                   # Next.js 15
│   ├── src/
│   │   ├── app/                # App Router pages
│   │   │   ├── (auth)/         # Login · Register
│   │   │   ├── dashboard/
│   │   │   ├── kpi/
│   │   │   ├── processes/
│   │   │   ├── documents/
│   │   │   ├── risks/
│   │   │   ├── audits/
│   │   │   ├── findings/
│   │   │   ├── actions/
│   │   │   ├── complaints/
│   │   │   ├── satisfaction/
│   │   │   ├── trainings/
│   │   │   ├── reports/
│   │   │   ├── iso-center/
│   │   │   └── admin/
│   │   ├── components/
│   │   │   ├── ui/             # Shadcn/UI components
│   │   │   ├── layout/         # AppLayout · Sidebar · Topbar
│   │   │   └── dashboard/      # Widgets · Charts · Cards
│   │   ├── hooks/              # useAuth · useDashboard · useKpi...
│   │   ├── lib/                # axios · utils · constants
│   │   ├── store/              # Zustand stores
│   │   └── types/              # TypeScript interfaces
│   ├── Dockerfile
│   └── package.json
│
├── database/
│   └── schema.sql              # Schéma PostgreSQL complet
│
├── docker/
│   ├── docker-compose.yml
│   ├── docker-compose.dev.yml
│   ├── nginx/
│   │   ├── nginx.conf
│   │   └── conf.d/smoe.conf
│   └── .env.example
│
└── docs/
    ├── README.md               # Ce fichier
    ├── API.md                  # Documentation API REST
    ├── DEPLOYMENT.md           # Guide de déploiement
    └── USER_GUIDE.md           # Guide utilisateur
```

---

## 4. Prérequis & Installation

### Prérequis système

| Outil | Version minimale |
|-------|-----------------|
| Node.js | 20 LTS |
| npm | 10+ |
| Docker | 24+ |
| Docker Compose | 2.20+ |
| PostgreSQL | 15+ |
| Redis | 7+ |

### Installation en développement

```bash
# 1. Cloner le projet
git clone https://github.com/esef-berrechid/smart-smoe-ifdl.git
cd smart-smoe-ifdl

# 2. Variables d'environnement
cp docker/.env.example .env
# Éditer .env avec vos paramètres

# 3. Base de données
docker run -d \
  --name smoe_postgres \
  -e POSTGRES_USER=smoe_user \
  -e POSTGRES_PASSWORD=smoe_password \
  -e POSTGRES_DB=smoe_ifdl \
  -p 5432:5432 postgres:16-alpine

# Appliquer le schéma
psql -U smoe_user -d smoe_ifdl -f database/schema.sql

# 4. Backend
cd backend
npm install
cp .env.example .env.local
npm run start:dev
# API disponible sur http://localhost:3001
# Swagger : http://localhost:3001/api/docs

# 5. Frontend
cd ../frontend
npm install
cp .env.example .env.local
npm run dev
# Interface sur http://localhost:3000
```

### Installation avec Docker (Production)

```bash
# 1. Configurer l'environnement
cp docker/.env.example .env
nano .env  # Éditer les variables

# 2. Démarrer tous les services
cd docker
docker-compose up -d

# 3. Vérifier les services
docker-compose ps
docker-compose logs -f backend

# 4. Accès
# Frontend : http://localhost ou https://smoe.esef-berrechid.ma
# API :      http://localhost:3001/api/v1
# Swagger :  http://localhost:3001/api/docs
# pgAdmin :  http://localhost:5050 (dev uniquement)

# Compte admin par défaut
# Email    : admin@smoe-ifdl.ma
# Password : Admin@SMOE2024
# ⚠️ Changer immédiatement après la première connexion
```

---

## 5. Variables d'environnement

### Backend `.env`

```env
# Application
NODE_ENV=production
PORT=3001

# Base de données
DB_HOST=postgres
DB_PORT=5432
DB_USER=smoe_user
DB_PASSWORD=CHANGEME_STRONG_PASSWORD
DB_NAME=smoe_ifdl
DB_SSL=false

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=CHANGEME_REDIS_PASSWORD

# JWT
JWT_SECRET=CHANGEME_JWT_SECRET_MIN_32_CHARS
JWT_EXPIRES_IN=8h
JWT_REFRESH_SECRET=CHANGEME_REFRESH_SECRET_MIN_32_CHARS

# Frontend URL (CORS)
FRONTEND_URL=https://smoe.esef-berrechid.ma

# OpenAI (IA Assistant)
OPENAI_API_KEY=sk-...

# Email SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=smoe@esef-berrechid.ma
SMTP_PASS=CHANGEME_SMTP_PASSWORD
SMTP_FROM=noreply@esef-berrechid.ma

# Supabase Storage
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Frontend `.env.local`

```env
NEXT_PUBLIC_API_URL=https://smoe-api.esef-berrechid.ma/api/v1
NEXT_PUBLIC_APP_NAME=SMART SMOE IFDL
NEXT_PUBLIC_APP_VERSION=1.0.0
```

---

## 6. Base de données

### Tables principales

| Table | Description | Lignes (~) |
|-------|-------------|-----------|
| `users` | Utilisateurs et comptes | 50–200 |
| `roles` | Rôles et permissions RBAC | 7 |
| `processes` | Processus SMOE PR-01→04 | 4 |
| `documents` | GED · Versions · Statuts | 50–500 |
| `kpis` | Indicateurs de performance | 10–50 |
| `kpi_mesures` | Historique des valeurs KPI | 500+ |
| `risks` | Registre des risques | 20–100 |
| `audits` | Programme d'audit | 6–20/an |
| `findings` | Constats et NC | 20–100 |
| `corrective_actions` | Plans d'action | 20–100 |
| `complaints` | Réclamations et recours | 10–50 |
| `satisfaction_surveys` | Enquêtes satisfaction | 4–10/an |
| `survey_responses` | Réponses aux enquêtes | 100–500 |
| `trainings` | Plan de formation | 10–30/an |
| `reports` | Rapports générés | 10–30/an |
| `notifications` | Notifications système | 1000+ |
| `audit_trail` | Journal des actions | 10000+ |
| `iso_clauses` | Référentiel ISO 21001 | 30 |
| `maturity_assessments` | Évaluations maturité | 2–4/an |

### Sauvegarde

```bash
# Backup automatique
docker exec smoe_postgres pg_dump -U smoe_user smoe_ifdl \
  | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Restauration
gunzip -c backup_20260101_120000.sql.gz \
  | docker exec -i smoe_postgres psql -U smoe_user smoe_ifdl
```

---

## 7. Backend NestJS — API REST

### Endpoints principaux

```
POST   /api/v1/auth/login          Connexion JWT
POST   /api/v1/auth/logout         Déconnexion
POST   /api/v1/auth/refresh        Refresh token
GET    /api/v1/auth/me             Profil courant

GET    /api/v1/dashboard/summary   Tableau de bord exécutif
GET    /api/v1/dashboard/activity  Activité récente

GET    /api/v1/kpi                 Liste KPI
POST   /api/v1/kpi                 Créer KPI
GET    /api/v1/kpi/:id/mesures     Historique KPI
POST   /api/v1/kpi/:id/mesures     Saisir mesure
GET    /api/v1/kpi/dashboard       Résumé KPI

GET    /api/v1/risks               Registre risques
POST   /api/v1/risks               Créer risque
GET    /api/v1/risks/heatmap       Matrice heatmap
GET    /api/v1/risks/:id           Détail risque

GET    /api/v1/audits              Programme audits
POST   /api/v1/audits              Planifier audit
GET    /api/v1/audits/:id/checklist Checklist ISO
POST   /api/v1/audits/:id/findings  Créer constat

GET    /api/v1/findings            Liste NC
POST   /api/v1/findings            Déclarer NC
PATCH  /api/v1/findings/:id        Mettre à jour NC

GET    /api/v1/actions             Actions correctives
POST   /api/v1/actions             Créer action
PATCH  /api/v1/actions/:id/progress Avancement

GET    /api/v1/complaints          Réclamations
POST   /api/v1/complaints          Déposer réclamation
PATCH  /api/v1/complaints/:id      Traiter réclamation

GET    /api/v1/documents           GED
POST   /api/v1/documents/upload    Upload document
GET    /api/v1/documents/:id/versions Versions

GET    /api/v1/iso-center/maturity Évaluation maturité
POST   /api/v1/iso-center/assess   Nouvelle évaluation
GET    /api/v1/iso-center/gap      GAP analysis

POST   /api/v1/reports/generate    Générer rapport
GET    /api/v1/reports/:id/pdf     Télécharger PDF

GET    /api/v1/health              Health check
```

### Documentation Swagger
Disponible à `/api/docs` en mode développement.

---

## 8. Frontend Next.js

### Pages disponibles

| Route | Page | Rôles |
|-------|------|-------|
| `/login` | Page de connexion | Public |
| `/dashboard` | Tableau de bord exécutif | Tous |
| `/kpi` | Gestion KPI | Admin, RQ, Coord |
| `/processes` | Cartographie processus | Admin, RQ, Coord |
| `/documents` | GED | Tous |
| `/risks` | Registre risques | Admin, RQ |
| `/audits` | Programme audits | Admin, RQ, Auditeur |
| `/findings` | Non-conformités | Admin, RQ, Auditeur |
| `/actions` | Actions correctives | Admin, RQ |
| `/complaints` | Réclamations | Tous |
| `/satisfaction` | Enquêtes satisfaction | Tous |
| `/trainings` | Formations | Admin, Coord, Ens |
| `/reports` | Revue de direction | Admin, RQ, Coord |
| `/iso-center` | ISO 21001 Center | Admin, RQ |
| `/admin` | Administration | Admin |
| `/ai-assistant` | IA SMOE Assistant | Tous |

---

## 9. Déploiement Docker

```bash
# Production complète
docker-compose -f docker/docker-compose.yml up -d

# Voir les logs
docker-compose -f docker/docker-compose.yml logs -f

# Arrêter
docker-compose -f docker/docker-compose.yml down

# Mise à jour
docker-compose -f docker/docker-compose.yml pull
docker-compose -f docker/docker-compose.yml up -d --force-recreate

# Avec pgAdmin (dev)
docker-compose -f docker/docker-compose.yml --profile dev up -d
```

---

## 10. Guide utilisateur par rôle

### Administrateur SMOE
- Accès complet à tous les modules
- Gestion des utilisateurs et rôles
- Paramétrage de la plateforme
- Génération des rapports de revue de direction

### Responsable Qualité
- Pilotage des KPI et tableaux de bord
- Gestion des risques et du registre
- Planification et conduite des audits
- Traitement des non-conformités et actions correctives

### Coordonnateur Master
- Suivi des processus pédagogiques (PR-02)
- Consultation des KPI pédagogiques
- Gestion des enquêtes satisfaction
- Génération des rapports pédagogiques

### Enseignant
- Consultation des documents qualité
- Dépôt de réclamations/suggestions
- Réponse aux enquêtes satisfaction
- Accès à l'IA SMOE Assistant

### Étudiant
- Portail réclamations et recours
- Réponse aux enquêtes satisfaction
- Consultation des résultats agrégés
- Accès aux procédures étudiantes

### Auditeur
- Accès au programme d'audit
- Gestion des checklists ISO 21001
- Saisie des constats et NC
- Génération des rapports d'audit

---

## 11. Sécurité & Conformité

### Mesures de sécurité (OWASP Top 10)

- ✅ **A01 — Broken Access Control** : RBAC granulaire par module et action
- ✅ **A02 — Cryptographic Failures** : HTTPS obligatoire, bcrypt (12 rounds)
- ✅ **A03 — Injection** : TypeORM parameterized queries, validation class-validator
- ✅ **A05 — Security Misconfiguration** : Helmet.js, CSP headers, CORS strict
- ✅ **A07 — Auth Failures** : JWT + refresh tokens, rate limiting (ThrottlerModule)
- ✅ **A09 — Security Logging** : Audit trail complet en base de données

### Conformité ISO 21001
- Traçabilité documentaire complète
- Gestion des versions et approbations
- Piste d'audit des actions utilisateurs
- Conservation des enregistrements qualité

---

## 12. Maintenance

### Tâches récurrentes

```bash
# Vérification santé services
docker-compose ps
curl http://localhost:3001/api/v1/health

# Backup base de données (à planifier en cron)
0 2 * * * docker exec smoe_postgres pg_dump -U smoe_user smoe_ifdl | gzip > /backups/smoe_$(date +\%Y\%m\%d).sql.gz

# Nettoyage logs anciens (> 90 jours)
find /var/log/smoe -name "*.log" -mtime +90 -delete

# Mise à jour images Docker
docker-compose pull && docker-compose up -d

# Monitoring santé
docker stats smoe_backend smoe_frontend smoe_postgres smoe_redis
```

### Support
- Email : qualite@esef-berrechid.ma
- Documentation : https://docs.smoe-ifdl.ma
- Issues : https://github.com/esef-berrechid/smart-smoe-ifdl/issues

---

*SMART SMOE IFDL v1.0.0 — ESEF Berrechid, Université Hassan 1er — © 2026*
