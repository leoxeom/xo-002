# Golf Pass – User Stories & Technical Specs

---

## 1. User Stories (par persona)

### 1.1 Claire – CEO Passionnée  
| ID | User Story | Priorité | Épopée |
|----|-----------|----------|--------|
| US-CLA-01 | En tant que **CEO**, je veux **créer un séjour incentive en moins de 10 min** afin de gagner du temps dans l’organisation. | Haute | Création Séjour |
| US-CLA-02 | En tant que CEO, je veux **payer via compte entreprise** pour centraliser la facturation. | Moyenne | Paiement |

### 1.2 Lucas – Millennial Golfer  
| ID | User Story | Priorité |
|----|-----------|----------|
| US-LUC-01 | En tant que golfeur, je veux **trouver des séjours < 1 000 €** avec filtres “prix” et “durée” afin de respecter mon budget. | Haute |
| US-LUC-02 | En tant que golfeur, je veux **split-payer avec mes amis** pour partager le coût. | Haute |
| US-LUC-03 | En tant que golfeur, je veux **recevoir des recommandations IA** basées sur mes précédentes réservations afin de découvrir de nouveaux parcours. | Moyenne |

### 1.3 Sophie – Tour-opératrice  
| ID | User Story | Priorité |
|----|-----------|----------|
| US-SOP-01 | En tant que vendeuse, je veux **publier un séjour multi-dates** via un formulaire no-code pour digitaliser mon offre. | Critique |
| US-SOP-02 | Je veux **suivre mes réservations et revenus** au sein d’un tableau de bord analytics. | Haute |
| US-SOP-03 | Je veux **promouvoir une offre** en payant un placement sponsorisé. | Moyenne |

### 1.4 Marc – Golfeur Luxe  
| ID | User Story | Priorité |
|----|-----------|----------|
| US-MAR-01 | En tant que client premium, je veux **accéder à des séjours exclusifs** réservés aux abonnés VIP. | Haute |
| US-MAR-02 | Je veux **bénéficier d’un service conciergerie 24/7** via chatbot + humain. | Haute |

---

## 2. Critères d’acceptation (extraits)

### Exemple : US-LUC-01 (Recherche budget)
```
Scénario: Filtrage par prix
Étant donné que Lucas est sur la page de recherche
Quand il saisit "Portugal" et applique le filtre prix < 1 000 €
Alors la liste de résultats affiche uniquement des séjours dont le prix / personne est ≤ 1 000 €
Et le badge "Budget Match" est visible
```

### Exemple : US-SOP-01 (Publication séjour)
```
Scénario: Publication valide
Étant donné que Sophie remplit le formulaire séjour
Et que tous les champs obligatoires sont complétés
Quand elle clique sur "Publier"
Alors la fiche séjour est générée avec URL publique
Et son statut passe à "En ligne"
```

---

## 3. Architecture Technique (texte descriptif)

1. **Front-end** :  
   - Next.js 15 SSR/ISR  
   - Tailwind CSS + composants glassmorphiques  
   - Auth via JWT stocké HttpOnly cookie  

2. **Mobile** : React Native (Expo) partage 70 % du code métier.

3. **Back-end** (NestJS micro-services) :  
   - Service `gateway` GraphQL + REST  
   - Service `booking`  
   - Service `payments` (Stripe Connect)  
   - Service `search` (Meilisearch)  
   - Service `ai-reco` (FastAPI Python)

4. **Data** : Supabase (PostgreSQL) + buckets S3 pour médias.

5. **Messaging** : NATS Streaming (event bus).

6. **Observabilité** : Prometheus + Grafana + Loki + Jaeger.

---

## 4. Spécifications API (extraits REST)

| Méthode | Endpoint | Auth | Description | Réponse |
|---------|----------|------|-------------|---------|
| POST | /api/v1/auth/login | Public | Login email / mot de passe | 200 JWT |
| GET | /api/v1/packages | Publique | Liste paginée + filtres | 200 JSON, meta |
| POST | /api/v1/packages | Seller JWT | Créer un séjour | 201 packageId |
| POST | /api/v1/bookings | Buyer JWT | Réserver | 201 bookingId |
| POST | /api/v1/payments/intent | Buyer JWT | Créer intent Stripe | secret |
| GET | /api/v1/reco/<userId> | JWT | Recommandations IA | Array packages |

Headers communs : `X-Request-Id`, `X-Api-Version: 1`.

---

## 5. Schéma Base de Données (tables majeures)

| Table | PK | Champs clés | Index | FK |
|-------|----|-------------|-------|----|
| users | id (UUID) | role, email, hashed_pw, kyc_status, premium_until | email UNIQUE | – |
| sellers | id | user_id, company_name, payout_account | – | users.id |
| packages | id | seller_id, title, slug, price_person, duration_days, status | slug UNIQUE, idx_price | sellers.id |
| package_dates | id | package_id, start_date, end_date, seats_total, seats_left | idx_date | packages.id |
| bookings | id | package_date_id, buyer_id, participants, total_amount, status | idx_buyer | users.id |
| payments | id | booking_id, stripe_pi_id, amount, currency, status | – | bookings.id |
| reviews | id | booking_id, rating, comment, target_type, target_id | idx_target | bookings.id |
| ads | id | package_id, start_at, end_at, cpc, budget | idx_pkg | packages.id |

---

## 6. User Journeys détaillés

### Journey : Publication & vente (Sophie)
1. **Dashboard** → bouton « Nouveau séjour ».  
2. Saisie des infos (IA auto-complète le golf).  
3. Upload photos (compressées WebP 80 %).  
4. Dates ajoutées → preview prix dynamique.  
5. Publication → validation KYC → “En ligne”.  
6. Réservation reçue → notif temps réel + email.  
7. Paiement T+1 via Stripe Connect.

### Journey : Recherche & réservation (Lucas)
1. Accueil → moteur recherche central.  
2. Résultats filtrés, tri “Best Fit AI”.  
3. Page séjour → galerie images progressive loading.  
4. Sélection dates → stock vérifié atomic transaction.  
5. Paiement Apple Pay → confirmation écran + mail.  
6. Post-séjour → incitation avis (gamification badge).

---

## 7. Wireframes (descriptions)

* **Page d’accueil** : hero glassmorphique + barre recherche, carrousel séjours en carte 3D.  
* **Résultats list/grid** : sidebar filtres (collapsible mobile), carte Mapbox en split-screen.  
* **Fiche séjour** : header full-bleed image, CTA “Réserver” sticky, calendrier modale.  
* **Dashboard vendeur** : cards KPI (revenus, vues), tableau réservations, heatmap dates.  
* **Flow réservation** : stepper 3 étapes (détails séjour, participants, paiement).

---

## 8. Exigences Performance

| KPI | Cible |
|-----|-------|
| Time-to-First-Byte (TTFB) | < 200 ms (CDN) |
| Largest Contentful Paint | < 2.5 s sur mobile 3G |
| Apdex | ≥ 0.9 |
| RPS soutenu | 500 req/s (p99 < 400 ms) |
| Temps de recherche Meilisearch | < 50 ms / requête |

Optimisations : ISR Next.js, HTTP/3, cache Redis, images AVIF, lazy-loading modules.

---

## 9. Spécifications Sécurité

* **Authentification** : OAuth 2 + MFA optionnelle (TOTP).  
* **Autorisation** : RBAC (buyer, seller, admin), scopes JWT.  
* **Chiffrement** : TLS 1.3, AES-256 at rest (Supabase).  
* **OWASP** : protection CSRF (cookies SameSite=Lax), CSP stricte.  
* **Paiement** : PCI-DSS via Stripe, aucun numéro carte stocké.  
* **Logs** : immuables (WORM S3), masquage données perso.  
* **RGPD** : droit à l’oubli, portabilité (export JSON), DPA.

---

## 10. Stratégie de Tests

| Niveau | Outil | Couverture |
|--------|-------|------------|
| Unitaire | Jest (TS), PyTest (ML) | 90 % lignes |
| Intégration | Supertest + Testcontainers (DB) | API / DB |
| E2E Web | Playwright (CI GitHub Actions) | Scénarios critiques (checkout, publication) |
| Mobile | Detox | Parcours iOS/Android |
| Performance | k6 + Grafana k6-cloud | montée charge 10 → 500 RPS |
| Sécurité | Snyk, OWASP ZAP CI, dependency-check | CVE < 30 jours |
| Accessibility | Axe Playwright plugin | WCAG 2.1 AA |
| Chaos | Gremlin (latence DB, crash service) | résilience |

Rapports dans SonarCloud, seuil qualité “gate” avant merge.

---

_Fichier technique interne – dernière mise à jour : 05 / 06 / 2025_
