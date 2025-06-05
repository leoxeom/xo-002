<div align="center">
  
# 🏌️‍♂️ Golf Pass

### *La plateforme premium de réservation de séjours golf*

![Version](https://img.shields.io/badge/version-1.0.0--alpha-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![PRD Status](https://img.shields.io/badge/PRD-Completed-success)

<br>

<img src="https://via.placeholder.com/150x150.png?text=GP" alt="Golf Pass Logo" width="150"/>

*Réinventer le voyage de golf, un parcours à la fois*

</div>

---

## 📋 Sommaire

- [🌟 Présentation](#-présentation)
- [✨ Fonctionnalités Clés](#-fonctionnalités-clés)
- [🛠️ Stack Technique](#️-stack-technique)
- [📂 Structure du Projet](#-structure-du-projet)
- [🎨 Design System](#-design-system)
- [🗺️ Roadmap](#️-roadmap)
- [🚀 Installation & Développement](#-installation--développement)
- [👥 Contribution](#-contribution)
- [📄 Licence](#-licence)

---

## 🌟 Présentation

**Golf Pass** est une marketplace verticale premium qui révolutionne la réservation de séjours golf. Inspirée des standards d'Airbnb et Booking.com, mais entièrement dédiée à l'univers du golf, notre plateforme connecte :

- 🏢 **Vendeurs professionnels** : tour-opérateurs spécialisés golf
- 🧳 **Acheteurs passionnés** : golfeurs en quête d'expériences exceptionnelles

Avec une **expérience utilisateur "wow"** (design glassmorphisme élégant, IA de recommandation, transparence des prix), Golf Pass vise à devenir la référence mondiale pour la réservation de séjours golfiques premium.

> 🔍 **Vision** : Créer l'écosystème digital de référence pour les voyages de golf, alliant technologie de pointe et expérience utilisateur exceptionnelle.

---

## ✨ Fonctionnalités Clés

### Pour les Golfeurs
- 🔍 **Recherche avancée** avec filtres multicritères (parcours, prix, standing)
- 💳 **Réservation simplifiée** et paiement sécurisé (split payment entre amis)
- 🤖 **Recommandations IA** personnalisées selon votre profil golfeur
- 🔮 **AR Preview** : visualisez le trou signature en réalité augmentée
- 👑 **Abonnement Premium** : accès à des offres exclusives et avantages VIP

### Pour les Vendeurs
- 📝 **Back-office intuitif** pour création et gestion des offres
- 📊 **Analytics avancés** et tableau de bord des performances
- 💰 **Dynamic Pricing AI** : optimisation des tarifs en temps réel
- 🚀 **Mise en avant sponsorisée** pour booster la visibilité
- 🔄 **Synchronisation calendrier** avec vos autres canaux de vente

### Expérience Commune
- 💬 **Messagerie sécurisée** entre acheteurs et vendeurs
- ⭐ **Système d'avis vérifiés** pour renforcer la confiance
- 📱 **Design responsive** avec mode sombre élégant
- 🌐 **Multi-langues** et multi-devises

---

## 🛠️ Stack Technique

### Frontend
- **Next.js 15** (SSR/ISR) pour performances optimales
- **Tailwind CSS** avec composants glassmorphiques
- **React Native** (Expo) pour la future app mobile
- **TensorFlow.js** pour recommandations côté client

### Backend
- **NestJS** micro-services architecture
- **FastAPI** (Python) pour la couche IA/ML
- **Supabase** (PostgreSQL) multi-tenant
- **Meilisearch** pour recherche ultra-rapide

### Infrastructure
- **Kubernetes** (GKE) pour scaling mondial
- **Cloud CDN** pour assets statiques
- **Stripe Connect** pour paiements et marketplace
- **OpenTelemetry** + Grafana pour monitoring

---

## 📂 Structure du Projet

```
golf-pass/
├─ docs/
│  ├─ Golf_Pass_PRD_Complet.md          # PRD principal
│  ├─ Golf_Pass_User_Stories_Tech_Specs.md  # Spécifications techniques
│  ├─ Golf_Pass_Implementation_Guide.md  # Guide développement
│  └─ Golf_Pass_Design_System.html      # Design system interactif
├─ [futur] apps/
│  ├─ web/          # Next.js 15
│  ├─ mobile/       # Expo React Native
│  └─ admin/        # Storybook + internal tools
├─ [futur] services/
│  ├─ gateway/      # NestJS GraphQL API
│  ├─ booking/
│  ├─ payments/
│  ├─ search/
│  └─ ai-reco/      # FastAPI ML
└─ README.md        # Ce fichier
```

---

## 🎨 Design System

Golf Pass adopte un design system moderne basé sur le **glassmorphisme** pour une expérience utilisateur premium et mémorable.

### Palette de Couleurs
- **Fairway Green** `#2a9d8f` - Couleur principale
- **Light Green** `#8ece9a` - Accents secondaires
- **Sand Beige** `#e9c46a` - Éléments neutres
- **Luxury Gold** `#f4a261` - Éléments premium
- **Accent Red** `#e76f51` - Call-to-actions
- **Dark Blue** `#1d3557` - Mode sombre

### Composants Clés
- **Cards glassmorphiques** avec effet de profondeur
- **Navigation flottante** avec blur backdrop
- **Micro-interactions** sur les éléments interactifs
- **Mode sombre** élégant par défaut

### Aperçus Design

> 🖼️ *Les maquettes haute-fidélité seront ajoutées ici*

<div align="center">
  <p><i>Aperçu du design glassmorphique</i></p>
  <img src="https://via.placeholder.com/800x400.png?text=Golf+Pass+UI+Preview" alt="Golf Pass UI Preview" width="800"/>
</div>

---

## 🗺️ Roadmap

<div align="center">

| Phase | Période | Objectifs |
|:-----:|:-------:|:----------|
| **🏁 MVP** | **T0-T1** | Auth, KYC, publication séjour, checkout Stripe |
| **🔍 Search** | **T2** | Moteur de recherche + filtres avancés, Design System v1 |
| **🤖 IA** | **T3** | Recommandations v1, Messagerie, App mobile bêta |
| **👑 Premium** | **T4** | Abonnement Premium, Advertising Studio, AR Preview |
| **💹 Scale** | **T5-T6** | Dynamic Pricing AI, API B2B, expansion US/Asie |

</div>

### Objectifs Commerciaux
- **GMV mensuelle** : 1 M€ à M6 → 10 M€ à M18
- **Take Rate** : 12% moyenne
- **NPS acheteurs** > 65
- **Taux de conversion** > 4%

---

## 🚀 Installation & Développement

### Prérequis
- Node ≥ 20 (pnpm recommandé)
- Docker ≥ 25 & Docker Compose v2
- Supabase CLI

### Démarrage rapide
```bash
# Cloner le repo
git clone git@github.com:golf-pass/golf-pass.git
cd golf-pass

# Installer les dépendances
pnpm install

# Démarrer l'environnement de développement
pnpm dev
```

### Scripts disponibles
```bash
# web (Next.js) avec hot-reload + supabase local
pnpm nx run web:dev

# gateway API + micro-services
pnpm nx run-many --target=dev --projects=gateway,booking,payments,search

# tests unitaires & lint
pnpm test:all
```

---

## 👥 Contribution

Nous accueillons avec plaisir les contributions à Golf Pass ! Voici comment participer :

1. 🍴 **Fork** le projet
2. 🔧 Créez votre branche de fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. 💾 Committez vos changements (`git commit -m 'Add: Amazing Feature'`)
4. 📤 Poussez vers la branche (`git push origin feature/AmazingFeature`)
5. 🔁 Ouvrez une Pull Request

### Standards de code
- ESLint Airbnb + Prettier
- Tests Jest pour tout nouveau code
- Commits conventionnels

---

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus d'informations.

---

<div align="center">
  
**Golf Pass** • Développé avec ❤️ pour les passionnés de golf

[Website](https://golfpass.io) • [Documentation](https://docs.golfpass.io) • [Support](mailto:support@golfpass.io)

</div>
