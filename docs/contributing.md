# Contributing to MktHub

## 1. Overview
This repository enforces strict engineering standards. Whether you are adding a new feature, fixing a bug, or optimizing a database query, all contributions must adhere to the established architectural patterns (Express 5 async handling, Mongoose `.lean()`, React Query, etc.).

## 2. Local Development Environment

### Prerequisites
- Node.js (v20+)
- Docker & Docker Compose
- Git

### Initial Setup
1. **Clone the repository:**
   ```bash
   git clone https://github.com/snmcodes99/MktHub.git
   cd MktHub
   ```

2. **Environment Variables:**
   MktHub uses **MongoDB Atlas** for database persistence. There is no local MongoDB container. You must configure your Atlas connection string before starting.
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```
   *Fill in your `MONGO_URI`, Razorpay keys, and JWT secrets in `backend/.env`.*

3. **Start Local Development Stack:**
   The easiest way to develop locally is using the Docker Compose development file, which spins up the Frontend, Backend, and a local Redis container with hot-reloading (via volume mounts).
   ```bash
   docker compose -f docker-compose.dev.yml up --build
   ```
   *Frontend: `http://localhost:5173` | Backend: `http://localhost:3000` | Redis: `6379`*

   *(Optional) Native Node.js Dev:* If you prefer running `npm run dev` manually, you must still spin up a local Redis instance (`docker run -d -p 6379:6379 redis:7-alpine`) and run `npm install && npm run dev` in both the `backend` and `frontend` directories independently.

## 3. Backend Development Guidelines

- **No `try/catch` boilerplate:** The backend runs on Express 5. Do not wrap controller logic in `try/catch`. Throw `ApiError` instances and let the native promise rejection pipe to `errorMiddleware.js`.
- **Thin Controllers:** Controllers extract `req.body` and return `res.status().json()`. Do not put business logic or Mongoose queries in controllers. Move them to the `src/services/` layer.
- **Transactions:** Any workflow that mutates multiple collections (e.g., deducting inventory AND creating an order) MUST be wrapped in a Mongoose `ClientSession` transaction.
- **Read Operations:** If a Mongoose query does not require virtuals or document methods (e.g., fetching a product list), you MUST chain `.lean()` to the query to minimize garbage collection overhead.

## 4. Frontend Development Guidelines

- **State Management:** Do not use Redux. All server state (data fetched from the API) MUST be managed using TanStack React Query.
- **Form Validation:** All forms must use `react-hook-form` paired with `zod` for strict client-side validation.
- **Styling:** Use Tailwind CSS utility classes. For complex components, leverage `shadcn/ui` primitives. Merge dynamic classes using the `cn()` utility located in `src/lib/utils.js`.
- **Token Handling:** Never read or write the `HttpOnly` refresh cookie manually. Rely on the Axios interceptor in `src/api/axiosClient.js` to handle token rotation seamlessly.

## 5. Pull Request Process

1. Create a feature branch from `main`: `git checkout -b feature/your-feature-name`
2. Commit your changes. Write clear, descriptive commit messages.
3. Ensure the code passes all linters and tests (if configured).
4. Open a Pull Request against `main`. 
5. In the PR description, explicitly state:
   - What the PR does.
   - Any new environment variables required.
   - Any database schema migrations or required indexing.

## 6. Code Review Standards
Reviewers will look for:
- Correct separation of concerns (MVC architecture).
- Security (e.g., preventing mass assignment via `validateAllowedFields`).
- Performance (e.g., properly batching cron jobs or using Redis for expensive queries).
