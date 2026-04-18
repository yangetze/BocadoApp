# Plan de Trabajo: Remover Símbolo de Dólar en Presentaciones de Ingredientes

**Estado:** Completado
**Rama:** fix/remove-dollar-sign-ingredient-form

## 🎯 Objetivo
Corregir la visualización de la lista de presentaciones de compra en el modal de crear/modificar ingrediente para no mostrar el símbolo de dólar en la unidad de medida, cambiando el formato de `$1.09 / $1kg` a `$1.09 / 1kg`.

## 📋 Tareas
- [x] Modificar la UI en `IngredientFormModal.jsx` para cambiar la presentación de `$cost / $unitQuantity$measurementUnit` a `$cost / unitQuantity measurementUnit`.
- [x] Ejecutar la suite de tests del frontend en `apps/frontend` para garantizar la funcionalidad inalterada y sin errores.
- [x] Ejecutar tareas de pre-commit y revisiones adicionales para confirmar que la aplicación reacciona bien ante este pequeño cambio de UI.
