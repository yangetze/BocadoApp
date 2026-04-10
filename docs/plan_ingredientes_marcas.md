# Plan de Trabajo: Mejoras UX/UI Módulo Ingredientes - Marcas y Precios

**Estado:** En desarrollo
**Rama:** feat/ingredientes-ux-marcas

## 🎯 Objetivo

Mejorar la experiencia de usuario (UX/UI) en el módulo de Ingredientes. En la modal de creación/edición, simplificar la gestión del costo promedio basado en las marcas/presentaciones agregadas. En la vista de listado, mostrar el detalle de marcas con badges que resalten el "precio más bajo" y "precio más alto".

## 📋 Tareas

- [ ] **Backend (API REST):**
  - [ ] Validar y asegurar que los endpoints de Ingredientes retornen correctamente las presentaciones (`presentations`).
  - [ ] *Opcional*: Si se requiere, calcular en el backend el promedio para `defaultCost` si no es enviado por el cliente, pero la lógica principal puede residir en el frontend para retroalimentación en tiempo real.

- [x] **Frontend (UI/UX - IngredientFormModal):**
  - [x] Implementar la sección para agregar "N marcas" (Presentaciones) en la modal de ingredientes.
  - [x] Calcular automáticamente el "Costo Estimado Base (USD)" (`defaultCost`) como el promedio de los costos de las presentaciones agregadas. Permitir al usuario sobrescribir este valor manualmente.

- [ ] **Frontend (UI/UX - IngredientManager):**
  - [ ] Modificar la vista de listado (Desktop y Mobile) para que, al seleccionar/expandir un ingrediente, se despliegue el detalle de sus presentaciones/marcas.
  - [ ] En el listado de presentaciones expandido, calcular y mostrar dos badges: "Precio más bajo" y "Precio más alto" (basado en el costo por unidad base, ej. $/gr).

- [ ] **Pruebas:**
  - [ ] **Backend:** Actualizar/Añadir pruebas unitarias (`__tests__/ingredient.test.js`) para validar la correcta creación/actualización de ingredientes con presentaciones.
  - [ ] **Frontend:** Ejecutar pruebas para verificar el cálculo del promedio en la modal y la correcta visualización de los badges en el listado.

## 🧪 Estrategia de Pruebas

- Se utilizarán pruebas en Jest para el backend y verificación visual / Playwright (si aplica) o test de componentes en el frontend.
- Validar el cálculo correcto del costo promedio y la identificación de precios alto/bajo considerando el costo unitario real.
