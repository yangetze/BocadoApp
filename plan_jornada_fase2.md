# FASE 2: Panel de Administrador y Gestión de Jornadas

**Objetivo:** Permitir a los administradores crear nuevas jornadas y definir qué servicios estarán disponibles dinámicamente en cada una.

## Micro-tareas de Backend (Endpoints Protegidos por `requireAdmin`)

- [ ] **Endpoint POST `/api/jornadas`:**
  - Crea una nueva jornada. Recibe `nombre` y `fecha_inicio`.
- [ ] **Endpoint POST `/api/jornadas/:id/servicios`:**
  - Añade un nuevo servicio a una jornada específica. El administrador envía el `nombre` del servicio (ej: Médico, Ropero, Infantil), el `tipo` (COLA o FLUJO) y la `capacidad_max`.
- [ ] **Endpoint GET `/api/jornadas/activa`:**
  - Retorna la jornada que actualmente tiene `is_activa = true`, junto con todos sus `Servicios_Jornada` anidados.
- [ ] **Endpoint PATCH `/api/jornadas/:id/activar`:**
  - Cambia el estado de todas las jornadas a inactivo y activa la jornada especificada en el parámetro ID.

## Micro-tareas de Frontend (Panel Admin - React + Tailwind/shadcn)

- [ ] **Vista 'Crear Jornada':**
  - Formulario sencillo con inputs para "Nombre de la Jornada" y "Fecha".
- [ ] **Vista 'Gestión de Servicios':**
  - Interfaz dinámica (tipo lista con botón "Agregar Servicio") para vincular múltiples servicios a la jornada recién creada. Debe incluir un selector ('Select' o 'Radio') para definir si el flujo de ese servicio es tipo 'COLA' o 'FLUJO'.
- [ ] **Botón 'Activar Jornada':**
  - Acción principal (botón grande destacado) en el panel de detalles para marcar una jornada como la activa del día.

## Micro-tareas de Pruebas y Calidad (Testing)

- [ ] **Test CRUD Jornadas (Happy Path):** Validar que un Administrador puede crear una jornada y esta se guarda correctamente en BD.
- [ ] **Test Creación de Servicios:** Validar que al agregar servicios a una jornada, se respeta el tipo de servicio ('COLA' o 'FLUJO').
- [ ] **Test Endpoint Jornada Activa:** Verificar que al consultar la jornada activa, solo retorna aquella con el flag `is_activa = true`.
- [ ] **Test Frontend (Componentes):** Validar que el componente de "Crear Jornada" renderiza correctamente y que el selector de "COLA/FLUJO" responde al estado.
- [ ] **Verificación de Compilación:** Correr el proceso de `build` del frontend y el servidor backend para garantizar la ausencia de errores.
