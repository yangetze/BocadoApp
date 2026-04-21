# Plan de Trabajo Maestro: Módulo de Jornadas (CongregaApp)

Este documento es el **índice principal** del desarrollo del Módulo de Jornadas. El proyecto está dividido en 4 fases accionables diseñadas para una arquitectura **PERN** (PostgreSQL, Express, React, Node.js) ligera y optimizada para dispositivos móviles mediante **React + Tailwind CSS + shadcn/ui**.

A continuación se listan los enlaces a los planes detallados por fase (micro-tareas):

- [FASE 1: Base de Datos, Usuarios y Autenticación](./plan_jornada_fase1.md)
  *Diseño de la estructura relacional (incluyendo registros flexibles sin cédula obligatoria) y configuración de seguridad.*
- [FASE 2: Panel de Administrador y Gestión de Jornadas](./plan_jornada_fase2.md)
  *Creación dinámica de jornadas y servicios (Cola/Flujo).*
- [FASE 3: Rampa de Registro y Asignación de Participantes](./plan_jornada_fase3.md)
  *Registro rápido con generación de identificadores para brazaletes, búsqueda y asignación.*
- [FASE 4: Dashboard de Servidor (Gestión de Colas Móvil)](./plan_jornada_fase4.md)
  *Interfaz 100% táctil para control de asistencia ('En Espera', 'Atendido', 'Cancelado').*

---

## Consideraciones Globales
- **Flexibilidad de Registro:** Los participantes pueden ser registrados inicialmente solo con un identificador (Ej: número de pulsera) sin requerir obligatoriamente la cédula. Estos datos pueden actualizarse más adelante.
- **Botones Táctiles:** El estándar para interacciones de acción rápida en móvil será el uso de botones con la clase `min-h-[60px]`.
