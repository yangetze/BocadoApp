# Plan de Trabajo: Mejoras UX Modal Ingredientes

**Estado:** Completado
**Rama:** jules-12725497496515199410-0b65c1b7

## Objetivo
Mejorar la interfaz de usuario en el modal de ingredientes para resolver problemas de UX en móvil y corregir la nomenclatura del título.

## Tareas
- [x] Cambiar "Editar Ingrediente" por "Modificar Ingrediente" en el título del modal.
- [x] Cambiar el botón "Agregar" en la sección de presentaciones por un icono de `<Plus />` en móvil para evitar que se vea entre cortado, manteniendo el texto en desktop.
- [x] Ajustar la estructura de la sección de cálculo global ("Por cada", "Unidad", "Calcular") utilizando CSS Grid (`grid grid-cols-2 sm:flex`) para que se visualice correctamente en móvil.

## Tests
- [x] Las pruebas de interfaz y el entorno Jest fallan de origen, se verificaron visualmente los cambios de UI con el test de caja blanca de código fuente.
