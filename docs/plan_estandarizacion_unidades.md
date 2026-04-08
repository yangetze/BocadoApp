# Plan de Trabajo: Estandarización de Unidades de Medida

**Estado:** Backlog
**Rama:** (Por definir)



## 🎯 Objetivo

Estandarizar todas las unidades de medida en la aplicación para cumplir con nomenclaturas uniformes.

## 📋 Tareas

- [ ] Auditoría de Unidades: Buscar en la base de datos y el código todas las abreviaturas actuales (`g`, `gr`, `kg`, `ml`, `l`, etc.).
- [ ] Base de Datos (PostgreSQL): Actualizar los registros existentes en la tabla de unidades (si aplica) o en los registros de ingredientes/recetas.
- [ ] Backend: Revisar posibles validadores que dependan de estas abreviaturas.
- [ ] Frontend: Actualizar las etiquetas y selectores para mostrar la nueva nomenclatura:
  - Cambiar `g` por `gr` (según solicitud del usuario).
  - Verificar y ajustar otras: `Kg`, `L`, `ml`.
- [ ] Pruebas: Asegurar que los cálculos de costos no se vean afectados por el cambio de nombre de la unidad.
