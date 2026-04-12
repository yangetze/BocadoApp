## 2026-04-11 - Correcciones en Edición de Recetas Base

**Learning:** Al usar el mismo componente (\`BuilderHeader\`) tanto para la creación como para la edición de una entidad (como "Receta Base", "Súper Receta" o "Presupuesto"), los títulos descriptivos estáticos pueden generar confusión. Además, es vital que las propiedades de los datos extraídos de la interfaz mapeen exactamente con la base de datos (e.g. \`quantity\` vs \`quantityNeeded\`), de otro modo pueden persistir como nulos o mostrarse incorrectamente.

**Action:** Se actualizó \`BuilderHeader.jsx\` para que renderice un título contextual si \`isEditing\` es verdadero, reflejando así el estado del sistema en la UI ("Modificar Receta Base"). De igual manera, se corrigió en \`useBuilder.js\` la persistencia de los ingredientes para las recetas base, utilizando \`quantity\` en vez del atributo propio de súper recetas (\`quantityNeeded\`).
## 2025-04-10 - Explicit Input-Label Association for Accessibility in Modals
**Learning:** In dynamically generated forms like presentation inputs within modals, failing to link labels with inputs using `id` and `htmlFor` degrades accessibility and usability. Screen readers fail to announce the field name, and users cannot click the label to focus the input.
**Action:** Ensure all dynamically rendered form inputs are correctly paired with their `label` elements using unique or clearly identifiable `id`s and `htmlFor`s.

## 2025-04-11 - Accessible Icon Buttons for Modals
**Learning:** Modal close buttons that use only an SVG icon without text or an accessible label (`aria-label`) are completely invisible to screen readers, leaving users stuck inside a modal without a clear way to dismiss it.
**Action:** Ensure that all close buttons (`X` or custom SVG paths) in modals are equipped with `aria-label="Cerrar modal"` or similar to provide a semantic action for assistive technologies.
