# 🍽️ Food Ordering App — Backend

Backend d'une application de commande et livraison de nourriture (single restaurant), développé comme projet portfolio dans le cadre d'une reconversion vers l'ingénierie DevOps. Le projet sert de socle applicatif réel pour démontrer une chaîne complète : conception d'API robuste → conteneurisation → CI/CD → orchestration Kubernetes → monitoring.

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
- **Routes** : définition des endpoints et middlewares (auth, rôles, validation)
- **Controllers** : gestion HTTP (req/res, codes de statut), aucune logique métier
- **Services** : logique métier, règles de validation, orchestration
- **Repository** : unique point de contact avec Prisma/la base de données

Chaque couche est implémentée en **classes TypeScript**, exportées en singleton (`export default new XxxClass()`).

## 📊 Modèle de données

10 entités : `User`, `Category`, `Dish`, `Cart`, `CartItem`, `Order`, `OrderItem`, `Payment`, `Delivery`, `Address`.

- **Soft delete** (`deletedAt: null`) sur `User`, `Category`, `Dish`, `Address` — préserve l'intégrité de l'historique des commandes passées
- **Panier persistant côté serveur**, créé automatiquement à l'inscription
- **Machine à états** pour le cycle de vie des commandes, avec autorisation par rôle :
  
  PENDING → CONFIRMED → PREPARING → READY_FOR_DELIVERY → OUT_FOR_DELIVERY → DELIVERED
↘ ↘ ↘
CANCELLED: dans le cas d'une commande annule par un user ou par le systeme

## ✅ Fonctionnalités actuelles

- [x] Authentification JWT complète (register, login, refresh, profil)
- [x] Gestion des catégories et plats (CRUD, lecture publique / écriture admin)
- [x] Gestion des adresses utilisateur (CRUD, adresse par défaut unique)
- [x] Panier persistant (ajout, incrémentation automatique, modification, suppression)
      
##  Fonctionnalités a developper
- [x] Création de commande depuis le panier (transaction atomique, vérification anti-fraude des prix)
- [x] Machine à états des commandes avec autorisation par rôle (client/admin/livreur)
- [ ] Gestion de la livraison (assignation livreur, suivi)
- [ ] Intégration paiement (MTN MoMo / Orange Money)
- [ ] Frontend React
- [ ] Conteneurisation et déploiement DevOps

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
src/
├── config/ # Configuration (Prisma client)
├── middlewares/ # requireAuth, requireRole, validate
├── modules/
│ ├── auth/
│ ├── category/
│ ├── dish/
│ ├── address/
│ ├── cart/
│ └── order/
├── validators/ # Schémas Zod
├── utils/ # Utilitaires (JWT, etc.)
└── types/ # Extensions de types (Express Request)
