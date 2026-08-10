# 🍽️ Food Ordering App — Backend

Backend for a food ordering and delivery application, built as a portfolio project as part of a career transition into DevOps engineering. The project serves as a real application layer to demonstrate a full chain: robust API design → containerization → CI/CD → Kubernetes orchestration → monitoring.

*[Lire en français](./README.fr.md)*

## 🎯 Project goal

Build a complete fullstack application in three phases:
1. **Backend** (Node.js/TypeScript) — secure, modular REST API
2. **Frontend** (React) — client interface and admin dashboard
3. **DevOps** — Docker, CI/CD, k3s deployment, monitoring

## 🛠️ Tech stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express
- **ORM**: Prisma v7 (`prisma.config.ts` + `@prisma/adapter-pg`)
- **Database**: PostgreSQL
- **Validation**: Zod v4
- **Authentication**: JWT (15min access token / 7-day refresh token), bcrypt

## 🏗️ Architecture

Strict layered architecture, applied across all modules:

```
routes → controllers → services → repository
```

- **Routes**: endpoint definitions, middlewares (auth, roles, validation)
- **Controllers**: HTTP handling (req/res, status codes), no business logic
- **Services**: business logic, validation rules, orchestration
- **Repository**: sole point of contact with Prisma/the database

Each layer is implemented as **TypeScript classes**, exported as singletons (`export default new XxxClass()`).

### Centralized error handling

The project uses typed errors instead of repeating try/catch blocks in every controller:

- `src/errors/AppError.ts` — base class carrying an HTTP status code
- `src/errors/index.ts` — specific errors (`NotFoundError`, `ForbiddenError`, `ConflictError`, `BadRequestError`, `UnauthorizedError`)
- `src/middlewares/errorHandler.middleware.ts` — global middleware that catches and formats every error
- `src/utils/asyncHandler.ts` — wrapper that automatically forwards async errors to the global middleware

Services throw typed errors directly (`throw new NotFoundError(...)`), keeping controllers focused purely on HTTP, with no manual error handling.

## 📊 Data model

10 entities: `User`, `Category`, `Dish`, `Cart`, `CartItem`, `Order`, `OrderItem`, `Payment`, `Delivery`, `Address`.

- **Manual soft delete** (`deletedAt: null`) on `User`, `Category`, `Dish`, `Address` — preserves the integrity of past order history. `Order`, `OrderItem`, `Payment`, `Delivery` are immutable historical records (no soft delete).
- **Server-side persistent cart**, auto-created at registration (`@@unique([cartId, dishId])`, `unitPrice` captured at add time)
- **State machine** for the order lifecycle, with two-level verification (logically valid transition + authorized role):
  ```
  PENDING → CONFIRMED → PREPARING → READY_FOR_DELIVERY → OUT_FOR_DELIVERY → DELIVERED
                ↘             ↘             ↘
                            CANCELLED
  ```
- **Anti-fraud price verification**: when an order is created, dish prices are re-checked against the database rather than trusting the price frozen in the cart.
- **Pagination** (`page`, `limit`, capped at 100) on high-volume lists: `Dish`, `Order`. `Category` is left unpaginated (structurally low volume).

## ✅ Current features

- [x] Full JWT authentication (register, login, refresh with rotation, `/me` profile)
- [x] Category management (CRUD, public read / admin write)
- [x] Dish management (CRUD, category relation, filtering, pagination)
- [x] User address management (CRUD, single default address, ownership protection)
- [x] Persistent cart (add with auto-increment, update, remove)
- [x] Order creation from cart (atomic transaction, anti-fraud price verification)
- [x] Order state machine with role-based authorization (client/admin/delivery agent)
- [x] Delivery management (admin assignment, automatic transition, restricted to assigned agent)
- [x] Centralized error handling (typed error classes + global middleware)
- [x] Pagination on high-volume lists
- [ ] Auto-expiration of stale `PENDING` orders (cron/k8s CronJob — planned in polish phase)
- [ ] Payment integration (MTN MoMo / Orange Money)
- [ ] React frontend
- [ ] Containerization and DevOps deployment

## 🔐 Roles and permissions

| Role | Description |
|---|---|
| `CLIENT` | Browses the catalog, manages their cart/addresses, places orders, can cancel their own pending orders |
| `ADMIN` | Manages categories/dishes, confirms and advances orders, assigns delivery agents |
| `DELIVERY_AGENT` | Views their assigned deliveries, marks an order as delivered (only those assigned to them) |

## 🚀 Installation

```bash
# Clone the repo
git clone <repo_url>
cd food_ordering_app

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Fill in DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET

# Generate the Prisma client (not versioned, required after every clone)
npx prisma generate

# Run migrations
npx prisma migrate dev

# Start the dev server
npm run dev
```

## 📁 Project structure

```
src/
├── config/              # Configuration (Prisma client)
├── errors/              # AppError and typed error classes
├── middlewares/         # requireAuth, requireRole, validate, errorHandler
├── modules/
│   ├── auth/
│   ├── category/
│   ├── dish/
│   ├── address/
│   ├── cart/
│   ├── order/
│   └── delivery/
├── validators/          # Zod schemas
├── utils/               # JWT, pagination, asyncHandler
└── types/               # Type extensions (Express Request)
```

