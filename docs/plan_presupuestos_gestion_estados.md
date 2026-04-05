# Plan: Gestión de Estados y Ciclo de Vida de Presupuestos

## 1. Definición de Estados
Todo presupuesto creado en el sistema debe transitar por un ciclo de vida definido mediante una máquina de estados simple para mantener el orden. Los estados propuestos son:

- **Borrador (Draft):** El presupuesto está en creación. Los costos pueden fluctuar y aún no se ha emitido un PDF o link. Es totalmente editable.
- **Publicado / Emitido (Published):** Se ha generado el enlace o descargado el PDF y entregado al cliente.
- **Aprobado (Approved):** El cliente aceptó el presupuesto. Marca un compromiso de producción.
- **Rechazado (Rejected):** El cliente declinó la oferta.
- **Vencido (Expired):** Superó la fecha de validez configurada (ej. validez de 2 días) y ya no se puede aprobar.

## 2. Reglas de Edición según Estado
Para proteger la integridad financiera, se establecen restricciones de edición:

- **Estado Borrador:**
  - Todo es editable (ítems, precios, notas, cliente).
  - La tasa de cambio puede actualizarse automáticamente.
- **Estados Emitido/Aprobado/Rechazado/Vencido:**
  - **Estructura Bloqueada:** No se pueden agregar ni eliminar Súper Recetas.
  - **Montos Bloqueados:** Los precios, la tasa de cambio y el costo total quedan "congelados" (snapshot) para mantener el historial intacto de lo que se le cotizó al cliente.
  - **Edición Restringida:** Si el cliente desea cambios en un presupuesto emitido o aprobado, el sistema debería obligar a **"Duplicar"** o **"Clonar"** el presupuesto para generar una nueva versión en estado Borrador con costos actualizados al día, anulando el anterior (o dejándolo como historial).

## 3. Implementación
- **Backend (Esquema y Controladores):**
  - Añadir una columna `status` en la tabla `Budget` (tipo `ENUM` preferiblemente).
  - Implementar lógica en el middleware o controlador de actualización (`PUT /api/budgets/:id`) para rechazar modificaciones estructurales si `status !== 'DRAFT'`.
  - Crear endpoints específicos para transiciones de estado: `POST /api/budgets/:id/approve`, `POST /api/budgets/:id/publish`.
- **Frontend (UI):**
  - Añadir indicadores visuales (Badges o Etiquetas) en la lista y vista detallada de presupuestos mostrando el estado actual (ej. verde para Aprobado, gris para Borrador, rojo para Vencido).
  - Ocultar o deshabilitar los botones de edición (Drag and drop, eliminación de items) si el presupuesto no es borrador.
  - Proveer botones de acción clara: "Marcar como Emitido", "Marcar como Aprobado".
