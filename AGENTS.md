# BocadoApp - AI Agents Guide (`AGENTS.md`)

Welcome to the BocadoApp monorepo! This document serves as a guide for AI assistants, agents, and LLMs working on this codebase. It defines our coding standards, architectural decisions, and the roadmap for adding "skills" (new functionalities).

## 🏢 Project Context
**BocadoApp** is a SaaS platform designed for professional bakers (target year: 2026). Its primary focus is **total cost control** through a compositional data architecture.
- **Stack:** PERN Stack (PostgreSQL, Express, React, Node.js) + Prisma ORM.
- **Design Philosophy (Frontend):** "Data-Density", minimalist, clean, responsive-first. Uses React, TailwindCSS, and Framer Motion.
- **Architecture (Backend):** Deeply relational cost-calculation engine (Ingredients -> Base Recipes -> Super Recipes -> Budgets) with bimonetary support (USD as base).

## 📋 General Guidelines
1. **Monorepo Structure:** We use NPM workspaces.
   - `apps/frontend/`: React + Vite application.
   - `apps/backend/`: Node.js + Express + Prisma application.
2. **ES Modules:** The backend uses ES Modules. Prefer modern ES6+ syntax.
3. **Database (Prisma):**
   - All schema changes MUST go in `apps/backend/prisma/schema.prisma`. Siempre ejecutar `npx prisma db push` o `npx prisma migrate dev` tras cambios.
4. **Environment Variables:** Keep `.env` out of version control. Use `.env.example` to document them.

## ⚡️ Workflow Commands (Comandos Especiales)
- **RUN ALL DEV**: Ejecutar `npm run dev` en `apps/backend` y `apps/frontend` simultáneamente.
- **STOP ALL DEV**: Buscar y terminar todos los procesos activos de `npm run dev` en el monorepo y liberar puertos 3000/5173.

## 🤖 AI Workflow Instructions
- **Creación de Planes**: **Obligatorio.** Cada vez que se cree una rama de trabajo nueva, se debe crear un plan de trabajo detallado en la ruta `docs/`.
  - Usar la nomenclatura: `plan_nombre_del_modulo_nombre_del_issue.md` para tareas específicas de un módulo.
  - Usar `plan_nombre_del_issue.md` para tareas que afecten a múltiples módulos o sean generales.
- **Flujo Paso a Paso**: Si el usuario envía una lista de requerimientos o puntos, SIEMPRE se debe trabajar punto por punto (estilo sprint). Abordar el primer punto, confirmar con el usuario que está "ok" y luego proceder al siguiente. NO saturar la memoria intentando hacer todo a la vez.
- **Consultar Reglas de Negocio:** Antes de iniciar cualquier tarea, revisa `ROADMAP.md` y `frontend-styleguide.md`.
- **Read before writing:** Always read `schema.prisma` before writing any backend query.
- **Verification:** Always write/run tests to verify math accuracy in `costController.js`.
- **Frontend Styling:** Use Tailwind classes basándote en la guía de estilos. Framer Motion para animaciones sutiles.
- **Manejo de Errores:** Nunca romper la UI; usar try/catch en el frontend y reportar errores amigables.
- **Seguridad de API:** Es OBLIGATORIO usar el middleware `verifyToken` en todas las rutas de API que se desarrollen para proteger los endpoints.

## 🗺️ Reglas de Negocio, Estilos Visuales y Roadmap
Consulta `ROADMAP.md` (Skills y MVP) y `frontend-styleguide.md` (UI/UX) para asegurar consistencia sensorial y técnica.
