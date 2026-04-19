# Plan: Marca Favorita por Ingrediente

## Objetivo
Permitir a los usuarios marcar una marca/presentación específica como favorita para un ingrediente. Solo puede haber una marca favorita por ingrediente.

## Estado
**Completado**

## Tareas
- [x] Actualizar modelo `BrandPresentation` en `schema.prisma` agregando el campo `isFavorite` (Boolean, default false).
- [x] Generar cliente Prisma y ejecutar push a la base de datos.
- [x] Actualizar controlador `createIngredient` y `updateIngredient` para procesar `isFavorite`.
- [x] Actualizar mock de datos `mockData.js` para soportar pruebas con `isFavorite`.
- [x] Modificar frontend UI (`IngredientFormModal.jsx`) para incluir ícono de corazón.
- [x] Implementar función de alternancia `toggleFavorite` en frontend que garantiza solo un favorito.
- [x] Agregar pruebas unitarias en el frontend para verificar la selección/deselección de favoritos.
- [x] Verificar funcionamiento (ejecutar tests, pre-commit checks).
- [x] Preparar PR.

## Rama
`feature/favorite-ingredient-brand`
