# Plan de Acción: Correcciones en Edición de Recetas Base

**Objetivo:**
- Al editar receta base o cualquier otra, el titulo reflejaba la creación ("Nueva...") en vez de edición ("Modificar..."). Se agregará esto al style guide y se cambiará el comportamiento del componente \`BuilderHeader\`.
- Al editar la receta base, las cantidades de los ingredientes se guardaban internamente como \`quantityNeeded\` en lugar de \`quantity\`, causando que se mostrasen como 0 al renderizarse.

## Tareas

- [x] Actualizar \`docs/frontend-styleguide.md\` indicando que el título del builder en el caso de ser una edición debe reflejar "Modificar...".
- [x] Actualizar el componente \`BuilderHeader.jsx\` para que al estar \`isEditing\` en verdadero muestre el título correspondiente para editar.
- [x] Corregir la lógica de construcción de datos (payload) en \`useBuilder.js\` para \`baseRecipe\` enviando el atributo esperado por el backend (\`quantity\` en lugar de \`quantityNeeded\`).
- [x] Actualizar \`useBuilder.test.js\` para reflejar el cambio en \`useBuilder.js\`.
- [x] Correr los test frontend y backend para evitar regresiones.

**Estado:** Completado
**Branch:** fix/base-recipe-builder-editing
