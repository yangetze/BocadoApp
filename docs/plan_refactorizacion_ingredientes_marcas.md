# Plan de Trabajo: Refactorización de Ingredientes y Marcas

**Estado:** Completado
**Rama:** refactor/ingredientes-marcas


## 🎯 Objetivo

Reestructurar la arquitectura de datos del sistema para separar el concepto genérico de "Ingrediente" de sus "Marcas/Presentaciones" específicas. Esto permitirá que las Recetas Base y Súper Recetas funcionen como plantillas (usando ingredientes genéricos), mientras que la selección de marcas, presentaciones y precios exactos se difiere al momento de crear un Presupuesto, el cual dictará el costo real de fabricación.

## 📋 Tareas

- [x] **Base de Datos (Prisma/PostgreSQL):**
  - [x] Crear nuevo modelo `BrandPresentation` (Marca/Presentación) que pertenezca a un `Ingredient`. Este modelo debe almacenar: marca, nombre de la presentación, precio, cantidad de la unidad (ej. 1kg), unidad de medida.
  - [x] Modificar el modelo `Ingredient` para que sea un ente genérico (ej. "Azúcar Blanca"). Retirar los campos de costo y presentación directamente de la tabla `Ingredient`, o establecer un costo "por defecto/promedio" para cálculos estimados.
  - [x] Modificar el modelo `Budget` (y sus tablas de relación, ej. `BudgetSuperRecipe` o una nueva tabla) para permitir vincular qué `BrandPresentation` específica se utilizará para cada ingrediente genérico requerido en las recetas del presupuesto.

- [x] **Backend (API REST):**
  - [x] Crear/Actualizar controladores y rutas para gestionar `BrandPresentation` (CRUD) bajo la ruta de ingredientes.
  - [x] Actualizar los cálculos de costos de las Recetas Base y Súper Recetas para reflejar un costo estimado (usando la presentación por defecto o promedio).
  - [x] Actualizar la lógica del Presupuesto para que, al calcular el costo final y la ganancia, utilice los precios de las presentaciones específicas seleccionadas para ese presupuesto.

- [x] **Frontend (UI/UX):**
  - [x] **Módulo de Ingredientes:** Modificar la vista de creación/edición de ingredientes. Ahora se creará un "Ingrediente Genérico" y dentro de él se podrá agregar una lista de "Presentaciones/Marcas".
  - [x] **Módulo de Recetas (Base y Súper):** Ajustar la UI para que la selección de ingredientes sea genérica. Indicar claramente que los costos mostrados aquí son *estimados*.
  - [x] **Módulo de Presupuestos:** Modificar el flujo de creación de presupuestos. Al agregar una Súper Receta, añadir un paso o interfaz donde el usuario debe seleccionar qué marca/presentación específica utilizará para cada ingrediente genérico de las recetas involucradas.

## 🧪 Estrategia de Pruebas

- **Pruebas de Backend:**
  - Agregar pruebas unitarias para asegurar que los costos de un presupuesto se calculan correctamente usando los precios de las presentaciones seleccionadas y no del ingrediente genérico.
  - Actualizar pruebas existentes en `Ingredient`, `BaseRecipe` y `SuperRecipe` para reflejar la nueva estructura genérica.
- **Pruebas de Frontend:**
  - Verificar visualmente la nueva UI de Ingredientes (lista de presentaciones anidadas).
  - Verificar que el flujo de Presupuestos bloquee o alerte si faltan selecciones de marcas para ingredientes necesarios.
