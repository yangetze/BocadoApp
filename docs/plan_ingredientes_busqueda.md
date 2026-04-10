# Plan de Trabajo: Búsqueda de Ingredientes

**Estado:** Completado
**Rama:** (Por definir)



## 🎯 Objetivo

Implementar una barra de búsqueda en el módulo de Ingredientes que permita filtrar por **Nombre** o **Marca**, asegurando que la búsqueda sea **case-insensitive** (insensible a mayúsculas/minúsculas).

## 📋 Tareas

- [x] Backend: Ajustar el controlador/servicio de ingredientes para permitir filtrado por `name` y `brand` usando Prisma (`mode: 'insensitive'`).
- [x] Frontend: Implementar el input de búsqueda en la cabecera de la lista de ingredientes.
- [x] Frontend: Sincronizar el estado de búsqueda con las peticiones al backend.
- [x] Verificación: Probar con diferentes combinaciones de mayúsculas y minúsculas.
