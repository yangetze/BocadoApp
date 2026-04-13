# Plan de Trabajo: Buscador de Ingredientes por Nombre y Marca

**Estado:** En desarrollo
**Rama:** feat/ingredientes-buscador

## 🎯 Objetivo
Implementar un buscador en la vista de ingredientes que permita filtrar la lista por nombre del ingrediente o por la marca de sus presentaciones.

## 📋 Tareas
- [ ] Investigar si el endpoint de ingredientes ya soporta búsqueda o si solo se hace en el frontend.
- [ ] Implementar un componente de búsqueda (Input) en la vista principal de ingredientes.
- [ ] Lógica de filtrado: El texto ingresado debe buscar coincidencias (case-insensitive) tanto en el nombre del ingrediente como en el nombre de cualquier marca asociada a sus presentaciones.
- [ ] Asegurar que la actualización sea en tiempo real (o con un ligero debounce) para una mejor experiencia de usuario.
- [ ] Probar el buscador con diferentes variaciones de nombres y marcas.
