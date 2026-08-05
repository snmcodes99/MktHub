# Project Structure Implementation

## Structural Decisions

mkthub is a monorepo that strictly separates the Node.js API from the Vite client, managed centrally via Docker Compose.

### 1. The Monorepo Boundary
The root directory isolates concerns primarily at the infrastructure level.
- `docker-compose.yml` binds the frontend, backend, Redis, and Nginx containers together into a unified Docker bridge network.
- `nginx/nginx.conf` acts as the single point of ingress, statically proxying `/api/*` requests to the Node container while serving the compiled frontend `dist` files for all other routes.

### 2. Backend Module Isolation (`backend/src/`)
The internal structure of the Express application forces developers into the Controller-Service-Model paradigm.

- **`src/config/`**: Contains pure bootstrapping code. For instance, `redis.js` establishes the TCP connection pool, and `db.js` initializes Mongoose. By extracting this from `server.js`, the main entry point remains clean.
- **`src/middleware/`**: Contains pure Express interceptor functions (e.g., `requireAuth.js`, `errorMiddleware.js`).
- **`src/controllers/`**: Contains the HTTP boundaries (e.g., `authController.js`). They extract DTOs and return JSON.
- **`src/services/`**: The largest and most complex directory (e.g., `orderService.js`). It contains 100% of the Mongoose transaction logic and business rules.
- **`src/jobs/`**: Physically separates asynchronous worker definitions (`emailWorker.js`) from the synchronous HTTP pipeline, ensuring the main API thread never imports heavy libraries like `pdfkit`.

### 3. Frontend Component Isolation (`frontend/src/`)
The React architecture is optimized to separate server state (API calls) from local UI state.

- **`src/api/axiosClient.js`**: Centralizes the `baseUrl` and `withCredentials` settings, housing the token refresh interceptor. This guarantees no React component manually manages headers.
- **`src/pages/`**: Contains top-level route views (e.g., `ProductDetailPage.jsx`). These are exclusively the components imported by `App.jsx` using `React.lazy()` for code splitting.
- **`src/components/`**: Houses reusable UI molecules (like Shadcn button components or Skeleton loaders) that are agnostic to business logic.
