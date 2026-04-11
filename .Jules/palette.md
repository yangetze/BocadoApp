## 2026-04-11 - Correcciones en Edición de Recetas Base

**Learning:** Al usar el mismo componente (\`BuilderHeader\`) tanto para la creación como para la edición de una entidad (como "Receta Base", "Súper Receta" o "Presupuesto"), los títulos descriptivos estáticos pueden generar confusión. Además, es vital que las propiedades de los datos extraídos de la interfaz mapeen exactamente con la base de datos (e.g. \`quantity\` vs \`quantityNeeded\`), de otro modo pueden persistir como nulos o mostrarse incorrectamente.

**Action:** Se actualizó \`BuilderHeader.jsx\` para que renderice un título contextual si \`isEditing\` es verdadero, reflejando así el estado del sistema en la UI ("Modificar Receta Base"). De igual manera, se corrigió en \`useBuilder.js\` la persistencia de los ingredientes para las recetas base, utilizando \`quantity\` en vez del atributo propio de súper recetas (\`quantityNeeded\`).
