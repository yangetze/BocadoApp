## 2025-04-03 - Added ARIA labels to Icon Buttons
**Learning:** Screen readers announce nothing for `lucide-react` icons inside empty buttons, severely hindering a11y for core interactive components like drag-and-drop quantity modifiers and global settings dropdowns. Adding explicit `aria-label`s fixes this. Relying on `title` attribute isn't enough for robust accessibility.
**Action:** Always verify that icon-only buttons (`Trash2`, `Settings`, `ChevronDown`, `ChevronUp`) include a descriptive `aria-label`. For interactive toggles (like Settings dropdowns), use `aria-expanded` reflecting the state.

## 2025-04-05 - Added id and htmlFor to form inputs
**Learning:** Form inputs like inputs and selects must be explicitly linked to their corresponding `<label>` using matching `id` and `htmlFor` attributes to ensure screen readers correctly read out the field name and so clicking the label focuses the input field, which improves general usability.
**Action:** Always pair `<label>` and `<input>`/`<select>` using `id` and `htmlFor`.
