# Plan de Trabajo: Editar Receta Base

**Estado:** Completado
**Rama:** feat/edit-base-recipe

## 🎯 Objetivo
Permitir cargar una Receta Base existente en el constructor (Builder) para su edición, usar el endpoint de actualización y añadir pruebas.

## 📋 Tareas
- [x] Modificar `BaseRecipeManager` para mantener un estado `editingRecipe`.
- [x] Pasar `initialData` a través de `BaseRecipeBuilderWrapper` hasta `Builder`.
- [x] Modificar `useBuilder` para inicializar el estado del lienzo y metadata usando `initialData` si existe.
- [x] Modificar `handleSave` en `useBuilder` para que llame a `baseRecipeApi.update` si es una edición.
- [x] Enlazar el botón "Editar" en `BaseRecipeList` con el gestor.
- [x] Añadir tests unitarios comprobando la lógica de inicialización y actualización al guardar.
