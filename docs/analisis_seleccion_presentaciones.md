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
