<div align="center">
  <h1>MktHub Core</h1>
  <p>An event-driven commerce API built for multi-vendor marketplaces.</p>

  <div>
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
    <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
    <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
    <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  </div>
</div>

---

## Project Overview

**MktHub** is a multi-vendor e-commerce platform. While it includes a React 19 Single Page Application, the primary engineering focus is on the backend infrastructure. 

This repository serves as a reference architecture for building Node.js applications that handle transactional workflows—such as distributed inventory locking, asynchronous job processing, strict data atomicity, and idempotent integrations.

## Engineering Highlights

MktHub focuses on backend architecture to ensure data integrity and separation of concerns:

- **MongoDB Transactions:** Complex workflows (like order creation) are wrapped in native MongoDB `ClientSession` transactions. If inventory deduction or cart clearing fails at any point, the entire operation is rolled back, guaranteeing data consistency.
- **Express 5 Native Async:** The backend operates on `express: ^5.2.1`, natively handling asynchronous promise rejections and piping them directly to a centralized error middleware. This eliminates `try/catch` boilerplate in the controllers.
- **Event-Driven Queues (BullMQ):** Heavy I/O tasks like generating PDF invoices (`pdfkit`) or dispatching SMTP emails (`nodemailer`) are offloaded to Redis-backed queues. Isolated worker processes consume these jobs without blocking the main Express HTTP thread.
- **Cache-Aside Architecture:** Product catalog reads are cached using Redis. Mongoose queries utilize `.lean()` to bypass Mongoose document instantiation overhead.
- **Idempotent Webhooks & Late Captures:** Integrates with Razorpay. Webhook endpoints enforce raw body parsing and HMAC SHA-256 signature verification. A "Late Capture Refund" mechanism automatically initiates a refund if Razorpay processes a payment *after* a `node-cron` scheduler expires the checkout session.
- **Payload Security:** Global JSON payload limits (10kb) restrict request sizes. Route-specific `express-rate-limit` instances defend authentication routes, and a `validateAllowedFields` middleware rejects unexpected payload keys.

## Technology Stack

| Category | Technologies |
| :--- | :--- |
| **Backend API** | Node.js, Express.js 5, REST Architecture |
| **Database & ODM** | MongoDB, Mongoose 8 |
| **Caching & Queuing** | Redis, BullMQ |
| **Background Jobs** | Node-cron, Custom Worker Processes |
| **Authentication** | JSON Web Tokens (JWT), Bcrypt, HttpOnly Cookies |
| **Storage & Assets** | Cloudinary, Multer |
| **Payments** | Razorpay SDK, Webhooks |
| **Frontend Client** | React 19, Vite, TailwindCSS, shadcn/ui, TanStack Query |
| **DevOps & Infrastructure** | Docker, Docker Compose, Nginx, AWS EC2, GitHub Actions |

## System Architecture

The system utilizes a decoupled, event-driven architecture where the React SPA interacts with the API via an Nginx reverse proxy. The API relies on MongoDB for persistent state and Redis for caching and message brokering.

### Key System Design Patterns
- **Event-Driven Architecture:** Heavy I/O tasks (like PDF generation and emails) are decoupled from the main HTTP thread using Redis and BullMQ, allowing the API to remain highly responsive.
- **Cache-Aside Pattern:** High-read data like the product catalog is cached in Redis. The application checks the cache first, falling back to MongoDB on a cache miss.
- **Transactional Consistency:** Distributed operations (e.g., locking inventory and creating an order) are wrapped in MongoDB ACID transactions to ensure atomicity.
- **Reverse Proxy / API Gateway Pattern:** Nginx sits in front of the application, terminating SSL and routing traffic appropriately to the React frontend or Node.js API.
- **Idempotency:** Webhook endpoints (e.g., Razorpay) process payments safely, ensuring that duplicate webhook events do not result in double-processing.
- **Eventual Consistency:** Background cron jobs periodically reconcile state (like releasing abandoned inventory) without blocking synchronous user flows.

```mermaid
graph TD
    Client[Web Browser] -->|HTTPS 443| Nginx[Nginx Proxy Container]
    
    subgraph Docker Compose Network
        Nginx -->|Route /*| Frontend[Frontend Container: React SPA]
        Nginx -->|Route /api/*| API[Backend Container: Express 5 API]
        
        API -->|Cache & Message Broker| Redis[(Redis Container)]
        Redis -->|Consume Jobs| Workers[Background Workers]
    end
    
    Workers -->|Generate Invoice| PDF[pdfkit]
    Workers -->|Send Email| SMTP[Nodemailer]
    
    API -->|Mongoose ODM Transactions| DB[(MongoDB Atlas Cloud)]
    Cron[Node-Cron Scheduler] -->|Revert Abandoned Carts| DB
    API -->|HMAC Webhooks| Razorpay[Razorpay API]
```

[Read more about the System Architecture → docs/architecture.md](docs/architecture.md)

## Frontend SPA Architecture

The React client acts as the consumer of the API, utilizing:
- **TanStack React Query:** Manages server state and performs request deduplication.
- **Axios Interceptors:** A background Token Refresh flow detects `401 Unauthorized` responses, exchanges the `HttpOnly` refresh cookie for a new JWT via the `/refresh` endpoint, and retries the original request.
- **Radix & Tailwind:** Uses `shadcn/ui` for unstyled primitives integrated with Tailwind classes.

[Read more about the Frontend Architecture → docs/frontend.md](docs/frontend.md)

## Production Infrastructure

The repository is configured for containerized deployment.
- A **Double Nginx Proxy** architecture terminates SSL (via Certbot) and routes `/api/` traffic to Node.js while serving the React SPA from a multi-stage Alpine container.
- The CI/CD pipeline leverages **GitHub Actions** (`appleboy/ssh-action`) for deployment automation on AWS EC2.

[Read more about Deployment → docs/deployment.md](docs/deployment.md)

## Documentation Index

Explore the `docs/` directory for deep-dive technical explanations of the system's architecture and engineering decisions.

- [Architecture (`docs/architecture.md`)](docs/architecture.md) - System topology and design patterns.
- [Frontend (`docs/frontend.md`)](docs/frontend.md) - React Query, Axios interceptors, and SPA state management.
- [API Design (`docs/api.md`)](docs/api.md) - Express 5 native async, JSend formatting, and thin controllers.
- [Authentication (`docs/authentication.md`)](docs/authentication.md) - Stateless JWT and HttpOnly cookie strategies.
- [Authorization (`docs/authorization.md`)](docs/authorization.md) - Role-based access control implementations.
- [Database (`docs/database.md`)](docs/database.md) - Mongoose schemas, indexes, and ACID transactions.
- [Redis (`docs/redis.md`)](docs/redis.md) - Cache-aside patterns and TTL strategies.
- [BullMQ (`docs/bullmq.md`)](docs/bullmq.md) - Message queues and background workers.
- [Payments (`docs/payment.md`)](docs/payment.md) - Razorpay integration and idempotent webhooks.
- [Deployment (`docs/deployment.md`)](docs/deployment.md) - Docker, Nginx double-proxy, and GitHub Actions CI/CD.
- [Security (`docs/security.md`)](docs/security.md) - Rate limiting, validation, payload capping, and HMAC.
- [Performance (`docs/performance.md`)](docs/performance.md) - Mongoose `.lean()`, max pagination limits, and latency reduction.
- [Project Structure (`docs/project-structure.md`)](docs/project-structure.md) - Detailed breakdown of the codebase organization.
- [Contributing (`docs/contributing.md`)](docs/contributing.md) - Guidelines for submitting pull requests.

## Quick Start

### 1. Environment Configuration
MktHub uses **MongoDB Atlas** for database persistence (there is no local MongoDB container) and **Redis** for caching/queues. You must configure your environment variables before starting.

Create a `backend/.env` file with the following required keys (you can leave Redis as-is for local docker):

```env
PORT=3000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0...
JWT_SECRET=your_super_secret_jwt_string

RAZORPAY_KEY_ID=rzp_test_xxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

EMAIL_USER=your_email@gmail.com
EMAIL_APP_PASSWORD=your_app_password

REDIS_HOST=redis
REDIS_PORT=6379

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

FRONTEND_URL=http://localhost:5173
```

Create a `frontend/.env.development` file:
```env
VITE_API_URL=http://localhost:3000/api
```

### 2. Local Development (Dockerized - Recommended)
The easiest way to develop locally is using the provided development compose file, which spins up the Frontend, Backend, and a local Redis container with hot-reloading enabled via Docker volumes.

```bash
# Start the entire dev stack (Frontend, Backend, Redis)
docker compose -f docker-compose.dev.yml up --build
```
*Frontend will be available at `http://localhost:5173` and Backend at `http://localhost:3000`.*

### 3. Alternative: Native Node.js Dev
If you prefer running the servers natively using `npm run dev`, you only need to spin up Redis in Docker.
*(Note: Ensure you change `REDIS_HOST=127.0.0.1` in your `backend/.env` for native mode)*

```bash
# Start a standalone Redis container
docker run -d -p 6379:6379 redis:7-alpine

# In terminal 1 (Backend)
cd backend
npm install && npm run dev

# In terminal 2 (Frontend)
cd frontend
npm install && npm run dev
```

### 4. Production Deployment
```bash
# Spin up the production optimized containerized infrastructure (including Nginx)
docker compose up --build -d
```

## License

[MIT](https://choosealicense.com/licenses/mit/)
