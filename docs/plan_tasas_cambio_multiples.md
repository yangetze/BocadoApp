# Plan de Trabajo: Tasas de Cambio Múltiples

**Estado:** Completado
**Rama:** (Por definir)


## 🎯 Objetivo
Habilitar el soporte para múltiples tasas de cambio simultáneas (Oficial, Paralelo, Euro, Manual) para la misma fecha, garantizando que cada combinación de **Origen** y **Fecha** sea única en el sistema.

## 📋 Tareas
- [x] Base de Datos: Modificar la tabla de tasas de cambio para incluir un identificador de **Origen** (`official`, `parallel`, `euro`, `manual`).
- [x] Lógica de Negocio: Implementar una restricción de unicidad para la combinación `(date, source)`.
- [x] Backend: Al realizar una sincronización o carga manual, usar lógica UPSERT (si existe el par fecha/origen, actualizar; si no, crear).
- [x] Frontend: Permitir que el usuario seleccione el origen de la tasa a sincronizar o cargar manualmente.
- [x] Frontend: Mostrar el listado completo de las tasas activas del día según su origen.
- [x] Integración: Prever qué tasa se usará como base para el cálculo de costos (ej. seleccionar una "tasa por defecto").
