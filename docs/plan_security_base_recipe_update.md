# 🔒 Plan de Trabajo: Security Fix Base Recipe Update IDOR

**Estado:** Completado
**Rama:** jules-15262066915785135944-5a23fa28

## Objetivo
Corregir una vulnerabilidad de Insecure Direct Object Reference (IDOR) en la actualización de Recetas Base que permitía a un usuario vincular ingredientes de otros usuarios a sus propias recetas base.

## Riesgo
Sin verificar la propiedad, un usuario malintencionado podría modificar o eliminar ingredientes de las recetas base de otro usuario al proporcionar un `ingredientId` de un tercero en el arreglo `items` durante la actualización.

## Solución
- [x] Se añadió una verificación en `apps/backend/src/controllers/baseRecipeController.js` para asegurar que el usuario es el dueño de todos los `ingredientId` proporcionados en el payload usando `prisma.ingredient.count`.
- [x] Se implementaron pruebas automatizadas en `apps/backend/__tests__/baseRecipe.test.js` para validar la lógica del fix y asegurar que se rechacen peticiones con ingredientes de otros usuarios (HTTP 404).

## Notas
Esta verificación sigue los patrones de seguridad ya aplicados en la creación (`createBaseRecipe`).
