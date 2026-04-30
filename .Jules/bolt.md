## 2024-05-19 - Frontend O(N) DOM Re-rendering During Debounced Search
**Learning:** Even if an API search is debounced, capturing the raw input value into React state (e.g., `setSearchQuery(e.target.value)`) triggers a render on every keystroke. If a large list maps over its data array during this render without memoization, it causes O(N) DOM reconciliations per keystroke, leading to severe input lag.
**Action:** Always wrap the list-rendering logic (e.g., `items.map(...)`) in a `useMemo` hook that depends on the `items` array rather than the `searchQuery`, and ensure event handlers passed to the list items are wrapped in `useCallback`. This safely bypasses list re-renders during active typing.

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

## 2025-04-16 - PostgREST Implicit Access to Public Schema
 **Vulnerability:** When a backend is hosted on a PostgreSQL instance managed by Supabase, the Supabase Data API (PostgREST) is active by default. If Row Level Security (RLS) is not explicitly enabled on public tables, the PostgREST API exposes full read/write access to the `public` schema. This allows an attacker to bypass the custom Node.js/Express API completely and directly query or manipulate the database using the unauthenticated PostgREST API when `anon` key or project URL is known.
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
