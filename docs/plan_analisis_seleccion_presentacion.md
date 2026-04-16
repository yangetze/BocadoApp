# Análisis: Momento adecuado para la selección de Presentaciones (Marcas)

**Estado:** Completado
**Rama:** docs/analisis-seleccion-marcas

## 🎯 Objetivo
Analizar y definir en qué punto del flujo de trabajo (Creación de Súper Recetas vs. Creación de Presupuestos) es el momento óptimo para que el usuario seleccione la presentación específica (marca) de un ingrediente, con el fin de calcular el costo real de manera precisa y mantener un flujo de trabajo lógico.

## 📋 Tareas
- [x] Redactar un documento de análisis (`docs/analisis_seleccion_presentaciones.md`) evaluando los pros y contras de seleccionar la marca en el Constructor de Súper Recetas vs. en el Constructor de Presupuestos.
- [x] Considerar el impacto en la reutilización de recetas y la variabilidad de precios.
- [x] Proponer una recomendación final de diseño arquitectónico y de UX basada en el análisis.


# Análisis: Selección de Presentaciones (Marcas) de Ingredientes

Este documento analiza en qué momento del flujo de trabajo del usuario es más adecuado seleccionar la presentación específica (marca y empaque) de un ingrediente. El objetivo es calcular el costo de manera precisa manteniendo una buena experiencia de usuario (UX) y un diseño arquitectónico limpio.

Existen dos momentos clave donde esta selección podría ocurrir:

1.  **Durante la creación de la Súper Receta (Super Recipe).**
2.  **Durante la creación del Presupuesto (Budget).**

A continuación, se analizan los pros y contras de cada enfoque.

---

## 1. Selección en el Constructor de Súper Recetas

En este modelo, cuando el usuario añade un "Ingrediente Directo" (ej. Caja de cartón, Topper, o un ingrediente que no requiere preparación previa) a una Súper Receta, se le pide que seleccione exactamente qué marca y presentación utilizará (ej. "Caja de Cartón Marca X, paquete de 10").

### Pros
*   **Cálculo de Costo Inmediato:** El costo de la Súper Receta es exacto e inmediatamente calculable desde el momento de su creación. No hay ambigüedad sobre el precio.
*   **Simplicidad Inicial para Presupuestos:** Cuando el usuario crea un Presupuesto e incluye esta Súper Receta, el costo base ya está completamente definido.

### Contras
*   **Pérdida de Reusabilidad:** Si la Súper Receta está "atada" a marcas específicas de cajas o insumos, ¿qué pasa si el usuario quiere vender la *misma* torta pero en una caja más económica para un cliente, y en una caja premium para otro? Tendría que duplicar la Súper Receta entera solo para cambiar la caja. Esto rompe el principio de DRY (Don't Repeat Yourself) en la gestión de recetas.
*   **Mantenimiento Complejo:** Si una marca específica deja de estar disponible o cambia de precio drásticamente, el usuario tendría que actualizar *todas* las Súper Recetas que usaban esa presentación.

---

## 2. Selección en el Constructor de Presupuestos (Recomendado)

En este modelo, la Súper Receta define los componentes a nivel "genérico" o "abstracto" (ej. "1 Caja de Cartón 20x20", "1 Topper de Feliz Cumpleaños"). La selección de la marca específica (ej. "Caja Marca X Premium") se retrasa hasta el momento de armar el Presupuesto final para el cliente.

### Pros
*   **Alta Reusabilidad:** La Súper Receta ("Torta de Chocolate de 1/2 kilo") se mantiene agnóstica a los empaques o marcas específicas. Puede ser reutilizada infinitas veces en diferentes presupuestos.
*   **Flexibilidad de Precios:** El usuario puede adaptar el presupuesto al cliente. Puede elegir una caja económica para un presupuesto ajustado, o una caja premium para un evento especial, usando exactamente la misma receta base.
*   **Alineación con la Realidad del Negocio:** En negocios de repostería y catering, las recetas base (el producto en sí) son estables, pero los insumos finales (empaques, decoraciones específicas) varían según el pedido.
*   **Soporte de Base de Datos:** Nuestro esquema actual en Prisma ya soporta esto mediante la tabla `BudgetBrandSelection`, que relaciona un `Budget`, un `Ingredient` genérico, y una `BrandPresentation` específica.

### Contras
*   **Fricción en la UX del Presupuesto:** Si un Presupuesto tiene 15 ingredientes directos genéricos, forzar al usuario a seleccionar manualmente la presentación para cada uno *cada vez* que hace un presupuesto sería tedioso.
*   **Costo de la Súper Receta "Incompleto":** El costo visualizado en la pantalla de "Súper Receta" sería un estimado (usando `globalPrice` del ingrediente) o estaría incompleto hasta que se use en un presupuesto.

---

## Recomendación Final de Arquitectura y UX

Basado en el análisis, la **Selección en el Constructor de Presupuestos** es la arquitectura correcta para mantener la escalabilidad y flexibilidad del sistema.

Para mitigar el contra principal (fricción en UX), se debe implementar un sistema de **"Smart Defaults" (Valores por Defecto Inteligentes)**:

1.  **Definición en la Súper Receta:** La Súper Receta usa ingredientes genéricos (ej. "Caja").
2.  **Presentación por Defecto:** En el módulo de Ingredientes, el usuario debe poder marcar una presentación como "Predeterminada" o el sistema debe usar la presentación con el mejor costo/beneficio automáticamente.
3.  **Generación del Presupuesto:** Cuando el usuario añade la Súper Receta al Presupuesto, el sistema **auto-selecciona** las presentaciones por defecto para todos los ingredientes directos genéricos en segundo plano, y crea los registros en `BudgetBrandSelection`.
4.  **Edición Opcional (UX):** El usuario ve el presupuesto ya calculado con las opciones por defecto. Solo si desea cambiar la caja "estándar" por una "premium" hace clic en editar y cambia la selección para ese presupuesto específico.

**Impacto en la Base de Datos:**
La estructura actual (`BudgetBrandSelection`) es perfecta y no requiere cambios de esquema. El trabajo se centrará en la lógica de negocio (Backend) para auto-poblar estas selecciones al crear el presupuesto, y en el Frontend para permitir la modificación ágil de estas selecciones.

### Botones de Selección Inteligente (Smart Defaults UI)
En el constructor de presupuestos, se debe incluir un grupo de botones de acción rápida que permita al usuario aplicar reglas globales para la selección automática de marcas en todos los ingredientes genéricos del presupuesto:
- **"Usar Favoritas" (Por Defecto):** Selecciona automáticamente la presentación que el usuario haya marcado previamente como "favorita" o "predeterminada" en el módulo de Ingredientes.
- **"Usar Más Económicas":** Busca todas las presentaciones disponibles para cada ingrediente y selecciona automáticamente la de menor costo por unidad, optimizando el presupuesto.

### Desglose Jerárquico de Ingredientes y Marcas
Visualmente, el presupuesto debe mostrar un desglose claro de la Súper Receta. Si hay múltiples unidades de la misma Súper Receta (ej. 2 tortas), el resumen de ingredientes debe consolidarse.
La diferencia crucial con las vistas anteriores (Receta Base / Súper Receta) es que si un mismo ingrediente genérico está asociado a *múltiples marcas diferentes* dentro del presupuesto, debe mostrarse jerárquicamente:

**Formato Esperado:**
`Nombre Ingrediente - Cantidad Total Unidad - Precio Total`
  `- Marca 1 - Cantidad Unidad - Precio Parcial`
  `- Marca 2 - Cantidad Unidad - Precio Parcial`

**Ejemplo Práctico:**
`Azúcar Blanca - 1 kg - 3$`
  `- Montalban - 0,20 kg - 1$`
  `- Kaly - 0,80 kg - 2$`

---

## 🚀 Plan de Ejecución (Implementación Presupuestos)

1. **Backend - Prisma Schema Update (Opcional/Verificación):**
   - Asegurar que el modelo `BrandPresentation` tenga un campo `isFavorite` (Boolean, default: false) si no existe.
2. **Backend - Lógica de Auto-Selección (Smart Defaults):**
   - Crear un endpoint o servicio que, dado un `budgetId`, reciba una regla (`FAVORITE` o `CHEAPEST`) y actualice/cree automáticamente los registros en `BudgetBrandSelection` para todos los ingredientes genéricos dentro del presupuesto.
3. **Frontend - UI Botones de Selección Inteligente:**
   - En el `BudgetBuilder` (o componente equivalente), agregar los botones "Usar Favoritas" y "Usar Más Económicas".
   - Conectar estos botones a la API desarrollada en el paso 2 y refrescar el estado del presupuesto al finalizar.
4. **Backend - Endpoint de Desglose Jerárquico:**
   - Modificar el endpoint de obtención del presupuesto (`GET /budgets/:id` o un endpoint específico de resumen) para que consolide las cantidades de ingredientes base y devuelva la estructura jerárquica (Ingrediente -> Marcas usadas) detallando cantidad y costo por marca.
5. **Frontend - UI Desglose Jerárquico:**
   - Actualizar el componente que renderiza el resumen de ingredientes en la vista del Presupuesto.
   - Implementar la lógica de renderizado anidado para mostrar el ingrediente padre y sus presentaciones hijas según el formato acordado.
