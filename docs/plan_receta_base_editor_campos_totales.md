# Plan de Trabajo: Editor de Recetas Base (Drag & Drop, Columnas y Totales) (3.4 & 3.5)

## 🎯 Objetivo
Rediseñar la fila de ingredientes arrastrados para incluir columnas de cantidad, unidad y costo calculado. Además, implementar un total general en la parte superior.

## 📋 Tareas
- [x] UI (Fila): Cambiar "Super Receta Hoy" por los datos del ingrediente (Nombre, Marca, Gramos base).
- [x] UI (Fila): Crear columna con input de texto abierto (sin flechas up/down) para la cantidad que se usará.
- [x] UI (Fila): Mostrar columna con la unidad fijada por el ingrediente.
- [x] Lógica UI (Fila): Crear columna que calcule el precio proporcional: `(Cantidad Ingresada * Precio Unitario)`.
- [x] Lógica (Receta): Añadir campo **Total** al final de la línea del **Nombre de la Receta**.
- [x] Sincronización: Al modificar cualquier cantidad, actualizar instantáneamente tanto el costo de la fila como el **Total** de la receta.

## 🛑 Reglas Adicionales
- Antes de crear el PR, asegúrate de actualizar el estado de este plan marcando las tareas completadas.
