## 2025-02-14 - Optimize base/super recipe query performance with DB indexes
**Learning:** Adding a composite index on frequently queried fields across major entities drastically improves database read performance when the data grows. Prisma's `@@index([field1, field2(sort: Desc)])` syntax supports sorting directives which aligns exactly with backend controllers ordering the result.
**Action:** When creating new core entities in the schema that are consistently accessed by `userId` and ordered by `createdAt` descending, we should include the composite index directly in the model definition.
## 2025-04-06 - React.memo requires useCallback in parents
**Learning:** Wrapping components in `React.memo` (like `BuilderHeader`) is useless if the parent component passes unmemoized function props. `React.memo` performs a shallow comparison, and new function references on every parent render will cause the child to re-render anyway.
**Action:** When applying `React.memo` for performance, always ensure that any functions passed as props from the parent are memoized using `useCallback()`.
