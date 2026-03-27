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
   - **Do not** install global packages in the root unless they are for monorepo tooling. Install app-specific packages in their respective directories.
2. **ES Modules:** The backend uses ES Modules (`"type": "module"` in `package.json` if necessary, though currently configured with standard js setup. Prefer modern ES6+ syntax).
3. **Database (Prisma):**
   - All schema changes MUST go in `apps/backend/prisma/schema.prisma`.
   - Never run raw SQL directly for migrations; always use `npx prisma migrate dev` or generate the client.
   - The cost logic is highly relational. Pay attention to the cascading relations (`Cascade` vs `Restrict`).
4. **Environment Variables:**
   - Keep `.env` out of version control.
   - Use `.env.example` to document required variables.

## 🗺️ Reglas de Negocio, Estilos Visuales y Roadmap
Para conocer las directrices de diseño, el tono de voz de la aplicación, el "Sensory Minimalism" (2026), los MVPs y las nuevas funcionalidades ("Skills"), debes consultar **estrictamente** los siguientes documentos en la raíz del proyecto:

1. **`ROADMAP.md`**: Aquí encontrarás las reglas de negocio, la definición de las etapas del producto (MVP 1, MVP 2) y la tabla de estado de las tareas (Skills). **Toda nueva funcionalidad debe enmarcarse en este documento.**
2. **`frontend-styleguide.md`**: Aquí encontrarás la paleta de colores oficial, directrices para Dark/Light mode, texturas, y reglas de diseño UI/UX. Todo el código frontend que generes **debe obedecer** estas reglas visuales. El tono de voz siempre es amigable y en español.

## 🤖 AI Workflow Instructions
- **Consultar Reglas de Negocio:** Antes de iniciar cualquier tarea, revisa `ROADMAP.md` y `frontend-styleguide.md`.
- **Read before writing:** Always read `schema.prisma` before writing any backend query. The relationships are deeply nested.
- **Verification:** Always write or run tests/scripts to verify that the math in `costController.js` remains perfectly accurate when modifying it. Cost calculation is the core value of this app.
- **Frontend Styling:** Use Tailwind utility classes basándote en la guía de estilos. For animations, default to Framer Motion using subtle, professional easing (`ease: "easeInOut", duration: 0.3`).
