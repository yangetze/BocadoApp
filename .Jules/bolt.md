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
