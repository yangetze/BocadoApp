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

## 2026-04-10 - DolarAPI Integration Update and Defaults
**Vulnerability:** A missing parameter default mapping led to a hardcoded assumption about the API responses of DolarAPI, previously trying to scrape for 'oficial' from a source when an unexpected type was provided.
**Learning:** Default fallbacks when consuming external APIs with parameters should directly reflect the API's most robust or common endpoints natively. The new implementation cleanly evaluates whether a user wants parallel, euro or defaults to USD (CRIPTOYA_BCV).
**Prevention:** Always provide defensive handling when parsing third party arrays (e.g. `const rateData = data.find(item => item.fuente === sourceName) || data[0];`) and default correctly.
## 2026-04-11 - Replace `console.error` with `logger.error`
**Vulnerability:** Use of `console.error` inside Express.js controllers and middleware can lead to accidental exposure of raw error stack traces, which may contain sensitive database information, API keys, or application internals when caught or unhandled depending on the setup. It also circumvents application log formatting, meaning logs aren't processed via Winston.
**Learning:** Raw `console` methods break centralized logging strategies. Developers might rely on it for convenience but it misses the defense in depth an explicit structured logger affords.
**Prevention:** Always use the dedicated application logger (e.g., `logger.error`) in production code instead of raw `console` methods to ensure proper formatting, redaction, and transmission of logs without exposing internals to the user or unmonitored consoles.
## 2026-04-12 - Error message leakage and missing headers
**Vulnerability:** Leaking stack traces or internal messages to the API client, along with missing security HTTP headers
**Learning:** Developers should be careful not to output raw JS error object messages in express JSON response blocks. Missing default Express HTTP security headers means an attacker can use basic web exploitation.
**Prevention:** We should default to `res.status(500).json({ error: 'Internal server error' });`, and utilize the `helmet` express middleware immediately during application setup.

## 2024-04-13 - Overt Code Comments
**Learning:** Avoid leaving overt, identifiable comments in the code such as `// Security: Verify ownership before linking` for standard security checks.
**Action:** While code should be well-documented, loudly broadcasting security measures can inadvertently guide attackers to areas where similar checks might have been missed in older code. Self-documenting code and standard PR descriptions are a safer medium for this context.

## 2024-05-18 - Global Rate Limiter Added
**Vulnerability:** The application had rate limiting on authentication routes (/login, /register) but lacked a global rate limiter for all other API endpoints, leaving it susceptible to general DoS attacks or aggressive scraping.
**Learning:** While endpoint-specific rate limiting is crucial for sensitive routes (auth), a baseline global rate limiter is necessary as a defense-in-depth measure to protect server resources.
**Prevention:** Added a globalLimiter middleware using express-rate-limit and applied it to all routes under /api in index.js. Always configure a baseline rate limiter for all public-facing APIs.

## 2026-04-15 - Missing Input Validation on User Creation/Update
**Vulnerability:** The `createUser` and `updateUser` endpoints in `apps/backend/src/controllers/userController.js` lacked strict validation for `email` format and `username` length, unlike the `register` endpoint.
**Learning:** Security validations (like email format checks to prevent injection or malformed data, and minimum length checks) must be consistently applied across all endpoints that create or modify a resource, not just the public registration endpoint. An authenticated admin could inadvertently or maliciously submit invalid data.
**Prevention:** Implement consistent input validation logic across all relevant controllers. Consider using a centralized validation library (like Zod or Joi) or sharing validation functions to ensure parity between public and admin endpoints.
## 2026-04-16 - Prevent Public Exposure of Database via Supabase PostgREST
 **Vulnerability:** `rls_disabled_in_public` and `sensitive_columns_exposed` warnings in Supabase, leading to potential unauthorized direct access to Prisma-managed tables via the generic auto-generated PostgREST API when `anon` key or project URL is known.
 **Learning:** Even when the primary architecture relies entirely on a custom backend (Express + Prisma) for security, hosting on Supabase exposes a secondary attack surface because the built-in Data API (PostgREST) maps the `public` schema directly and relies on RLS. If RLS is disabled, data is exposed bypassing the custom backend completely.
 **Prevention:** For architectures where Supabase is strictly used as a raw Postgres host (accessed via connection strings by a trusted backend like Prisma), always run `ALTER TABLE "<schema>"."<table_name>" ENABLE ROW LEVEL SECURITY;` on all public tables without defining any policies. This ensures PostgREST defaults to completely blocking all external `anon` / `authenticated` access, while allowing Prisma (using the `postgres` admin role) to bypass RLS and operate normally.

## 2025-04-16 - Missing Authorization on Global Configurations
**Vulnerability:** The endpoints to manually set or sync global exchange rates (`POST /api/exchange-rates/manual` and `POST /api/exchange-rates/sync-api`) were protected by `verifyToken` but missing the `isAdmin` check, allowing any authenticated regular user to modify application-wide settings.
**Learning:** It is crucial to verify not only that a user is authenticated, but that they have the appropriate role (Authorization) for endpoints that mutate global state or administrative configurations that lack tenant boundaries.
**Prevention:** Always apply the `isAdmin` (or equivalent role-based) middleware to endpoints handling global resources. Routinely audit route definitions to ensure POST/PUT/DELETE actions on shared resources are restricted to administrators.
## 2026-04-17 - Prisma Nested Filtering Error
**Vulnerability:** Prisma query failed because `brand` was queried directly on `Ingredient` but it belongs to the nested relation `BrandPresentation`.
**Learning:** Nested relational fields must be filtered using relation filters like `some`, `every`, or `none` (e.g. `{ presentations: { some: { brand: { contains: search } } } }`).
**Prevention:** Check Prisma schema relations before querying nested fields.
