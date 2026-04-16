# Plan de Trabajo: Buscador de Ingredientes por Nombre y Marca

**Estado:** Completado
**Rama:** feat/ingredientes-buscador

## 🎯 Objetivo
Implementar un buscador en la vista de ingredientes que permita filtrar la lista por nombre del ingrediente o por la marca de sus presentaciones.

## 📋 Tareas
- [x] Investigar si el endpoint de ingredientes ya soporta búsqueda o si solo se hace en el frontend.
- [x] Implementar un componente de búsqueda (Input) en la vista principal de ingredientes.
- [x] Lógica de filtrado: El texto ingresado debe buscar coincidencias (case-insensitive) tanto en el nombre del ingrediente como en el nombre de cualquier marca asociada a sus presentaciones.
- [x] Asegurar que la actualización sea en tiempo real (o con un ligero debounce) para una mejor experiencia de usuario.
- [x] Probar el buscador con diferentes variaciones de nombres y marcas.

- [x] Implementar buscador en Listado de Recetas Base
- [x] Agregar directrices de buscador a frontend-styleguide.md