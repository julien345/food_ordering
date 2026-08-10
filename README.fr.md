# 🍽️ Food Ordering App — Backend

Backend d'une application de commande et livraison de nourriture, développé comme projet portfolio dans le cadre d'une reconversion vers l'ingénierie DevOps. Le projet sert de socle applicatif réel pour démontrer une chaîne complète : conception d'API robuste → conteneurisation → CI/CD → orchestration Kubernetes → monitoring.

*[Read in English](./README.md)*

## 🎯 Objectif du projet

Construire une application fullstack complète en trois phases :
1. **Backend** (Node.js/TypeScript) — API REST sécurisée et modulaire
2. **Frontend** (React) — interface client et dashboard admin
3. **DevOps** — Docker, CI/CD, déploiement k3s, monitoring

## 🛠️ Stack technique

- **Runtime** : Node.js + TypeScript
- **Framework** : Express
- **ORM** : Prisma v7 (`prisma.config.ts` + `@prisma/adapter-pg`)
- **Base de données** : PostgreSQL
- **Validation** : Zod v4
- **Authentification** : JWT (access token 15min / refresh token 7 jours), bcrypt

## 🏗️ Architecture

Architecture en couches strictes, appliquée à tous les modules :

```
routes → controllers → services → repository
```

- **Routes** : définition des endpoints, middlewares (auth, rôles, validation)
- **Controllers** : gestion HTTP (req/res, codes de statut), aucune logique métier
- **Services** : logique métier, règles de validation, orchestration
- **Repository** : unique point de contact avec Prisma/la base de données

Chaque couche est implémentée en **classes TypeScript**, exportées en singleton (`export default new XxxClass()`).

### Gestion d'erreurs centralisée

Le projet utilise un système d'erreurs typées plutôt que des try/catch répétés dans chaque controller :

- `src/errors/AppError.ts` — classe de base avec code HTTP intégré
- `src/errors/index.ts` — erreurs spécifiques (`NotFoundError`, `ForbiddenError`, `ConflictError`, `BadRequestError`, `UnauthorizedError`)
- `src/middlewares/errorHandler.middleware.ts` — middleware global qui capture et formate toutes les erreurs
- `src/utils/asyncHandler.ts` — wrapper qui transmet automatiquement les erreurs async au middleware global

Les services lèvent directement des erreurs typées (`throw new NotFoundError(...)`), les controllers restent focalisés sur le HTTP pur, sans gestion d'erreur manuelle.

## 📊 Modèle de données

10 entités : `User`, `Category`, `Dish`, `Cart`, `CartItem`, `Order`, `OrderItem`, `Payment`, `Delivery`, `Address`.

- **Soft delete manuel** (`deletedAt: null`) sur `User`, `Category`, `Dish`, `Address` — préserve l'intégrité de l'historique des commandes passées. `Order`, `OrderItem`, `Payment`, `Delivery` sont des enregistrements historiques immuables (pas de soft delete).
- **Panier persistant côté serveur**, créé automatiquement à l'inscription (`@@unique([cartId, dishId])`, `unitPrice` capturé à l'ajout)
- **Machine à états** pour le cycle de vie des commandes, à deux niveaux de vérification (transition logiquement valide + rôle autorisé) :
  ```
  PENDING → CONFIRMED → PREPARING → READY_FOR_DELIVERY → OUT_FOR_DELIVERY → DELIVERED
                ↘             ↘             ↘
                            CANCELLED
  ```
- **Vérification anti-fraude des prix** : au moment de la création d'une commande, les prix réels des plats sont revérifiés en base plutôt que de faire confiance au prix figé dans le panier.
- **Pagination** (`page`, `limit`, plafonnée à 100) sur les listes volumineuses : `Dish`, `Order`. `Category` reste non paginée (volume structurellement faible).

## ✅ Fonctionnalités actuelles

- [x] Authentification JWT complète (register, login, refresh avec rotation, profil `/me`)
- [x] Gestion des catégories (CRUD, lecture publique / écriture admin)
- [x] Gestion des plats (CRUD, relation catégorie, filtrage, pagination)
- [x] Gestion des adresses utilisateur (CRUD, adresse par défaut unique, protection propriétaire)
- [x] Panier persistant (ajout avec incrémentation automatique, modification, suppression)
- [x] Création de commande depuis le panier (transaction atomique, vérification anti-fraude des prix)
- [x] Machine à états des commandes avec autorisation par rôle (client/admin/livreur)
- [x] Gestion de la livraison (assignation admin, transition automatique, restriction au livreur assigné)
- [x] Gestion d'erreurs centralisée (classes d'erreur typées + middleware global)
- [x] Pagination sur les listes volumineuses
- [ ] Auto-expiration des commandes `PENDING` non traitées (cron/CronJob k8s — prévu en finitions)
- [ ] Intégration paiement (MTN MoMo / Orange Money)
- [ ] Frontend React
- [ ] Conteneurisation et déploiement DevOps

## 🔐 Rôles et permissions

| Rôle | Description |
|---|---|
| `CLIENT` | Parcourt le catalogue, gère son panier/adresses, passe commande, peut annuler ses propres commandes en attente |
| `ADMIN` | Gère catégories/plats, valide et fait progresser les commandes, assigne les livreurs |
| `DELIVERY_AGENT` | Consulte ses livraisons assignées, marque une commande comme livrée (uniquement celles qui lui sont assignées) |

## 🚀 Installation

```bash
# Cloner le repo
git clone <url_du_repo>
cd food_ordering_app

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Remplir DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET

# Générer le client Prisma (non versionné, requis après chaque clone)
npx prisma generate

# Lancer les migrations
npx prisma migrate dev

# Démarrer le serveur en développement
npm run dev
```

## 📁 Structure du projet

```
src/
├── config/              # Configuration (Prisma client)
├── errors/              # AppError et classes d'erreur typées
├── middlewares/         # requireAuth, requireRole, validate, errorHandler
├── modules/
│   ├── auth/
│   ├── category/
│   ├── dish/
│   ├── address/
│   ├── cart/
│   ├── order/
│   └── delivery/
├── validators/          # Schémas Zod
├── utils/               # JWT, pagination, asyncHandler
└── types/               # Extensions de types (Express Request)
```
