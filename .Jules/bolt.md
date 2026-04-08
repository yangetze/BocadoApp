## 2025-02-14 - Optimize base/super recipe query performance with DB indexes
**Learning:** Adding a composite index on frequently queried fields across major entities drastically improves database read performance when the data grows. Prisma's `@@index([field1, field2(sort: Desc)])` syntax supports sorting directives which aligns exactly with backend controllers ordering the result.
**Action:** When creating new core entities in the schema that are consistently accessed by `userId` and ordered by `createdAt` descending, we should include the composite index directly in the model definition.
## 2025-04-06 - React.memo requires useCallback in parents
**Learning:** Wrapping components in `React.memo` (like `BuilderHeader`) is useless if the parent component passes unmemoized function props. `React.memo` performs a shallow comparison, and new function references on every parent render will cause the child to re-render anyway.
**Action:** When applying `React.memo` for performance, always ensure that any functions passed as props from the parent are memoized using `useCallback()`.
## 2025-04-07 - React.memo for @dnd-kit list items
**Learning:** Drag and drop interfaces using `@dnd-kit/core` can suffer severe performance degradation in long lists because dragging an item triggers re-renders across the entire context tree.
**Action:** Always wrap `SortableItem` and static drop targets (like `Canvas` or `Palette`) with `React.memo` to skip re-rendering sibling components while one is actively being dragged.

## 2025-04-08 - Search Case Insensitivity
**Learning:** Searches within the system (like filtering elements in the Palette) were occasionally case and accent sensitive, leading to missed results.
**Action:** Always implement case-insensitive and accent-insensitive search logic globally. Use `normalize("NFD").replace(/[\u0300-\u036f]/g, "")` to ensure consistent and robust filtering.

## 2024-11-20 - [Mobile UX Layout Order]
 **Learning:** [On mobile, the builder layout was complex to understand because the palette appeared before the context (title and metadata).]
 **Action:** [Always prioritize a top-down logical flow for mobile: 1) Context Title (Where am I?), 2) Initial Data/Metadata (Name, Total), 3) Content/Items List, 4) Add Button that opens a modal/drawer for selecting new items. Ensure quantity modifiers are inline with the loaded items.]
