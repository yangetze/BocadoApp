# Plan de Trabajo Detallado: Módulo de Jornadas (CongregaApp)

Este documento desglosa el desarrollo del Módulo de Jornadas en **micro-tareas** accionables. Está diseñado para una arquitectura **PERN** (PostgreSQL, Express, React, Node.js) ligera, optimizada para despliegues como Vercel y enfocada en una experiencia de usuario (UX) táctil impecable para dispositivos móviles.

**Stack Frontend Recomendado (El estándar del 2025):** Se utilizará **React + Tailwind CSS + shadcn/ui**. Esta combinación es el estándar moderno definitivo. Shadcn/ui provee componentes base accesibles y robustos que no inyectan peso innecesario, permitiendo modificar fácilmente las clases de Tailwind para asegurar que todos los botones táctiles tengan un `min-h-[60px]` ideal para móviles bajo condiciones de alto ajetreo.

---

## FASE 1: Base de Datos, Usuarios y Autenticación (Backend)
**Objetivo:** Establecer la estructura de datos relacional y el sistema de seguridad basado en roles (Administrador y Servidor).

### Micro-tareas de Base de Datos (PostgreSQL / Prisma o Sequelize)
- [ ] **Crear Tabla `Usuarios`:** Campos: `id`, `cedula` (Unique), `nombre`, `apellido`, `correo`, `rol` (Enum: 'ADMINISTRADOR', 'SERVIDOR').
- [ ] **Crear Tabla `Participantes`:** Campos: `id`, `cedula` (Unique), `nombre`, `apellido`. *(Estos son los datos mínimos de registro).*
- [ ] **Crear Tabla `Jornadas`:** Campos: `id`, `nombre`, `fecha_inicio`, `is_activa` (Boolean).
- [ ] **Crear Tabla `Servicios_Jornada`:** Campos: `id`, `jornada_id` (FK), `nombre`, `ubicacion`, `capacidad_max` (Int, Nullable), `tipo` (Enum: 'COLA', 'FLUJO').
- [ ] **Crear Tabla `Asignaciones`:** Campos: `id`, `participante_id` (FK), `servicio_id` (FK), `estado` (Enum: 'ASIGNADO', 'EN_ESPERA', 'ATENDIDO', 'CANCELADO'), `timestamp`.

### Micro-tareas de Autenticación (Express / Node.js)
- [ ] **Endpoint Login (`/api/auth/login`):** Recibe `cedula` como username y password. Valida contra la tabla `Usuarios`.
- [ ] **Generación JWT:** Si la validación es exitosa, generar un token JWT que incluya el `id`, `cedula` y `rol` del usuario. Configurar expiración estricta de 8 horas.
- [ ] **Middlewares de Protección:**
  - [ ] `verifyToken`: Middleware para proteger rutas privadas.
  - [ ] `requireAdmin`: Middleware para proteger rutas exclusivas del Administrador (Ej: Crear jornadas).

---

## FASE 2: Panel de Administrador y Gestión de Jornadas
**Objetivo:** Permitir a los administradores crear nuevas jornadas y definir qué servicios estarán disponibles dinámicamente en cada una.

### Micro-tareas de Backend (Endpoints)
- [ ] **Endpoint POST `/api/jornadas`:** Crear una nueva jornada.
- [ ] **Endpoint POST `/api/jornadas/:id/servicios`:** Añadir un nuevo servicio a una jornada específica (el admin escribe el nombre del servicio, tipo y capacidad).
- [ ] **Endpoint GET `/api/jornadas/activa`:** Obtener la jornada actualmente activa y sus servicios vinculados.

### Micro-tareas de Frontend (Panel Admin)
- [ ] **Vista 'Crear Jornada':** Formulario sencillo (Nombre, Fecha).
- [ ] **Vista 'Gestión de Servicios':** Formulario dinámico para agregar múltiples servicios a la jornada recién creada, seleccionando si son de tipo 'COLA' o 'FLUJO'.
- [ ] **Botón 'Activar Jornada':** Acción para marcar una jornada como la activa del día.

---

## FASE 3: Rampa de Registro y Asignación de Participantes
**Objetivo:** Permitir al equipo de registro anotar participantes rápidamente y dirigirlos a los servicios que requieran.

### Micro-tareas de Backend (Endpoints)
- [ ] **Endpoint POST `/api/participantes`:** Recibe Nombre, Apellido y Cédula. Si la cédula ya existe, devuelve el registro existente (upsert).
- [ ] **Endpoint POST `/api/asignaciones`:** Vincula a un participante con un `servicio_id`.
  - *Lógica de Negocio:* Si el servicio es tipo 'FLUJO' (Ej: Infantil), el estado inicial pasa directamente a 'ATENDIDO' o no requiere control de cola. Si es 'COLA', el estado inicial es 'ASIGNADO'.

### Micro-tareas de Frontend (UX Rampa de Registro)
- [ ] **Formulario Rápido de Registro:** Inputs grandes para Cédula, Nombre y Apellido.
- [ ] **Búsqueda Autocomplete:** Al escribir la cédula, buscar si el participante ya existe en base de datos para autocompletar el nombre.
- [ ] **Selector de Servicios:** Lista de botones (Grid) con los servicios de la jornada activa para asignar al participante rápidamente.

---

## FASE 4: Dashboard de Servidor (Gestión de Colas Móvil)
**Objetivo:** Interfaz táctil ultra-responsiva para que el personal (Ej: Leopoldo, Ángel) gestione el estado de las personas en su área desde su celular bajo el sol y con prisa.

### Micro-tareas de Backend (Endpoints)
- [ ] **Endpoint GET `/api/servicios/:id/asignaciones`:** Retorna la lista de participantes asignados a un servicio específico, filtrados por estado ('ASIGNADO', 'EN_ESPERA').
- [ ] **Endpoint PATCH `/api/asignaciones/:id/estado`:** Actualiza el estado de una asignación.

### Micro-tareas de Frontend (Dashboard Mobile-First)
- [ ] **Selección de Área Inicial:** Al loguearse un 'Servidor', mostrar una lista de servicios de la jornada activa. Al elegir uno, guardar el `servicio_id` en `localStorage`.
- [ ] **Buscador Local del Servicio:** Input de búsqueda que filtre *exclusivamente* a las personas asignadas al servicio seleccionado (por Nombre o Cédula).
- [ ] **Listado de Cola Virtual:** Tarjetas grandes por cada participante en la cola del servicio. Mostrar contadores de total "En Espera".
- [ ] **Diseño de Botones de Acción Táctiles:** Implementar botones con clase Tailwind `min-h-[60px] w-full text-lg font-bold rounded-xl` para cambiar estados sin fallar el "tap":
  - 🟨 **AMARILLO (`bg-yellow-500`):** 'En Espera' (Para indicar que el participante ya llegó físicamente al área).
  - 🟩 **VERDE (`bg-green-600`):** 'Atendido' (Finalizó el proceso, lo saca de la cola).
  - 🟥 **ROJO (`bg-red-500`):** 'Cancelar/Desasignar'.

---

## Consideraciones Técnicas Adicionales
- **Prevención de Errores UX:** Al presionar un botón de estado (Verde/Amarillo/Rojo), deshabilitar inmediatamente el botón y mostrar un *spinner* para evitar dobles peticiones por internet lento.
- **Indexación BD:** Añadir índices en PostgreSQL a la columna `cedula` (Usuarios y Participantes) y `jornada_id` (Servicios) para búsquedas instantáneas.
