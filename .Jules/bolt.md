## 2025-02-14 - Optimize base/super recipe query performance with DB indexes
**Learning:** Adding a composite index on frequently queried fields across major entities drastically improves database read performance when the data grows. Prisma's `@@index([field1, field2(sort: Desc)])` syntax supports sorting directives which aligns exactly with backend controllers ordering the result.
**Action:** When creating new core entities in the schema that are consistently accessed by `userId` and ordered by `createdAt` descending, we should include the composite index directly in the model definition.
