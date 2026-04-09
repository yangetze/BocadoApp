## 2025-01-16 - Prevent Prisma IDOR with Nested Operations
**Vulnerability:** Insecure Direct Object Reference (IDOR) with nested relations.
**Learning:** Using `userId` inside `where` or nested operations in Prisma's `update` and `delete` can fail to properly authorize if the table lacks a compound unique constraint or if it's updating nested relations inside a transaction.
**Prevention:** Always explicitly fetch the parent record via `findUnique` and perform an in-memory verification (`if (record.userId !== req.user.id)`) before attempting an update or delete, especially when using `$transaction`. Return a 404 Not Found (not 403) to prevent information leakage.

## 2026-04-09 - Prevent Overly Permissive CORS Configurations
**Vulnerability:** The application was using an overly permissive CORS configuration (`app.use(cors())` with no arguments), which allowed any origin to make cross-origin requests to the backend API.
**Learning:** This is a security risk as it could allow unauthorized websites or malicious actors to interact with the API on behalf of a user. Furthermore, hardcoding a single development origin (`http://localhost:5173`) in an attempt to restrict CORS can cause severe production regressions by blocking valid production traffic.
**Prevention:** Always restrict CORS configurations explicitly. Use environment variables (like `FRONTEND_URL`) to dynamically specify allowed origins for different deployment environments, falling back to development defaults when the variable is not set.
