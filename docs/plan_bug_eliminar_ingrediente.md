# Plan de Trabajo: Corregir Error al Eliminar Ingrediente

**Estado:** Completado
**Rama:** master

## 🎯 Objetivo
Asegurar que cuando el usuario intenta eliminar un ingrediente que está en uso en otra receta (por ejemplo, en una receta base), el frontend extraiga y muestre el mensaje de error específico devuelto por el backend en lugar de un mensaje genérico.

## 📋 Tareas
- [x] **Frontend:**
  - [x] Actualizar `IngredientManager.jsx` para atrapar el objeto `error` en el catch y extraer el mensaje (`error.message`).
  - [x] Actualizar todos los demás bloques `catch {` en el frontend para evitar que se descarten los objetos de error (actualizados en componentes de DragAndDrop y ExchangeRateManager).
- [x] **Pruebas:**
  - [x] Actualizar la prueba en `IngredientManager.test.jsx` para validar que el toast muestre el mensaje mockeado devuelto por la API.

## 🧪 Estrategia de Pruebas
- Verificar que las pruebas del frontend pasen correctamente `cd apps/frontend && npm test`
