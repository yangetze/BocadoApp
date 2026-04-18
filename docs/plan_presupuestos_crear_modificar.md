# Plan de Trabajo: Crear y Modificar Presupuestos

**Estado:** En desarrollo
**Rama:** `feature/presupuestos-crear-modificar`

## 🎯 Objetivo
Implementar la funcionalidad completa para crear, visualizar y modificar presupuestos, permitiendo agregar múltiples Súper Recetas, ajustar sus márgenes de ganancia, y seleccionar de manera inteligente las presentaciones (marcas) de los ingredientes que componen dichas recetas.

## 📋 Tareas

### Fase 1: Desglose Jerárquico en la UI
- [ ] Modificar el endpoint del backend (ej. `GET /budgets/:id`) para que retorne el desglose de ingredientes agrupado jerárquicamente por ingrediente genérico y luego por sus presentaciones (marcas) seleccionadas, incluyendo cantidades y costos parciales.
- [ ] Actualizar el componente Frontend (ej. `BudgetSummary`) para renderizar el nuevo formato jerárquico:
  - Nombre Ingrediente - Cantidad Total Unidad - Precio Total
    - Marca 1 - Cantidad Unidad - Precio Parcial
    - Marca 2 - Cantidad Unidad - Precio Parcial

### Fase 2: Selección Inteligente de Presentaciones (Smart Defaults)
- [ ] Backend: Asegurar que el modelo `BrandPresentation` o la lógica de negocio permita identificar una presentación "favorita" o predeterminada por el usuario.
- [ ] Backend: Crear/Actualizar endpoint para aplicar reglas de selección en un presupuesto (ej. `POST /budgets/:id/apply-rule`). Debe soportar las reglas `FAVORITE` (por defecto) y `CHEAPEST`.
- [ ] Frontend: En el constructor de presupuestos (`BudgetBuilder`), agregar botones de acción rápida:
  - "Usar Favoritas" (Actúa como opción predeterminada).
  - "Usar Más Económicas".
- [ ] Frontend: Conectar los botones al nuevo endpoint y asegurar que la interfaz y el costo total se actualicen automáticamente al aplicar una regla.

### Fase 3: Pruebas y Validación
- [ ] Escribir tests unitarios en el Backend para la correcta agrupación jerárquica de ingredientes en presupuestos.
- [ ] Escribir tests unitarios en el Backend para la aplicación de reglas `FAVORITE` y `CHEAPEST`.
- [ ] Verificar manualmente que la UI refleje correctamente los cambios de selección de marca sin errores de duplicación.
