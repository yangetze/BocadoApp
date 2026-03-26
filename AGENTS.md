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

## 🏗️ Future Skills / Roadmap (To Be Developed)
When instructed to "develop a new skill", refer to this list for context:

### Skill 1: Dynamic Drag-and-Drop Builder (Frontend)
- **Goal:** Create an interactive UI where users can drag "Base Recipes" and "Direct Ingredients" into a visual canvas to construct a "Super Recipe".
- **Tech:** React, Framer Motion, potentially a dnd library (e.g., `@dnd-kit/core`).
- **Rules:** Ensure state is synced locally before sending the final composite object to the backend.

### Skill 2: Bimonetary System Expansion
- **Goal:** Create a cron-job or webhook listener in the backend to automatically update `ExchangeRate` from an external API (e.g., updating the USD to local currency rate daily).
- **Rules:** Preserve historical budgets with the rate they were created at (Snapshot pattern), only apply live exchange rates to future or draft calculations.

### Skill 3: Automated Profit Margin Recommendations
- **Goal:** Analyze the cost of a `SuperRecipe` and suggest a `profitMargin` in the `Budget` based on standard baking industry margins (e.g., 30% for simple items, 50% for complex wedding cakes).

### Skill 4: Tenant Management (SaaS Transition)
- **Goal:** Shift from the current single-tenant proof-of-concept to a full multi-tenant architecture.
- **Rules:** Every database query MUST filter by `userId` or `tenantId` to ensure data isolation. Implement middleware to inject the `tenantId` from the JWT token.

## 🤖 AI Workflow Instructions
- **Read before writing:** Always read `schema.prisma` before writing any backend query. The relationships are deeply nested.
- **Verification:** Always write or run tests/scripts to verify that the math in `costController.js` remains perfectly accurate when modifying it. Cost calculation is the core value of this app.
- **Frontend Styling:** Use Tailwind utility classes. For animations, default to Framer Motion using subtle, professional easing (`ease: "easeInOut", duration: 0.3`).
