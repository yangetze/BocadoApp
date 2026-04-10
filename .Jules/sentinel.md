## 2025-01-16 - Prevent Prisma IDOR with Nested Operations
**Vulnerability:** Insecure Direct Object Reference (IDOR) with nested relations.
**Learning:** Using `userId` inside `where` or nested operations in Prisma's `update` and `delete` can fail to properly authorize if the table lacks a compound unique constraint or if it's updating nested relations inside a transaction.
**Prevention:** Always explicitly fetch the parent record via `findUnique` and perform an in-memory verification (`if (record.userId !== req.user.id)`) before attempting an update or delete, especially when using `$transaction`. Return a 404 Not Found (not 403) to prevent information leakage.

## 2026-04-09 - Prevent Overly Permissive CORS Configurations
**Vulnerability:** The application was using an overly permissive CORS configuration (`app.use(cors())` with no arguments), which allowed any origin to make cross-origin requests to the backend API.
**Learning:** This is a security risk as it could allow unauthorized websites or malicious actors to interact with the API on behalf of a user. Furthermore, hardcoding a single development origin (`http://localhost:5173`) in an attempt to restrict CORS can cause severe production regressions by blocking valid production traffic.
**Prevention:** Always restrict CORS configurations explicitly. Use environment variables (like `FRONTEND_URL`) to dynamically specify allowed origins for different deployment environments, falling back to development defaults when the variable is not set.
## 2024-05-18 - [Insecure Direct Object Reference (IDOR) on Relation Creation]
**Vulnerability:** The API allowed users to associate their models (like superRecipes and baseRecipes) with child entities (like ingredients) that belonged to other users because it did not verify the ownership of the provided IDs before creating the relation.
**Learning:** Checking ownership is critical not just when editing/deleting a primary record, but also when linking to secondary records via foreign keys provided by the user payload.
**Prevention:** Always verify the ownership of all foreign keys provided in a creation payload using `prisma.<model>.count({ where: { id: { in: ids }, userId: req.user.id } })` before executing the insert.
## 2024-05-18 - [Insecure Direct Object Reference (IDOR) on Relation Modification]
**Vulnerability:** The API allowed users to update existing models (like baseRecipes) with child entities (like ingredients) that belonged to other users because it did not verify the ownership of the provided ingredient IDs before creating the relation.
**Learning:** Checking ownership is critical not just when editing/deleting a primary record, but also when linking to secondary records via foreign keys provided by the user payload during an update operation.
**Prevention:** Always verify the ownership of all foreign keys provided in an update payload using `prisma.<model>.count({ where: { id: { in: ids }, userId: req.user.id } })` before executing the modification transaction.

## 2025-04-10 - Overly Permissive CORS Policy
**Vulnerability:** The CORS configuration allowed requests with no `Origin` header (e.g., from `curl` or mobile apps) by explicitly returning `callback(null, true)` when the origin was undefined.
**Learning:** While allowing no origin is often done to support non-browser clients, it creates a bypass that can be exploited if the API is intended to be restricted to specific web origins.
**Prevention:** Always require an `Origin` header in production CORS policies unless non-browser access is explicitly required and secured by other means (like API keys).
