# 📚 Golf Pass – Guide de Développement

Bienvenue !  
Ce document explique comment **installer, lancer et contribuer** à l’application Golf Pass dans un environnement local.

---

## Sommaire
1. [Pré-requis](#pré-requis)
2. [Installation rapide](#installation-rapide)
3. [Variables d’environnement](#variables-denvironnement)
4. [Commandes de développement](#commandes-de-développement)
5. [Structure du projet](#structure-du-projet)
6. [Utilisation de Supabase en local (optionnel)](#utilisation-de-supabase-en-local-optionnel)
7. [Qualité & bonnes pratiques](#qualité--bonnes-pratiques)
8. [FAQ développeur](#faq-développeur)

---

## Pré-requis
| Outil | Version minimale | Pourquoi ? |
|-------|------------------|------------|
| Node.js | **20** | Runtime JS/TS |
| pnpm | **8** | Gestionnaire de paquets rapide & workspace |
| Git | 2.40+ | VCS |
| Docker + Docker Compose | 25+ | Supabase & MeiliSearch locaux |
| Supabase CLI | 1.164+ | Database & Edge Functions |
| (Optionnel) Nx | 18+ | Commandes monorepo ergonomiques |

> Conseil : activez **corepack** (`corepack enable`) pour obtenir pnpm sans installation globale.

---

## Installation rapide
```bash
# 1. Cloner le repo
git clone git@github.com:golf-pass/golf-pass.git
cd golf-pass

# 2. Installer les dépendances
pnpm install

# 3. Créer vos variables d'environnement
cp .env.example .env.local

# 4. Lancer l’application web Next.js
pnpm dev
```
L’interface est maintenant accessible sur **http://localhost:3000** avec des **données mock** réalistes (séjours, hôtels, golfs…).

---

## Variables d’environnement
Les variables indispensables sont listées dans `.env.example`.

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de l’instance Supabase | `http://localhost:54321` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé public Supabase | `anon` |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service (Edge Functions) | _vide_ |
| `STRIPE_SECRET_KEY` | Clé API Stripe test | _vide_ |

Vous pouvez **laisser vide** pour un développement hors-ligne (les appels réseau seront simulés).

---

## Commandes de développement
| Commande | Usage |
|----------|-------|
| `pnpm dev` | Démarre Next.js (hot-reload) |
| `pnpm build` | Build de production |
| `pnpm start` | Démarrage en prod locale (`.next/`) |
| `pnpm lint` | ESLint + Prettier |
| `pnpm test` | Tests unitaires (Vitest/Jest) |
| `pnpm test:watch` | Tests en watch |
| `pnpm supabase:start` | (script custom) Lance Supabase Docker |
| `pnpm supabase:functions:dev` | Hot-reload des Edge Functions |
| `pnpm db:migrate` | Applique les migrations SQL locales |

---

## Structure du projet
```
golf-pass/
├─ app/                     # Application Next.js 15 (TypeScript + Tailwind v4)
│  ├─ pages/                # Routage App Router
│  ├─ components/           # UI réutilisable (glassmorphism, 3D, etc.)
│  ├─ data/                 # Données mock (JSON/TS) pour dev offline
│  └─ ...
├─ supabase/
│  ├─ config.toml           # Config projet Supabase
│  ├─ migrations/           # SQL versionnées (001_initial_schema.sql …)
│  └─ functions/
│     ├─ _shared/           # helpers (CORS, utils)
│     ├─ create-payment-intent/
│     ├─ generate-recommendations/
│     └─ stripe-webhook/
├─ docs/                    # PRD complet, Design System, Specs
├─ .github/
│  └─ workflows/            # CI/CD (supabase-deploy.yml)
└─ package.json             # Dépendances & scripts
```
📁 **docs/** contient toute la documentation produit & design.  
📁 **supabase/** est isolé pour faciliter le travail back-end.  
📁 **app/** est focalisé frontend PWA.

---

## Utilisation de Supabase en local (optionnel)
```bash
# Démarrer les conteneurs
pnpm supabase:start
# Appliquer les migrations
pnpm db:migrate
# Déployer les Edge Functions en mode watch
pnpm supabase:functions:dev
```
L’URL locale, les clés `anon` & `service_role` sont affichées dans le terminal.  
Mettez-les dans `.env.local` pour activer l’auth réelle, la DB Postgres et le temps-réel.

---

## Qualité & bonnes pratiques
* **ESLint + Prettier + Tailwind Plugin** – lint automatique sur commit.
* **Husky + lint-staged** (à venir) – bloque les commits cassés.
* **Tests** : React Testing Library & Vitest (pages + composants).
* **Commits conventionnels** (`feat:`, `fix:`, `chore:` …) pour un changelog clair.
* **Storybook** (roadmap T2) – visualiser le Design System *GlassPass*.
* **CI GitHub Actions** – lint, test, build, déploiement Supabase.

---

## FAQ développeur
| Question | Réponse courte |
|----------|----------------|
| **Puis-je utiliser Yarn/NPM ?** | Oui, mais pnpm est recommandé pour le workspace. |
| **Comment ajouter un Edge Function ?** | `supabase functions new my-fn --env local` puis codez dans `supabase/functions/my-fn`. |
| **Puis-je contribuer sans Supabase ?** | Absolument. Les services sont simulés par des mocks JSON/TS. |

---

Happy coding !  
*Golf Pass – « Réinventer le voyage de golf, un parcours à la fois »*
