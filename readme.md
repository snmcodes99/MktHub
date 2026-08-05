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

The system utilizes a decoupled architecture where the React SPA interacts with the API via an Nginx reverse proxy. The API relies on MongoDB for persistent state and Redis for caching and message brokering.

```mermaid
graph TD
    Client[React 19 / Vite SPA] -->|HTTPS| Proxy[Nginx Container]
    
    subgraph Express HTTP Layer
        Proxy -->|/api/*| API[Express 5 API: app.js]
        API <-->|Mongoose ODM (Transactions)| DB[(MongoDB Atlas)]
        API <-->|redis.utils.js| Cache[(Redis)]
    end
    
    subgraph Background Processing Layer
        Cache -->|BullMQ Jobs| Workers[startWorkers.js]
        Workers -->|invoiceQueue| PDF[pdfkit]
        Cron[node-cron] -->|Audits Expirations| DB
    end

    API -->|HMAC Verification| Razorpay[Razorpay Webhooks]
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

### Local Development
```bash
# Clone the repository
git clone https://github.com/snmcodes99/mkthub.git

# Install backend dependencies
cd backend
npm install
npm run dev

# Install frontend dependencies (in a new terminal)
cd ../frontend
npm install
npm run dev
```

### Production Deployment
```bash
# Spin up the entire containerized infrastructure
docker compose up --build -d
```

## License

[MIT](https://choosealicense.com/licenses/mit/)
