# FASE 1: Base de Datos, Usuarios y Autenticación (Backend)

**Objetivo:** Establecer la estructura de datos relacional y el sistema de seguridad basado en roles (Administrador y Servidor). En esta fase se contemplará la flexibilidad para permitir registros de participantes sin cédula inicial.

## Micro-tareas de Base de Datos (PostgreSQL / Prisma o Sequelize)

- [ ] **Crear Tabla `Usuarios` (Personal):**
  - Campos: `id`, `cedula` (Unique), `nombre`, `apellido`, `correo`, `rol` (Enum: 'ADMINISTRADOR', 'SERVIDOR').
- [ ] **Crear Tabla `Participantes` (Asistentes):**
  - Campos:
    - `id` (UUID o Auto-incremental).
    - `identificador` (String, Unique): Número de ticket, brazalete o autogenerado si no se provee nada.
    - `cedula` (String, Nullable, Unique): Opcional. Permite registrar a la persona y actualizar este dato después.
    - `nombre` (String).
    - `apellido` (String).
- [ ] **Crear Tabla `Jornadas`:**
  - Campos: `id`, `nombre`, `fecha_inicio`, `is_activa` (Boolean).
- [ ] **Crear Tabla `Servicios_Jornada`:**
  - Campos: `id`, `jornada_id` (FK), `nombre`, `ubicacion`, `capacidad_max` (Int, Nullable), `tipo` (Enum: 'COLA', 'FLUJO').
- [ ] **Crear Tabla `Asignaciones`:**
  - Campos: `id`, `participante_id` (FK), `servicio_id` (FK), `estado` (Enum: 'ASIGNADO', 'EN_ESPERA', 'ATENDIDO', 'CANCELADO'), `timestamp`.

## Micro-tareas de Autenticación (Express / Node.js)

- [ ] **Endpoint Login (`/api/auth/login`):**
  - Recibe `cedula` como username y password. Valida contra la tabla `Usuarios`.
- [ ] **Generación JWT:**
  - Si la validación es exitosa, generar un token JWT que incluya el `id`, `cedula` y `rol` del usuario. Configurar expiración estricta de 8 horas.
- [ ] **Middlewares de Protección:**
  - [ ] `verifyToken`: Middleware genérico para proteger rutas privadas (verificando el JWT).
  - [ ] `requireAdmin`: Middleware para proteger rutas exclusivas del Administrador (Ej: Crear jornadas).

## Micro-tareas de Pruebas y Calidad (Testing)

- [ ] **Tests de Modelos/Migraciones:** Verificar que las restricciones únicas (Ej: `cedula`) y opcionales (`identificador`) funcionen correctamente en la base de datos (Test de Integración).
- [ ] **Test de Endpoint de Login (Happy Path):** Validar que enviar credenciales correctas retorna un status 200 y el token JWT.
- [ ] **Test de Endpoint de Login (Casos de Error):** Validar que enviar credenciales inválidas retorna un status 401.
- [ ] **Test de Middlewares:** Verificar que el middleware `requireAdmin` bloquee peticiones de usuarios con rol 'SERVIDOR' retornando status 403.
- [ ] **Verificación de Compilación:** Asegurar que el backend levanta sin errores tras definir los modelos y rutas iniciales.
