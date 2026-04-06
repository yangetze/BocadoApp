# Plan: Resumen Total de Ingredientes

## 1. Descripción del Problema
Al armar recetas base o súper recetas, el usuario (por ejemplo, un repostero) necesita saber la cantidad total exacta de cada ingrediente requerido para poder preparar el producto final. Si un ingrediente, como el azúcar, se utiliza en múltiples sub-componentes (por ejemplo, en el bizcocho de vainilla y en el relleno de limón), el sistema debe consolidar y sumar estas cantidades para mostrar un total global (ej. Azúcar: 120 gr).

## 2. Objetivo
Agregar una nueva sección en la interfaz de usuario (en el Builder de Recetas Base y Súper Recetas) llamada "Totales de Ingredientes" o "Resumen de Ingredientes" que calcule y agrupe automáticamente las cantidades totales de cada ingrediente necesario.

## 3. Lógica Matemática y Agrupación
El cálculo del total de ingredientes dependerá de si estamos en una Receta Base o en una Súper Receta.

### 3.1. En Recetas Base
Una Receta Base está compuesta únicamente por ingredientes directos.
*   **Lógica:** Iterar sobre la lista de componentes/ingredientes actuales en el Builder.
*   **Agrupación:** Si el mismo ingrediente se añade varias veces (lo cual no es común, pero posible), sus cantidades se suman.
*   **Fórmula:** `Total Ingrediente X = Suma(cantidad de X ingresada)`.

### 3.2. En Súper Recetas
Una Súper Receta está compuesta por Recetas Base y por Ingredientes Directos (ej. cajas, decoraciones).
*   **Lógica para Ingredientes Directos:** Iterar sobre los ingredientes directos agregados a la súper receta y sumar sus cantidades.
*   **Lógica para Recetas Base:**
    *   Iterar sobre cada Receta Base incluida en la Súper Receta.
    *   Para cada Receta Base, identificar la cantidad que se está solicitando (`quantityNeeded`) y el rendimiento base original de esa receta (`baseYield`).
    *   El factor de proporción para los ingredientes de esa receta base es: `Factor = quantityNeeded / baseYield`.
    *   Para cada ingrediente que compone esa receta base, la cantidad requerida en la súper receta es: `Cantidad Final = cantidad original en la receta base * Factor`.
*   **Consolidación:** Crear un mapa o diccionario donde la clave sea el ID del ingrediente. Sumar las cantidades calculadas tanto de ingredientes directos como de los provenientes de las recetas base proporcionales.

## 4. Diseño de la Interfaz de Usuario (UI)
*   **Ubicación:** En la pantalla de creación/edición de Recetas Base y Súper Recetas (posiblemente al final del `Builder.jsx` o en un panel lateral/flotante).
*   **Título de la Sección:** "Totales de Ingredientes".
*   **Formato de Visualización:** Una lista o tabla simple y limpia que muestre:
    *   Nombre del ingrediente.
    *   Cantidad total calculada.
    *   Unidad de medida (ej. "Azúcar: 120 gr").
*   **Actualización Dinámica:** Este resumen debe actualizarse en tiempo real conforme el usuario modifica las cantidades, agrega o elimina componentes en el constructor.

## 5. Cambios Propuestos en el Código
*   **Frontend (`apps/frontend`):**
    *   Desarrollar un hook o función matemática (ej. `calculateIngredientTotals(items, type)`) que realice la agrupación y el cálculo de proporciones en memoria.
    *   Crear un componente `IngredientsSummary.jsx` que reciba el resultado del cálculo y lo renderice amigablemente.
    *   Integrar este componente dentro de la vista principal del constructor, asegurando que reciba el estado actual de los ítems.
*   **Backend (`apps/backend`):**
    *   Como MVP, el cálculo dinámico en el frontend durante la edición es suficiente. En etapas posteriores se podría implementar un endpoint para generar un reporte detallado.

## 6. Próximos Pasos
1.  Implementar la función de cálculo con soporte para proporciones matemáticas.
2.  Crear pruebas unitarias en el frontend para validar que las sumas de ingredientes duplicados en distintas recetas base sean correctas.
3.  Desarrollar y estilizar el componente `IngredientsSummary.jsx` según el diseño "Sensory Minimalism".
4.  Integrar el componente en el flujo actual de armar Súper Recetas y Recetas Base.

## 7. Tareas y Pruebas Detalladas

*   [x] **Modificar `useBuilder.js`**:
    *   [x] Crear función interna o memoizada `calculateIngredientTotals` o state `ingredientTotals` que reaccione a `canvasItems`.
    *   [x] Lógica para modo `baseRecipe`: sumar las cantidades (`quantity`) de cada ingrediente directo.
    *   [x] Lógica para modo `superRecipe`: iterar sobre los `canvasItems` (que son recetas base), calcular su proporción (`quantity` / `baseYield`) y multiplicar esta proporción por la `quantity` de cada ingrediente interno de la receta base. Consolidar usando `ingredientId`.
*   [x] **Crear `IngredientsSummary.jsx`**:
    *   [x] Crear componente visual en `apps/frontend/src/components/DragAndDrop/IngredientsSummary.jsx`.
    *   [x] Mostrar la lista consolidada con nombre, cantidad y unidad, siguiendo "Sensory Minimalism".
*   [x] **Actualizar `Builder.jsx`**:
    *   [x] Importar `IngredientsSummary`.
    *   [x] Pasar `ingredientTotals` calculado al componente.
    *   [x] Mostrar el resumen en los modos `baseRecipe` y `superRecipe`.
*   [x] **Crear Pruebas Unitarias (`useBuilder.test.js`)**:
    *   [x] Añadir un test que valide el cálculo correcto en modo `baseRecipe` (suma de ingredientes duplicados si aplica).
    *   [x] Añadir un test que valide el cálculo en modo `superRecipe` (validando proporciones exactas para una súper receta que contenga dos instancias de una receta base o dos recetas base diferentes).
