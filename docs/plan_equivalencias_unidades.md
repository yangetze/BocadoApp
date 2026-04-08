# Plan de Trabajo: Equivalencias de Unidades y Resumen por Tipo

**Estado:** Backlog
**Rama:** (Por definir)


## 🎯 Objetivo
Permitir la conversión automática entre unidades de medida de la misma magnitud (peso, volumen) en la creación de recetas base y súper recetas (ej. Kg a gr, Litro a ml). Además, implementar un resumen agrupado de cantidades de ingredientes por tipo de magnitud (ej. líquidos en ml, secos en gr) en el resumen de ingredientes.

## 📋 Tareas

### Backend
- [ ] **Definir factores de conversión:** Crear una utilidad o constante que defina las familias de unidades y sus factores de conversión hacia una unidad base (ej. Magnitud Peso: unidad base `gr`, `Kg` = 1000 `gr`; Magnitud Volumen: unidad base `ml`, `Litro` = 1000 `ml`).
- [ ] **Lógica de cálculo unificada:** Implementar una función que convierta cualquier par `(cantidad, unidad_origen)` a `(cantidad_convertida, unidad_base)` utilizando los factores de conversión.
- [ ] **Agrupación por tipo:** Modificar la lógica del resumen de ingredientes para clasificar y sumar las cantidades según su magnitud base. Retornar en el payload del resumen un objeto con los totales por tipo (ej. `totalWeight: 2500` (gr), `totalVolume: 1500` (ml)).

### Frontend
- [ ] **Selectores dinámicos de unidades:** En los constructores de Recetas Base y Súper Recetas, cuando un ingrediente o sub-receta está configurado con una unidad base (ej. `gr`), poblar el selector de unidades con las opciones de su misma familia (`gr`, `Kg`).
- [ ] **Cálculo de equivalencias en UI:** Al ingresar una cantidad y seleccionar una escala distinta (ej. input `0.25` y selector `Kg`), mostrar la equivalencia u operar internamente usando el factor de conversión para calcular el costo proporcional correcto.
- [ ] **Nueva sección de resumen:** En el componente de Resumen de Ingredientes, renderizar una nueva tarjeta o sección que muestre la sumatoria total desglosada por tipo de producto:
  - Sólidos / Secos: `X gr` (o formateado inteligentemente a `Y Kg` si es muy grande).
  - Líquidos: `X ml` (o `Y Litros`).
  - Otros (ej. unidades enteras): `X un`.

## 🧪 Estrategia de Pruebas
- **Pruebas a añadir/actualizar:**
  - **Unitarias (Backend):** Crear nuevos tests con Jest para la función de conversión matemática, asegurando el correcto manejo de decimales (ej. `0.25 Kg` -> `250 gr`).
  - **Unitarias (Backend):** Crear tests para la función agrupador que sume correctamente una lista de ingredientes con escalas mezcladas (ej. sumar `500 gr` y `1.2 Kg` = `1700 gr`).
  - **Componentes (Frontend):** Actualizar tests del generador de recetas para probar que seleccionar `Kg` en lugar de `gr` y colocar una cantidad decimal calcula bien el costo final del ítem antes de guardarlo.
