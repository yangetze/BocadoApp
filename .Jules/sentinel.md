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

## 2024-05-24 - Maximum Input Length Validations
**Vulnerability:** Missing maximum length constraints on user inputs (e.g., username, email, name, identification number) during registration and profile updates.
**Learning:** While minimum length limits and format checks (e.g., regex for emails) were present, the absence of upper bounds could allow an attacker to send disproportionately large payload strings (Denial of Service risk) or cause unpredictable database string truncation exceptions.
**Prevention:** Always enforce both minimum and maximum length bounds on user-supplied strings at the application boundary, specifically within creation and modification endpoints. Utilize optional chaining (`?.`) when assessing the `.length` of fields that might be absent or `undefined` to prevent Unhandled Promise Rejections and Internal Server Errors (500) during updates.

## 2024-05-25 - [Insecure Direct Object Reference (IDOR) on Deletion Information Leakage]
**Vulnerability:** The `deleteBaseRecipe` and potentially other controllers evaluated constraints (like "is this recipe used elsewhere?") before verifying if the current user actually owned the target resource.
**Learning:** If a foreign user attempts to delete a resource they don't own, the system might return a 400 error ("cannot be deleted because it is in use") instead of a generic 404 ("not found"). This allows attackers to map out whether internal IDs exist and are active in other parts of the application.
**Prevention:** Always verify ownership (using `findUnique` comparing `userId`) and return a 404 immediately before performing any relational checks or executing transactions, regardless of whether you're about to use Prisma or `mockData`.
## 2024-04-20 - Prevent P2025 Information Leakage in Controller Deletions/Updates
 **Vulnerability:** Unhandled Prisma `P2025` errors during `delete` and `update` operations trigger generic `500 Internal Server Error` responses, leaking information about whether a resource exists to potential attackers.
 **Learning:** Prisma's `.delete` and `.update` methods throw an error if the targeted `where` clause (like an ID) does not exist, rather than failing silently or returning null. Relying on the global `catch` block for missing resources bypasses explicit 404 handling.
 **Prevention:** Always prefix destructive or state-changing operations with a `findUnique` query to verify existence (and ownership) explicitly, and return a semantic `404 Not Found` before executing the actual update/delete command.

## 2025-05-20 - [Insecure Direct Object Reference (IDOR) on Nested Brand Presentation Relation]
**Vulnerability:** The `createBudget` and `updateBudget` controllers only verified the ownership of the `ingredientId` when a user linked a `BrandPresentation` to a budget (`BudgetBrandSelection`). It did not verify the ownership of the `brandPresentationId` itself.
**Learning:** Checking ownership of just the parent entity's ID (ingredient) is insufficient if the user also passes an ID for a child entity (brand presentation) in the same payload. An attacker could pass a valid ingredient they own, but pair it with a `brandPresentationId` belonging to another user, thus linking and potentially leaking another user's brand data.
**Prevention:** Always verify the ownership of all foreign keys provided in a creation or update payload, including nested or child relations. Use relation queries like `prisma.brandPresentation.count({ where: { id: { in: ids }, ingredient: { userId: req.user.id } } })` to ensure the nested entity ultimately belongs to the requesting user.

## YYYY-MM-DD - [IDOR in updateBudget Dependency Checks]
**Vulnerability:** The `updateBudget` endpoint performed existence and permission checks on related entities (`superRecipes` and `brandSelections` via `count` queries using `userId`) before confirming if the user actually owned the parent `budget` being updated.
**Learning:** This ordering allowed an attacker to enumerate or verify the existence of super recipes or ingredients belonging to another user by attempting to update a budget with ID X (which they don't own) and observing whether the endpoint returns a 404 for missing ingredients/recipes versus a 404 for missing budget. Dependency validation leaked information before authorization.
**Prevention:** Always verify ownership of the primary resource (`budget`) immediately after extracting the ID and user token, before validating the relationships or structure of the incoming nested payload.
## 2026-04-22 - Missing Input Validation on Login Credentials
**Vulnerability:** The `login` endpoint in `authController.js` lacked maximum length validation for `loginId` and `password` fields.
**Learning:** While checking for string types prevents obvious type confusion attacks, missing upper bounds on inputs like passwords can lead to Denial of Service (DoS) vulnerabilities because bcrypt hashing is intentionally slow and computationally expensive. An attacker could send a massive string to exhaust server CPU.
**Prevention:** Always enforce reasonable maximum length limits (e.g., 255 characters) on login credentials *before* executing database queries or cryptographic operations.
