# Plan de Trabajo: Corregir Bug en "Total Ingredientes" de Súper Recetas

**Estado:** En desarrollo
**Rama:** fix/super-receta-total-ingredientes

## 🎯 Objetivo
Solucionar el problema en el modo de "Modificar" (edición) del Constructor de Súper Recetas donde no se muestra la sección de "Total Ingredientes", la cual sí aparece al crear.

## 📋 Tareas
- [ ] Reproducir el problema ingresando al modo de edición de una Súper Receta existente.
- [ ] Revisar la lógica en `Builder.jsx` y `useBuilder.js` para identificar por qué la sección `IngredientsSummary` o el cálculo de totales no se renderiza durante la edición.
- [ ] Asegurar que el estado inicial de los `canvasItems` se cargue correctamente para el cálculo de totales al montar el componente en modo edición.
- [ ] Aplicar correcciones y verificar que el resumen de totales se muestre y actualice correctamente al editar.
