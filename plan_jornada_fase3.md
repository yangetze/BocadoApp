# FASE 3: Rampa de Registro y Asignación de Participantes

**Objetivo:** Permitir al equipo de registro anotar participantes rápidamente, soportando la flexibilidad de no tener cédula inicial, y dirigirlos a los servicios que requieran.

## Micro-tareas de Backend (Endpoints)

- [ ] **Endpoint POST `/api/participantes` (Registro Flexible):**
  - Recibe `nombre`, `apellido`, `cedula` (opcional) y `identificador` (opcional).
  - *Lógica:* Si no se provee `identificador`, el backend genera uno autómaticamente (Ej: `JRN-XXXX`). Si se provee `cedula` y ya existe, actualiza los datos; si no, crea el nuevo registro.
- [ ] **Endpoint PATCH `/api/participantes/:id` (Actualización Posterior):**
  - Permite actualizar los datos de un participante (por ejemplo, añadir la `cedula` si solo había sido registrado con número de pulsera).
- [ ] **Endpoint POST `/api/asignaciones`:**
  - Vincula a un participante con un `servicio_id`.
  - *Lógica de Negocio:* Si el servicio es tipo 'FLUJO' (Ej: Infantil), el estado inicial pasa directamente a 'ATENDIDO' o se obvia de la cola normal. Si es 'COLA', el estado inicial es 'ASIGNADO'.

## Micro-tareas de Frontend (UX Rampa de Registro)

- [ ] **Formulario Rápido y Flexible:**
  - Inputs grandes para Nombre y Apellido (Requeridos).
  - Input para Identificador / Nro. Brazalete (Opcional, si se deja vacío se autogenera).
  - Input para Cédula (Opcional).
- [ ] **Búsqueda Autocomplete Unificada:**
  - Buscador global en la vista de registro que permita ingresar la Cédula o el Identificador. Si el sistema encuentra coincidencia, autocompleta el formulario para agilizar el proceso y permite editar (ej: agregar la cédula si faltaba).
- [ ] **Selector de Servicios:**
  - Lista de botones (Grid responsivo) con los servicios de la jornada activa. Al seleccionar uno y dar "Guardar", se emite la petición al backend para generar la asignación.
