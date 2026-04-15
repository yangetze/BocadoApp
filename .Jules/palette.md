## 2026-04-11 - Correcciones en Edición de Recetas Base

**Learning:** Al usar el mismo componente (\`BuilderHeader\`) tanto para la creación como para la edición de una entidad (como "Receta Base", "Súper Receta" o "Presupuesto"), los títulos descriptivos estáticos pueden generar confusión. Además, es vital que las propiedades de los datos extraídos de la interfaz mapeen exactamente con la base de datos (e.g. \`quantity\` vs \`quantityNeeded\`), de otro modo pueden persistir como nulos o mostrarse incorrectamente.

**Action:** Se actualizó \`BuilderHeader.jsx\` para que renderice un título contextual si \`isEditing\` es verdadero, reflejando así el estado del sistema en la UI ("Modificar Receta Base"). De igual manera, se corrigió en \`useBuilder.js\` la persistencia de los ingredientes para las recetas base, utilizando \`quantity\` en vez del atributo propio de súper recetas (\`quantityNeeded\`).
## 2025-04-10 - Explicit Input-Label Association for Accessibility in Modals
**Learning:** In dynamically generated forms like presentation inputs within modals, failing to link labels with inputs using `id` and `htmlFor` degrades accessibility and usability. Screen readers fail to announce the field name, and users cannot click the label to focus the input.
**Action:** Ensure all dynamically rendered form inputs are correctly paired with their `label` elements using unique or clearly identifiable `id`s and `htmlFor`s.

## 2025-04-11 - Accessible Icon Buttons for Modals
**Learning:** Modal close buttons that use only an SVG icon without text or an accessible label (`aria-label`) are completely invisible to screen readers, leaving users stuck inside a modal without a clear way to dismiss it.
**Action:** Ensure that all close buttons (`X` or custom SVG paths) in modals are equipped with `aria-label="Cerrar modal"` or similar to provide a semantic action for assistive technologies.

## 2025-04-13 - Mobile Floating Action Button (FAB) Consistency
**Learning:** In list views meant for both mobile and desktop (e.g. BudgetList), failing to hide the desktop primary action button and failing to provide a Floating Action Button (FAB) negatively impacts mobile UX. Desktop buttons take up too much vertical space, while a FAB stays consistently accessible as the user scrolls.
**Action:** Always verify that every list view module uses `hidden md:flex` for the primary "Create/Add" action on desktop, and include a corresponding mobile FAB (`md:hidden fixed bottom-20 right-4 z-40`) with an appropriate `aria-label`.

## 2025-04-15 - Standardize Primary Action Buttons and Mobile FABs
**Learning:** Found that primary creation actions in lists were inconsistent across different views. Some used text, some used text with an icon, and styling (padding, typography) varied. On mobile, some buttons were standard floating icons (`w-14 h-14 rounded-full`) but others were full-width or pill-shaped. Consistent styling prevents users from hesitating or second-guessing primary actions in a complex UI.
**Action:** Standardized all primary list-creation buttons to match a robust, high-contrast, Slate Gray template (`bg-slate-gray text-white px-5 py-2.5 rounded-xl font-medium ... text-sm`) with a leading `<Plus w-4 h-4 />` icon for desktop. For mobile screens, strictly enforced a `fixed bottom-20 right-4 z-40` Floating Action Button (FAB) with a `<Plus w-6 h-6 />` icon. This satisfies both accessibility and visual consistency across `BaseRecipeList`, `SuperRecipeList`, `BudgetList`, and `IngredientManager`.

## 2025-04-15 - Disable Other Form Elements on Specific Edit Views
**Learning:** In contexts where a user manages sub-items within a form (like editing a specific `Presentation` from a list of presentations within an `Ingredient`), if the business rule specifies that only one specific property (e.g. `cost`) should be editable once added, leaving all fields active can lead to data integrity confusion and unintended overwrites.
**Action:** Use specific local state (e.g., `editingPresentationIndex`) to conditionally pass the `disabled` property to sub-form inputs. This directs the user's attention exactly to what can be edited. Apply appropriate disabled styling (`disabled:bg-gray-100 disabled:text-gray-500`) to reinforce the visual feedback.

## 2025-04-16 - Accessible Icon Buttons and Links in Administrative Views
**Learning:** Found that secondary navigation and actions such as "Back" (e.g. `Link` with `<ArrowLeft />`) and state toggles (e.g. user status `<button>` with `<CheckCircle2 />` or `<XCircle />`) were missing text and did not provide `aria-label`s, rendering them inaccessible to screen readers.
**Action:** Added contextual `aria-label`s to all icon-only interactive elements in `AdminDashboard.jsx`. For elements like a status toggle, the `aria-label` explicitly indicates the action that will occur if pressed, rather than the current status (e.g. `Bloquear acceso` or `Permitir acceso`), helping users understand the consequence of the interaction. Also added `aria-label="Buscar usuarios"` to the search input.
