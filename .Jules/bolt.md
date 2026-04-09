## 2024-04-09 - Ingredient Model Refactoring
 **Learning:** When calculating costs based on dynamic quantities rather than fixed per-unit costs, we must carefully migrate calculations across the full stack (backend logic, frontend components, and test scenarios) to respect the new structure, especially ensuring new fields like `globalPriceQuantity` do not cause division-by-zero errors.
 **Action:** Make sure to set a default fallback (e.g. `|| 1`) when dividing by quantity denominators introduced during refactors to prevent mathematical exceptions.

## 2025-04-09 - In-memory sort vs Database level sort
 **Learning:** Sorting data in memory (e.g. `rates.sort()`) after paginating a result set from the database (`take: limitNum`) causes non-deterministic pagination and potential data loss/duplication across pages if there are multiple items with the exact same values for the database sorting fields. The query will bring the first N elements from the database, then we sort those N elements in memory using another criteria, which does not guarantee correct ordering of the entire collection.
 **Action:** Always use Prisma's `orderBy` capability to offload multi-field tie-breaker sorting logic entirely to the database level `orderBy: [{ primaryField: 'desc' }, { relatedModel: { secondaryField: 'asc' } }]` before pagination applies.
