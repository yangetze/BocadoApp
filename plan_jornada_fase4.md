# FASE 4: Dashboard de Servidor (Gestión de Colas Móvil)

**Objetivo:** Interfaz táctil ultra-responsiva para que el personal gestione el estado de las personas en su área desde su celular bajo condiciones de exigencia física y rapidez.

## Micro-tareas de Backend (Endpoints)

- [ ] **Endpoint GET `/api/servicios/:id/asignaciones`:**
  - Retorna la lista de participantes asignados a un servicio específico, filtrados por estado ('ASIGNADO', 'EN_ESPERA'). La respuesta debe incluir todos los datos del participante (Nombre, Identificador de pulsera y Cédula si existe).
- [ ] **Endpoint PATCH `/api/asignaciones/:id/estado`:**
  - Actualiza el estado de una asignación específica. Recibe el nuevo `estado` en el body.

## Micro-tareas de Frontend (Dashboard Mobile-First)

- [ ] **Selección de Área Inicial:**
  - Al iniciar sesión con un rol 'SERVIDOR', mostrar una lista de servicios de la jornada activa. Al elegir uno, guardar el `servicio_id` en `localStorage` o Contexto de React.
- [ ] **Buscador Local del Servicio:**
  - Input de búsqueda que filtre *exclusivamente* a las personas asignadas a ese servicio en tiempo real en el cliente. Debe buscar tanto por Nombre, Cédula o Identificador de Pulsera.
- [ ] **Listado de Cola Virtual (Tarjetas Táctiles):**
  - Crear tarjetas grandes por cada participante en la cola del servicio.
  - Mostrar contadores estáticos en la parte superior: Total "En Espera" y Total "Asignados".
- [ ] **Diseño de Botones de Acción Táctiles:**
  - Implementar botones utilizando Tailwind con la clase `min-h-[60px] w-full text-lg font-bold rounded-xl` para cambiar estados sin fallar el "tap":
    - 🟨 **AMARILLO (`bg-yellow-500`):** 'En Espera' (Indica que el participante se presentó físicamente en el toldo/área).
    - 🟩 **VERDE (`bg-green-600`):** 'Atendido' (Finalizó el proceso con éxito, desaparece de la vista activa).
    - 🟥 **ROJO (`bg-red-500`):** 'Cancelar/Desasignar' (La persona se retiró o fue asignada por error).
- [ ] **Feedback Inmediato de UX:**
  - Al presionar un botón de estado, deshabilitarlo de inmediato y mostrar un *spinner* de carga localmente para evitar que el servidor haga múltiples *taps* accidentales si el internet está lento.
