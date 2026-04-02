# 🗺️ Roadmap de Producto y Reglas de Negocio (BocadoApp)

Este documento define la evolución funcional, visión comercial y las etapas (MVPs) de BocadoApp, una plataforma SaaS de 2026 diseñada exclusivamente para el control total de costos en repostería profesional.

---

## 🎯 1. Visión y Enfoque del Producto

BocadoApp está construido sobre una premisa: **El cálculo de costos en repostería no es lineal, es composicional.**

- **El Problema:** Un pastel de bodas no es solo harina y huevos. Es un bizcocho (que tiene harina y huevos), un relleno (que tiene crema), una cobertura (que tiene mantequilla) y una caja (empaque).
- **La Solución:** Un motor relacional profundo. Si el precio internacional del azúcar sube, el costo de producción de 50 recetas diferentes debe actualizarse automáticamente.

---

## 🏗️ 2. Fases de Desarrollo y MVPs

A continuación se define el alcance funcional separado por etapas de Minimum Viable Product (MVP).

### MVP 1: El Motor de Costos Base (Actual & Próximo)
*El objetivo de esta fase es lograr que un único repostero profesional pueda tener el control milimétrico de sus recetas estáticas y calcular el costo exacto de un pedido.*

- **Funcionalidad Principal:**
  - Base de Datos Relacional de Ingredientes (precio base, unidad de medida).
  - Creación de "Recetas Base" (ej. Ganache de Chocolate).
  - Creación de "Súper Recetas" (ej. Pastel Completo).
  - Sistema Bimonetario Base y Automatización (API CriptoYa - Tasas manuales y automáticas con cron-job para USD -> VES).
- **Diseño UI/UX (En Curso):**
  - Implementación del "Minimalismo Sensorial" definido en `frontend-styleguide.md` (Colores Peach Soft `#F7C5B2` y Slate Gray `#3E4A59`).
  - Dark Mode y Empty States amigables.

### MVP 2: Escalabilidad y Dinamismo (Pendiente)
*El objetivo de esta fase es automatizar procesos y hacer que la herramienta sea visualmente interactiva.*

- **Skill 1: Constructor Visual Drag-and-Drop (Frontend)**
  - Interfaz interactiva donde los usuarios arrastran "Recetas Base" hacia un lienzo para armar visualmente una "Súper Receta" o Presupuesto.
- **Skill 2: Recomendador Inteligente de Margen de Ganancia (Backend/IA)**
  - Lógica que sugiere márgenes (30% al 50%+) basados en la complejidad de ensamblaje de la Súper Receta y los estándares de la industria pastelera.

### Fase SaaS (Visión a Largo Plazo)
*El objetivo es comercializar la aplicación a miles de reposteros.*

- **Skill 4: Arquitectura Multi-tenant**
  - Migración profunda de la base de datos para aislar datos por usuario/inquilino (`tenantId`).
  - Sistemas de suscripción y facturación.

---

## 📊 3. Estado Actual de las Tareas (Tabla Resumen)

Todos los agentes y desarrolladores deben consultar y actualizar esta tabla al finalizar un hito.

| Etapa / MVP | Funcionalidad (Skill) | Estado | Prioridad | Asignado A |
| :--- | :--- | :--- | :--- | :--- |
| **MVP 1** | Definición de Guía Visual (Minimalismo Sensorial) | 🟢 Completado | Alta | Equipo Diseño/UI |
| **MVP 1** | Motor Relacional (Ingredientes -> Súper Recetas) | 🟢 Completado | Crítica | Equipo Backend |
| **MVP 1** | Implementación de `frontend-styleguide.md` en código | 🟢 Completado | Alta | Equipo Frontend |
| **MVP 1** | Automatización API Bimonetaria (Manual + CriptoYa) | 🟢 Completado | Alta | Equipo Backend / Frontend |
| **MVP 1** | Implementación de TestMode (In-Memory) vs PostgreSQL | 🟢 Completado | Alta | Equipo Backend |
| **MVP 1** | Testing Integral de API Backend (Jest + Supertest) | 🟢 Completado | Alta | Equipo Backend / QA |
| **MVP 1.5** | Módulo de Autenticación de Usuarios y Planes | 🟢 Completado | Alta | Fullstack |
| **MVP 1.5** | Nuevo Landing Page (Minimalismo Sensorial) | 🟢 Completado | Media | Equipo Frontend |
| **MVP 2** | Constructor Visual Drag-and-Drop | ⚪ Pendiente | Media | Equipo Frontend |
| **MVP 2** | Recomendador Margen Ganancia | ⚪ Pendiente | Baja | Equipo Backend / IA |
| **Fase SaaS**| Migración a Multi-tenant (`tenantId`) | ⚪ Futuro | Crítica | Arquitectura |

*(Leyenda: 🟢 Completado | 🔵 En Curso | 🟡 Por Hacer | ⚪ Pendiente/Futuro)*

---

## 📝 4. Notas para Desarrolladores / Agentes

- **TestMode:** La aplicación soporta un modo de prueba en memoria para facilidad de demostración en el frontend sin requerir conexión a la base de datos local. Para activar este modo, asegúrate de establecer `TEST_MODE=true` en tu archivo `.env` del backend. Si está en `false` o no está definido, utilizará Prisma junto con una base de datos de PostgreSQL real.
- **Reglas de Negocio - Sistema Bimonetario:** La moneda base es siempre USD. El destino por defecto en UI es VES. El registro de tasas debe indicar fecha de efectividad, fecha de actualización, y fuente (Manual o API CriptoYa). Se permite actualizar una tasa existente si coincide en fecha.
- Antes de proponer nuevas funcionalidades complejas (Skills), asegúrate de que encajen dentro de uno de los MVPs descritos aquí.
- Cualquier decisión sobre el aspecto visual de las nuevas "Skills" del MVP 2 debe regirse estrictamente por las normas descritas en `frontend-styleguide.md`.
- El lenguaje de la interfaz, incluso en las nuevas etapas del MVP 2, será siempre **en Español** y con un tono amigable, como se detalla en la guía de estilos.