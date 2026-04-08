# Plan: Ítems Genéricos en Presupuestos

**Estado:** Backlog
**Rama:** (Por definir)


## Objetivo
Refactorizar el modelo de Presupuestos (`Budget`) para permitir la inclusión no solo de Super Recetas, sino también de Recetas Base, Ingredientes individuales (ej. velas) y Costos Operacionales/Adicionales (ej. transporte). El diseño debe ser genérico para facilitar la cotización de cualquier combinación de elementos.

## Tareas

1. **Actualización del Esquema de Base de Datos (Prisma)**
   - Deprecar/Reemplazar el modelo `BudgetSuperRecipe` por un modelo más genérico llamado `BudgetItem`.
   - `BudgetItem` debe contener relaciones opcionales (nullable) hacia `SuperRecipe`, `BaseRecipe` e `Ingredient`.
   - Agregar campos en `BudgetItem` para ítems personalizados (ej. `customName`, `customCost`) para manejar costos operacionales (transporte, empaque especial) que no justifican estar en el inventario.
   - Generar la migración (`npx prisma migrate dev`) y regenerar el cliente Prisma.

2. **Actualización del Backend (Controladores y Rutas)**
   - Modificar `createBudget` en `apps/backend/src/controllers/budgetController.js` para aceptar un array `items` genérico en lugar de `superRecipes`.
   - Validar que cada ítem tenga al menos un identificador (super receta, receta base, ingrediente) o que sea un ítem personalizado, e incluir siempre la cantidad o multiplicador (`quantity`).
   - Actualizar `getBudgets` para poblar (`include`) correctamente las entidades opcionales dentro de cada `BudgetItem`.
   - Actualizar los datos falsos (`mockData.js`) de los controladores para cuando `isTestMode()` sea `true`.

3. **Actualización del Frontend**
   - Modificar las interfaces de tipo y llamadas API en el cliente (`apps/frontend/src/api.js` o archivos relacionados).
   - Refactorizar el formulario del constructor de presupuestos (Builder) para que ofrezca un selector del tipo de ítem a agregar (Super Receta, Receta Base, Ingrediente, Costo Personalizado).
   - Actualizar el cálculo global de costos/precios en el frontend, consolidando la suma que ahora proviene de múltiples fuentes.
   - Ajustar las vistas de detalle y la exportación a PDF para que puedan renderizar esta lista heterogénea.

## Enfoque de Pruebas (Testing Approach)

- **Backend:** Se *actualizarán* las pruebas existentes relacionadas con la creación y obtención de presupuestos en `apps/backend/src/tests/` (si las hay) para usar el nuevo formato `items` en vez de `superRecipes`. Se *añadirán* nuevas pruebas unitarias para validar que al crear un presupuesto con combinaciones de distintos tipos de ítems (ingredientes directos, recetas y costos custom), los campos se guardan correctamente.
- **Frontend:** Se *actualizarán* las pruebas (o se probará de forma manual y automatizada mediante Jest/Playwright si aplica) para verificar que la interfaz permite seleccionar los distintos tipos de ítems sin errores y que el total se calcula correctamente en el resumen del presupuesto.
