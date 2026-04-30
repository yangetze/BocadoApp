## 2024-04-09 - Ingredient Model Refactoring
 **Learning:** When calculating costs based on dynamic quantities rather than fixed per-unit costs, we must carefully migrate calculations across the full stack (backend logic, frontend components, and test scenarios) to respect the new structure, especially ensuring new fields like `globalPriceQuantity` do not cause division-by-zero errors.
 **Action:** Make sure to set a default fallback (e.g. `|| 1`) when dividing by quantity denominators introduced during refactors to prevent mathematical exceptions.

## 2025-04-09 - In-memory sort vs Database level sort
 **Learning:** Sorting data in memory (e.g. `rates.sort()`) after paginating a result set from the database (`take: limitNum`) causes non-deterministic pagination and potential data loss/duplication across pages if there are multiple items with the exact same values for the database sorting fields. The query will bring the first N elements from the database, then we sort those N elements in memory using another criteria, which does not guarantee correct ordering of the entire collection.
 **Action:** Always use Prisma's `orderBy` capability to offload multi-field tie-breaker sorting logic entirely to the database level `orderBy: [{ primaryField: 'desc' }, { relatedModel: { secondaryField: 'asc' } }]` before pagination applies.

## 2024-04-10 - O(N) Redundant string normalization in filter loops
 **Learning:** Normalizing a string (e.g. converting to lowercase, removing accents) inside a `.filter()` iteration that compares against another string that is also normalized *inside* the loop causes redundant operations. If the search query doesn't change during the loop, normalizing it per-item is an O(n) operation that could be O(1).
 **Action:** Always extract invariant operations (like normalizing the search query) OUTSIDE the `.filter()` loop, and memoize the entire filtered result using `useMemo` to prevent recalculations on unrelated re-renders.

## 2026-04-10 - Memoization of Nested Recipe Costs
 **Learning:** In complex recipe hierarchies, the same sub-recipe (Base Recipe) can be reused multiple times within a single Super Recipe. Recalculating the cost by iterating over nested ingredients for each occurrence is inefficient.
 **Action:** Implement a request-scoped cache (e.g., using a ) within cost calculation controllers to store and reuse results for the same Base Recipe ID.

## 2026-04-10 - Memoization of Nested Recipe Costs
 **Learning:** In complex recipe hierarchies, the same sub-recipe (Base Recipe) can be reused multiple times within a single Super Recipe. Recalculating the cost by iterating over nested ingredients for each occurrence is inefficient.
 **Action:** Implement a request-scoped cache (e.g., using a `Map`) within cost calculation controllers to store and reuse results for the same Base Recipe ID.
## 2026-04-11 - Adherence to Strict Constraints
 **Learning:** When instructed to make ONE optimization, do not get sidetracked fixing unrelated ESLint errors in configuration files or unrelated components, as this violates the constraints and can introduce regressions.
 **Action:** Fix only the targeted component, and if tests/lints fail due to pre-existing issues outside the scope, ignore them or isolate the fix strictly.
## 2026-04-13 - [Optimized React Filtering Performance]
**Learning:** Found an anti-pattern in the frontend filtering code where `.toLowerCase()` was executed multiple times inside an `O(N)` loop on every render, without memoization.
**Action:** When filtering lists in React, especially based on a search term, always normalize the search term outside the loop and wrap the filtering logic in `useMemo` to prevent expensive recalculations and garbage collection churn.
## 2024-04-13 - Redundant Code Changes (Already Mitigated)
 **Learning:** If an assigned issue or vulnerability is found to already be mitigated or resolved in the existing codebase (e.g., removing a `console.log`), do not apply redundant or unnecessary code changes. Document the finding and conclude the task.
 **Action:** Prioritize reviewing the codebase for existing fixes before applying new ones to avoid redundant commits.
## 2026-04-15 - Unnecessary API fetches in useCallback
**Learning:** Found a performance anti-pattern where a \`useCallback\` hook managing pagination and fetching (e.g. \`loadData\`) had its dependencies set to include pagination state variables (\`page\`, \`startDate\`, etc.). Because \`loadData\` was also passed as a dependency to the \`useEffect\` that called it, every pagination change re-created \`loadData\`, triggering the \`useEffect\` and unnecessarily fetching static data (like currencies) along with the paginated data.
**Action:** Extract static data fetching (like currencies) into its own \`useEffect\` that runs only on mount. Refactor the pagination-dependent \`loadData\` to only accept pagination parameters as arguments, removing them from its dependency array to prevent it from being re-created and causing redundant API calls.
## 2024-11-20 - Group Payload Arrays Before Submitting to Prevent O(N) Redundant Inserts and Constraint Violations
**Learning:** When submitting drag-and-drop arrays to the backend where multiple identical items are allowed on the canvas (e.g., adding two "Eggs" to a recipe), submitting them as separate objects can cause unique constraint DB violations (like `P2002` on `[baseRecipeId, ingredientId]`) and leads to redundant insert statements.
**Action:** Always pre-aggregate identical item IDs into a grouped payload using `.reduce()` on the frontend before saving. This converts $O(N)$ repeated records into an $O(1)$ group, shrinking payload size and preventing DB constraint crashes.
## 2026-04-17 - [Database Search Optimization]
**Learning:** In Prisma schema design, performing `contains: search, mode: 'insensitive'` queries on unindexed text fields (like `name` or `brand`) across large datasets like Ingredients and Recipes creates significant CPU overhead and slow response times because it forces full table scans.
**Action:** Always add `@@index([fieldName])` in the Prisma schema for columns that are frequently used in `contains` or `startsWith` text-search operations (e.g., search bars in the frontend) to improve database lookup performance and prevent unnecessary application-side filtering.
## 2025-04-17 - Loop Optimization in Cost Calculations
**Learning:** For performance-critical code in Node.js, standard indexed `for` loops can be measurably faster than `for...of` loops, especially when dealing with nested iterations over large datasets (e.g., ingredients within base recipes within super recipes). The overhead of the iteration protocol in `for...of` adds up.
**Action:** Use standard indexed `for` loops in hot paths like `calculateSuperRecipeCost` to minimize execution time.
## 2026-04-18 - [Avoid Cross-Boundary String Matching]
**Learning:** When optimizing React filtering performance by pre-computing search strings for multiple fields, concatenating them into a single `_searchString` (e.g., `_searchString: ${u.username} ${u.email}`) introduces a bug where a search term could unintentionally match across boundaries (e.g., matching the space you intentionally injected).
**Action:** When pre-computing normalized fields for list filtering, keep the fields separate (e.g., `_normalizedUsername`, `_normalizedEmail`) and maintain the distinct logical `||` checks during filtering to ensure accurate results.
## 2024-05-19 - Frontend O(N) DOM Re-rendering During Debounced Search
**Learning:** Even if an API search is debounced, capturing the raw input value into React state (e.g., `setSearchQuery(e.target.value)`) triggers a render on every keystroke. If a large list maps over its data array during this render without memoization, it causes O(N) DOM reconciliations per keystroke, leading to severe input lag.
**Action:** Always wrap the list-rendering logic (e.g., `items.map(...)`) in a `useMemo` hook that depends on the `items` array rather than the `searchQuery`, and ensure event handlers passed to the list items are wrapped in `useCallback`. This safely bypasses list re-renders during active typing.
## 2026-04-19 - Added Favorite Brand Presentation feature
**Learning:** Adding a boolean indicator correctly toggles in a list by using `map` array function and updating state.
**Action:** Always maintain UI representation syncing with database scheme correctly when managing inner lists inside modal.
## 2026-04-20 - Unknown Prisma Argument Fix
 **Learning:** When attempting to update a Prisma model and encountering "Unknown argument", the database fields need to be properly defined in `schema.prisma`. In this case, `defaultCurrency`, `companyLogo`, `policies`, and `paymentMethods` were missing on the `User` model despite being processed in the controller.
 **Action:** Define the missing fields in `schema.prisma`, generate the client using `npx prisma@X.X.X generate`, and create a migration using `npx prisma@X.X.X migrate dev` (or manually creating a SQL migration and pushing to origin for schema parity in edge cases where direct DB connections aren't feasible during automated runs).
## 2026-04-20 - Fix missing modal block for budget saving
 **Learning:** In complex React state machines (like `Builder.jsx`), a disconnected end-step component (like a modal that finalizes a network request) can silently break the entire flow. Even if the logic is prepared in a hook, the UI component must be physically rendered in the component tree to be reachable by the user.
 **Action:** Always trace the full logic path from user click to network request. If a state transition relies on a component being mounted (like `isOpen` for a modal), ensure that component is imported and rendered.
## 2026-04-21 - Fix budget brand selections load
 **Learning:** React state elements array needs proper dependency management and dependency updates mapped manually if initial array from `editingItem` differs from API payload structure (e.g., brandSelections mapped directly without using the parent id wrapper during load). Fixed the `useEffect` handling these.
 **Action:** For complex builders setting initial state via `useEffect`, explicitly handle all dependencies and clear all existing states first when the target object resets.
## 2026-04-21 - SettingsManager Infinite Render Loop
**Learning:** Jest tests for `SettingsManager` failed with "Maximum update depth exceeded" due to a `useEffect` that had the whole `user` context object in its dependency array. The mock AuthProvider returned a new `user` object reference on every render, triggering the `useEffect` continuously which updated form state, causing another render.
**Action:** When mocking React context values (like `user` in `useAuth`), always wrap complex objects in `useMemo` within the mock implementation to stabilize their references across renders, preventing infinite `useEffect` loops in consumer components. Also, prefer checking primitive values (like `user?.id`) in `useEffect` dependencies instead of whole objects when initializing state to ensure test stability and avoid unnecessary updates.
## 2024-04-22 - [Pre-computed normalized strings for filtering]
**Learning:** Performing expensive string manipulation (like `normalizeString` which involves regex and `.normalize()`) inside a `filter` loop on every keystroke causes O(N) redundant operations, leading to input lag when handling large lists in components like `Palette.jsx`.
**Action:** Always pre-calculate these normalized strings when the underlying data (`items` array) changes, using a separate `useMemo`. Then, use these pre-computed values during the actual filtering `useMemo` that depends on `searchQuery`, turning the operation into an O(1) property lookup per item.
## 2024-05-20 - Use O(1) Map instead of O(N^2) reduce for groupings
**Learning:** Using `reduce` and `find` together to group objects is `O(N^2)` time complexity. While it "prevents redundant inserts" at the database level by shrinking the payload, it is algorithmically unoptimized.
**Action:** Always prefer using a `Map` when aggregating/grouping arrays in Javascript for $O(N)$ total time complexity.
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
## 2026-04-24 - Prisma P2002 Information Leakage / 500 Error on Profile Updates
**Vulnerability:** The `updateUser` controller failed to explicitly catch Prisma `P2002` (Unique constraint failed) errors. When a user attempted to change their email or username to one already in use, the server threw an unhandled exception, resulting in a `500 Internal Server Error`.
**Learning:** Returning a 500 status for validation or uniqueness errors represents bad practice and can leak underlying infrastructure details (e.g., that a database constraint triggered an exception instead of application logic).
**Prevention:** Consistently catch expected Prisma error codes (like `P2002` for unique constraints and `P2025` for not found errors) across *all* controllers (creation, modification) and translate them into standard HTTP client errors (`400 Bad Request` or `404 Not Found`).

## 2024-04-23 - [Input Length Validation Missing in Controllers]
**Vulnerability:** Input fields such as `name` and `measurementUnit` in controller functions (e.g., `createIngredient`, `updateIngredient`) lacked maximum length validations.
**Learning:** This exposes the application to Denial of Service (DoS) attacks or database insertion errors by allowing excessively large payloads.
**Prevention:** Implement explicit `typeof` and `length` checks (e.g., `name.length > 255`) for all incoming string fields in API controllers before passing them to the database or processing them.
## 2024-04-26 - Mitigate User Enumeration Timing Attack on Login
**Vulnerability:** A timing attack (user enumeration) vulnerability existed on the login endpoint (`apps/backend/src/controllers/authController.js`). When a user was not found, the function returned early with a 401 response without executing the expensive `bcrypt.compare` operation. This allows an attacker to measure the response time and determine whether a given username or email exists in the database.
**Learning:** The previous implementation failed to maintain consistent response times across all authentication paths. This is a common gap where early returns for non-existent users leak information. It's crucial to always equalize processing time when comparing hashes or secrets.
**Prevention:** Pre-compute a DUMMY_HASH at module initialization. If a user is not found, execute a dummy password comparison (`await bcrypt.compare(password, DUMMY_HASH)`) before returning the 401 response. Ensure that test files properly mock `bcrypt.hashSync` if it's introduced at the top level of the module to prevent test execution failures.
