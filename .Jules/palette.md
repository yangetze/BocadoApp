## 2025-04-03 - Added ARIA labels to Icon Buttons
**Learning:** Screen readers announce nothing for `lucide-react` icons inside empty buttons, severely hindering a11y for core interactive components like drag-and-drop quantity modifiers and global settings dropdowns. Adding explicit `aria-label`s fixes this. Relying on `title` attribute isn't enough for robust accessibility.
**Action:** Always verify that icon-only buttons (`Trash2`, `Settings`, `ChevronDown`, `ChevronUp`) include a descriptive `aria-label`. For interactive toggles (like Settings dropdowns), use `aria-expanded` reflecting the state.

## 2025-04-05 - Added id and htmlFor to form inputs
**Learning:** Form inputs like inputs and selects must be explicitly linked to their corresponding `<label>` using matching `id` and `htmlFor` attributes to ensure screen readers correctly read out the field name and so clicking the label focuses the input field, which improves general usability.
**Action:** Always pair `<label>` and `<input>`/`<select>` using `id` and `htmlFor`.
## 2025-04-06 - Explicit Input-Label Association for Accessibility
**Learning:** Form controls (e.g., `<input>`, `<select>`) that are not explicitly linked to their corresponding `<label>` elements hinder accessibility. Screen readers cannot properly associate the label text with the input field, which degrades the experience for users relying on assistive technology. Moreover, explicitly linking them using `htmlFor` and `id` increases the click target area (clicking the label focuses the input).
**Action:** Always use matching `id` and `htmlFor` attributes to explicitly link labels with their associated inputs in forms. Also, remember to provide an `aria-label` attribute on inputs like search fields that lack visible labels.
## 2026-04-09 - Accessible Icon Buttons for Destructive Actions
**Learning:** A simple text "X" inside a button for destructive actions (like removing an item) is poor for both visual clarity and screen reader accessibility, as it lacks a semantic name and visual weight.
**Action:** Replace text "X" with standard `lucide-react` icons (like `Trash2` or `X`), and strictly pair them with `aria-label` and `title` attributes (e.g. "Eliminar presentación") to ensure both visual and assistive technology users understand the button's intent clearly.
