# Project Structure

## 1. Overview
The MktHub repository operates as a monolithic repository (monorepo) containing both the Node.js backend and the React frontend. This structure allows for unified version control, synchronized deployment via Docker Compose, and a single CI/CD pipeline.

The repository is strictly divided into two primary domains: `backend/` and `frontend/`.

## 2. Root Directory

```text
mkthub/
├── backend/                # Express 5 API
├── frontend/               # React 19 SPA
├── docs/                   # Technical engineering documentation
├── nginx/                  # Reverse proxy configurations
│   └── default.conf        # Ingress routing rules
├── .github/
│   └── workflows/          # CI/CD pipelines (GitHub Actions)
├── docker-compose.yml      # Multi-container orchestration (Production)
├── docker-compose.dev.yml  # Local development orchestration
└── readme.md               # Project overview
```

## 3. Backend Architecture (`backend/src/`)

The backend follows a layered MVC architecture, enforcing a strict separation between HTTP transport logic and business logic.

```text
backend/src/
├── controllers/          # HTTP Layer
│   # Extracts req.body, invokes services, and sends JSend responses.
│   ├── authController.js
│   ├── productController.js
│   └── ...
│
├── services/             # Business Logic Layer
│   # Contains the core logic, Mongoose transactions, and third-party integrations.
│   ├── authService.js
│   ├── orderService.js
│   └── ...
│
├── models/               # Data Access Layer
│   # Mongoose schemas, indices, and database constraints.
│   ├── User.js
│   ├── Product.js
│   ├── Reservation.js
│   └── ...
│
├── routes/               # Routing Layer
│   # Maps HTTP verbs to controllers and applies middleware chains.
│   ├── authRoutes.js
│   ├── paymentRoutes.js
│   └── ...
│
├── middleware/           # Interceptors & Security
│   ├── auth/             # JWT validation and RBAC
│   ├── validation/       # express-validator and validateAllowedFields
│   ├── error/            # Centralized Express 5 error handling
│   └── rateLimit/        # express-rate-limit factories
│
├── jobs/                 # Background Workers
│   └── reservation/      # Node-cron scheduler for abandoned carts
│
├── utils/                # Shared Helpers
│   ├── ApiErrors.js      # Custom exception classes
│   └── redis.utils.js    # Cache invalidation helpers
│
├── app.js                # Express app instantiation and global middleware
└── server.js             # Entry point (HTTP Server binding & DB connection)
```

## 4. Frontend Architecture (`frontend/src/`)

The React Single Page Application (SPA) organizes logic by domain and technical responsibility.

```text
frontend/src/
├── api/                  # Network Layer
│   # Contains the Axios client, interceptors, and the silent token refresh queue.
│   └── axiosClient.js
│
├── components/           # Reusable UI Elements
│   ├── layout/           # Navbars, Sidebars, PageLoaders
│   ├── product/          # ProductCards, Carousels
│   └── ui/               # shadcn/ui generic primitives (Buttons, Inputs)
│
├── pages/                # Route Views
│   # Top-level components mapped directly to react-router URLs.
│   ├── auth/             # Login, Register
│   ├── cart/             # Shopping Cart view
│   └── dashboard/        # Role-based dashboards (Admin, Seller)
│
├── context/              # Global State
│   # React Context providers for data that affects the entire tree.
│   └── AuthContext.jsx   # User session and RBAC state
│
├── hooks/                # Custom React Hooks
│   # Wrappers around TanStack React Query for data fetching and mutations.
│   ├── useProducts.js
│   └── ...
│
├── lib/                  # Utilities
│   └── utils.js          # cn() function for Tailwind class merging
│
├── App.jsx               # react-router configuration
└── main.jsx              # React DOM entry point
```

## 5. Architectural Rules
1. **Controllers cannot access models directly:** Controllers must delegate data access to the `services/` layer.
2. **Services cannot access `req` or `res`:** Services must remain pure JavaScript functions unaware of the Express HTTP context.
3. **Frontend Views cannot fetch data directly:** `pages/` must utilize custom TanStack React Query hooks from the `hooks/` directory.

## 6. Related Documentation
- [Architecture Overview (architecture.md)](architecture.md)
- [Backend API Standards (api.md)](api.md)
- [Frontend React Patterns (frontend.md)](frontend.md)
