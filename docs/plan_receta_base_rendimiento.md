# Plan de Trabajo: Rendimiento y Unidad de Rendimiento (3.6)

**Estado:** Backlog
**Rama:** (Por definir)


## 🎯 Objetivo
Definir y desarrollar los campos de **Rendimiento** (Yield) y **Unidad de Rendimiento** (Yield Unit) para las recetas finales.

## 📋 Tareas
- [ ] Análisis de Negocio: Estudiar el caso de las porciones vs peso de masa:
    - Ejemplo 1: Masa de galletas (300 gr) -> 30 galletas de 10 g cada una. (Rendimiento por piezas).
    - Ejemplo 2: Torta (900 gr) -> 2 tortas de 450 g cada una. (Rendimiento por unidad).
    - Ejemplo 3: Masa total -> ¿Para cuántas personas comiendo una porción estándar?
- [ ] CRUD: Añadir campos opcionales `yield` (Numérico) y `yieldUnit` (Texto/Selector, e.j.: "Galletas", "Tortas", "Personas") a la tabla de recetas.
- [ ] UI: Integrar estos campos en la cabecera o pie de la creación/edición de recetas.
- [ ] Cálculos: Asegurar que el costo por porción se calcule dividiendo el **Total** de la receta entre el **Rendimiento**.
