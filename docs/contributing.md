# Contributing Guidelines

## Strict Architectural Requirements

When submitting pull requests to mkthub, the following engineering rules must be strictly adhered to in order to maintain the integrity of the architecture.

### 1. The Controller-Service Boundary
**Rule:** No business logic or database queries are permitted inside `src/controllers/`.
- **Implementation Constraint:** If your PR adds `await Model.findOne()` or conditional business routing inside a controller file, it will be rejected. 
- **The Fix:** Move the logic into a dedicated file inside `src/services/`, and have the controller invoke the service method. This ensures the business logic remains unit-testable without mocking Express `req/res` objects.

### 2. Transactional Mutation
**Rule:** Any operation that modifies multiple collections simultaneously must use MongoDB sessions.
- **Implementation Constraint:** If you are building a feature that updates a `User` profile and simultaneously updates a `SellerRequest` status, you must wrap both `updateMany` or `save` operations inside a `mongoose.startSession()` block. If one fails, the other must abort.

### 3. Caching Mandates
**Rule:** Read-heavy endpoints must implement the Cache-Aside pattern.
- **Implementation Constraint:** If you add an endpoint to fetch a list of featured tags, you must wrap the controller logic using `getCache()` and `setCache()` from `src/utils/redis.utils.js`. Furthermore, you must identify where tags are mutated (e.g., the Admin Tag creation controller) and invoke `clearCachePattern()` to prevent stale data delivery.

### 4. Background I/O Offloading
**Rule:** Heavy CPU bounds and volatile network bounds (like API calls to external services) must not block the Express event loop.
- **Implementation Constraint:** If your PR adds a feature to generate a monthly CSV report, you may not execute the CSV generation synchronously in the service layer. You must create a new BullMQ queue, push the payload, and define a consumer inside `src/jobs/` to process the file in the background worker process.

### 5. Error Abstraction
**Rule:** Never use raw `res.status().json()` for errors.
- **Implementation Constraint:** Always `throw new ApiError(statusCode, message)` or pass it to `next()`. This guarantees the global `errorMiddleware.js` standardizes the JSON response payload.
