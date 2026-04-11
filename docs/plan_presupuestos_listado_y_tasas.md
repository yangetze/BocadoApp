# Plan: Vista de Listado y Validación de Tasas en Presupuestos

**Estado:** Completado
**Rama:** feature/budget-crud-list


## 1. Listado de Presupuestos
- [x] Crear la ruta y vista `/app/budgets`.
- [x] **Ordenamiento:** Mostrar los presupuestos ordenados de forma descendente por fecha de creación.
- [x] **Información a Mostrar por Fila/Tarjeta:** Nombre del Presupuesto, Fecha de Creación.
- [x] **Acciones:** Botón primario prominente "Crear Presupuesto", Acciones (Editar, Eliminar).
- **Objetivo:** Proveer un panel de control rápido para ver, buscar y gestionar los presupuestos emitidos.
- **Implementación (Frontend):**
  - Crear la ruta y vista `/app/budgets`.
  - **Ordenamiento:** Mostrar los presupuestos ordenados de forma descendente por fecha de creación (los más recientes primero).
  - **Información a Mostrar por Fila/Tarjeta:**
    - Nombre del Presupuesto o Cliente.
    - Fecha de Creación.
    - Monto Total y Moneda de emisión.
    - Estado (Borrador, Emitido, Aprobado, etc.) con colores representativos.
  - **Acciones:**
    - Botón primario prominente "Crear Presupuesto" que redirige al Builder.
    - Menú contextual (o botones directos en la fila) para: "Editar" (si aplica el estado), "Ver/Previsualizar", "Descargar PDF", "Copiar Enlace", "Eliminar".

## 2. Validación de Tasa del Día al Crear
- **Objetivo:** Prevenir que se emita un presupuesto con costos desactualizados o tasas de cambio de días anteriores, protegiendo el margen del repostero.
- **Implementación (Frontend / Backend):**
  - **Chequeo de Tasa (Frontend):** Al hacer clic en "Crear Presupuesto", el sistema debe consultar el endpoint de tasas de cambio.
  - **Regla de Negocio:** Se debe validar si existe una tasa para la fecha actual (hoy).
  - **Comportamiento si NO está actualizada:**
    - Mostrar un Modal o Alerta restrictiva (o de advertencia fuerte): *"La tasa de cambio del día no está actualizada. Debes actualizarla antes de crear un nuevo presupuesto para asegurar tus costos."*
    - Proveer en el mismo modal un atajo (input) o botón para ir a actualizar la tasa (consultando CriptoYa o ingreso manual).
  - **Comportamiento si está actualizada:**
    - Proceder sin interrupciones hacia la creación o carga del Builder y registrar la tasa vigente ("snapshot") dentro del presupuesto creado.
