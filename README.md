# BocadoApp 🍰

**SaaS Platform for Professional Bakers (Vision 2026)**

BocadoApp is a robust, data-dense platform built to help professional bakers take total control over their costs. By using a compositional data architecture, BocadoApp ensures that every gram of ingredient, every minute of labor (TBD), and every packaging item is accounted for, instantly reflecting global price changes across all recipes.

## 🌟 Key Features

1. **Total Cost Control:**
   - Define **Ingredients** (Base costs, usually in USD).
   - Create **Base Recipes** (e.g., 1000g of Vanilla Sponge Cake) using exact ingredient quantities.
   - Assemble **Super Recipes** (The final product: Sponge Cake + Filling + Frosting + Cake Box).
   - Generate **Budgets** with dynamic scaling (e.g., "I need a cake that is 2.5x the base recipe size") and profit margins.

2. **Dynamic Scalability:**
   - Adjust the yield of any order, and BocadoApp mathematically scales the exact required ingredients and costs automatically.

3. **Reactive Updates:**
   - Change the price of an egg or a bag of flour, and watch the production cost of hundreds of cakes update in real-time.

4. **Bimonetary System (USD/Local):**
   - Supports a base currency (like USD) while offering real-time conversions to local currencies via an exchange rate system.

## 🛠️ Architecture & Tech Stack

BocadoApp uses a modern **PERN Stack** encapsulated in a unified **NPM Workspace Monorepo**.

### Backend (`apps/backend`)
- **Node.js + Express:** Fast, reliable REST API.
- **Prisma ORM:** Deeply relational data modeling to support the complex compositional structure of recipes.
- **PostgreSQL:** Reliable relational database.

### Frontend (`apps/frontend`)
- **React + Vite:** Lightning-fast frontend development and optimized builds.
- **Tailwind CSS:** Utility-first styling for a sleek, "Data-Dense" 2026 design system.
- **Framer Motion:** Smooth, professional animations.
- **React Hot Toast / Sonner:** Elegant notification systems.

## 🧪 Pruebas con Supabase

Cuando se quieran hacer pruebas conectados a Supabase debe tomar los datos de ese archivo `.env.example`, los cuales son `userTest="juanTest"` y `PasswordTest="V-123"`. Asegúrese de copiar estas variables a su archivo `.env` local para las pruebas.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- NPM or Yarn
- PostgreSQL database running locally or remotely.

### Installation

1. Clone the repository and install dependencies from the root:
   ```bash
   npm install
   ```

2. Set up the backend environment:
   - Navigate to `apps/backend/`.
   - Create a `.env` file and add your database URL:
     ```env
     DATABASE_URL="postgresql://user:password@localhost:5432/bocadoapp?schema=public"
     PORT=3000
     ```

3. Initialize the database:
   ```bash
   cd apps/backend
   npx prisma generate
   npx prisma db push # Or use `npx prisma migrate dev`
   ```

### Running the Application

From the root directory, you can start the applications using the workspace scripts:

- **Start Backend (Dev Mode):**
  ```bash
  npm run dev:backend
  ```

- **Start Frontend (Dev Mode):**
  ```bash
  npm run dev:frontend
  ```

## 📐 Data Architecture Summary

The core logic relies on the following relational flow:
- `Ingredient`: The base atomic unit (Flour, Sugar, Box).
- `BaseRecipe`: A collection of `Ingredient`s that yields a specific quantity (e.g., 500g of icing).
- `SuperRecipe`: A composite of multiple `BaseRecipe`s and direct `Ingredient`s (e.g., The Wedding Cake).
- `Budget`: A customer order based on a `SuperRecipe`, scaled by a multiplier (e.g., 3x size), with a defined profit margin.

For more details on developing new features, AI agents should refer to the `AGENTS.md` file.

## 📄 License
Private project. All rights reserved.
