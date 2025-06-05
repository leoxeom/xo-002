# Golf Pass – Implementation Guide

Version : 0.1 • 05 / 06 / 2025  
Destiné à : Équipe de développement (Web, Mobile, DevOps)

---

## 1. Setup du projet

### Prérequis
- Node ≥ 20 (pnpm recommandé)
- Docker ≥ 25 & Docker Compose v2
- `kubectl`, `skaffold`, `gcloud` CLI (GKE)
- Supabase CLI (`brew install supabase/tap/supabase`)
- Volta (gestion versions Node)  
  `curl https://get.volta.sh | bash`

### Clonage mono-repo
```bash
git clone git@github.com:golf-pass/golf-pass.git
cd golf-pass
pnpm install
```

---

## 2. Structure des dossiers (mono-repo)

```
golf-pass/
├─ apps/
│  ├─ web/          # Next.js 15
│  ├─ mobile/       # Expo React Native
│  └─ admin/        # Storybook + internal tools
├─ services/
│  ├─ gateway/      # NestJS GraphQL API
│  ├─ booking/
│  ├─ payments/
│  ├─ search/
│  └─ ai-reco/      # FastAPI ML
├─ packages/
│  ├─ ui/           # Design system (Tailwind + glassmorphism)
│  └─ config/       # tsconfig, eslint, prettier
├─ infra/
│  ├─ k8s/          # Helm charts & manifests
│  ├─ terraform/    # Cloud resources
│  └─ scripts/      # Helper bash
└─ docs/            # PRD, guides (ce fichier)
```

---

## 3. Configuration des outils

| Domaine | Outil | Fichier racine |
|---------|-------|----------------|
| Lint JS/TS | ESLint Airbnb + Prettier | `.eslintrc.cjs`, `.prettierrc` |
| Style | Tailwind 3 | `tailwind.config.ts` |
| Commit | Husky + Commitlint (conventional) | `.husky/`, `commitlint.config.js` |
| Tests | Jest + Testing Library | `jest.config.ts` |
| E2E | Playwright | `playwright.config.ts` |
| CI | GitHub Actions (`.github/workflows`) | `ci.yml`, `cd.yml` |
| Containers | Dockerfile par app + `docker-compose.yaml` |  |
| Secrets | Doppler (`doppler setup`) | `.doppler.yaml` |

---

## 4. Commandes de développement

```bash
# web (Next.js) avec hot-reload + supabase local
pnpm nx run web:dev

# gateway API + micro-services
pnpm nx run-many --target=dev --projects=gateway,booking,payments,search

# mobile (Expo)
pnpm nx run mobile:start

# tests unitaires & lint
pnpm test:all      # jest
pnpm lint:all

# storybook design system
pnpm nx run admin:storybook
```

---

## 5. Déploiement

### Flow CI/CD
1. **CI** : build + tests → artefacts Docker images (GHCR).  
2. **CD** : tag `main` → GitHub Actions déclenche `skaffold run` sur GKE staging.  
3. Merge tag `v*` → promotion prod via Argo CD.

### Scripts
```bash
# build & push images locales
pnpm nx run-many --target=docker --all

# apply helm charts (staging)
skaffold run -p staging
```

---

## 6. Environnements

| Env | URL | Cluster | DB | Search |
|-----|-----|---------|----|--------|
| local | localhost | docker-compose | Supabase local | Meilisearch local |
| staging | staging.golfpass.io | GKE europe-west1 | Supabase project `gp-stg` | Meilisearch managed |
| prod | app.golfpass.io | GKE europe-west1 | Supabase `gp-prod` | Meilisearch managed HA |

---

## 7. Variables d’environnement principales

| Variable | Ex. valeur (staging) | Description |
|----------|----------------------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://api.staging.golfpass.io` | base REST |
| `SUPABASE_URL` | `https://gp-stg.supabase.co` | supabase |
| `SUPABASE_ANON_KEY` | `...` | auth public |
| `STRIPE_PK` | `pk_test_…` | clé publishable |
| `STRIPE_SK` | stockée secret | serveur |
| `MEILI_HOST` | `https://search.stg.golfpass.io` | Search |
| `JWT_SECRET` | secret Doppler | Auth |
| `SENTRY_DSN` | `https://…` | monitoring |
| `NODE_ENV` | `development/staging/production` |  |

Toutes les clés sensibles sont gérées via **Doppler** et injectées en CI/CD.

---

## 8. Scripts utiles (`package.json` racine)

```json
{
  "scripts": {
    "dev": "concurrently -k \"pnpm web:dev\" \"pnpm services:dev\"",
    "web:dev": "nx run web:dev",
    "services:dev": "nx run-many --target=dev --projects=gateway,booking,search,payments",
    "docker:build": "nx run-many --target=docker --all",
    "db:migrate": "supabase db push",
    "db:studio": "supabase studio",
    "test:all": "nx run-many --target=test --all",
    "lint:all": "nx run-many --target=lint --all"
  }
}
```

---

## 9. Checklist de lancement (prod)

- [ ] **Domaines & SSL** via Cloud Load Balancer : `app.golfpass.io`, `api.golfpass.io`.  
- [ ] **Migrations DB** exécutées (`supabase db push`).  
- [ ] **Stripe Connect Live** activé + webhooks (`/payments/webhook`).  
- [ ] **S3 buckets** (images) privés + CloudFront / R2 public CDN.  
- [ ] **DNS failover** configuré (Cloud DNS + health checks).  
- [ ] **Argo CD** sync green.  
- [ ] **Runbook incident** partagé (Confluence).  
- [ ] **Monitoring dashboards** validés (Grafana).  
- [ ] **Alertes pager** testées (Alertmanager → Slack + PagerDuty).  
- [ ] **Backup** base quotidienne (7 jours), test restore.  
- [ ] **RGPD registre** mis à jour.

---

## 10. Monitoring & alertes

| Stack | Rôle | Seuils alertes |
|-------|------|----------------|
| **Prometheus** | Collecte métriques (K8s, app) | CPU > 80 % 5 min, mem > 85 % |
| **Grafana** | Dashboards LCP, RPS, DB | LCP > 3 s p95, RPS drop > 50 % |
| **Loki** | Logs agrégés | error rate > 5 % |
| **Alertmanager** | Routing → Slack #ops / PagerDuty |  |
| **Sentry** | Front & backend errors | new issue critical |
| **k6 cloud** | Tests charge hebdo | p95 < 400 ms |

---

### Pour aller plus loin
- **Playbook SRE** : `docs/sre-playbook.md`
- **Conventions de code** : `docs/coding-standards.md`
- **Flux Git** : GitHub Flow + revues obligatoires

Bon dev 🚀
