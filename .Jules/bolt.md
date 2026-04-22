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
