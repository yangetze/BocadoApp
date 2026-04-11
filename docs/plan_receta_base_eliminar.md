# Plan de Trabajo: Eliminar Recetas Base

## Estado actual
- Completado

## Branch
`feature/base-recipe-delete`

## Tareas

- [x] Actualizar `BaseRecipeManager` para mantener el estado `editingRecipe`.
- [x] Pasar la prop `onEdit` a `BaseRecipeList`.
- [x] Agregar el handler `onEdit` al botón "Editar" en `BaseRecipeList`.
- [x] Pasar la prop `editingRecipe` y `onSuccess` de `BaseRecipeManager` a `BaseRecipeBuilderWrapper`.
- [x] Actualizar `BaseRecipeBuilderWrapper` para pasar `editingItem` a `Builder`.
- [x] Actualizar `Builder` para pasar `editingItem` y `onSuccess` a `useBuilder`.
- [x] Modificar `useBuilder` para usar `useEffect` y rellenar el estado de `canvasItems` y metadata si hay un `editingItem`.
- [x] Añadir lógica a `useBuilder` para que `handleSave` actualice en lugar de crear si está editando.
- [x] Añadir el método `handleDelete` en `useBuilder` que invoca `baseRecipeApi.delete` y muestra confirmación al usuario y maneja los errores del backend.
- [x] Actualizar `BuilderHeader` para aceptar las props `isEditing` y `onDelete` para mostrar el botón "Eliminar".
- [x] Asegurar validaciones de interfaz y compatibilidad con ESLint (corregir error de hook setstate en effect).
- [x] Verificar build en React (`npm run build --workspace=apps/frontend`)
- [x] Testear correctitud con `npm test --workspace=apps/backend` y `npm test --workspace=apps/frontend`
