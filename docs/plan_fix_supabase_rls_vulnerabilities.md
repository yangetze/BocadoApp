# Plan: Fix Supabase RLS Vulnerabilities

**Estado:** Completado
**Rama:** fix-supabase-rls

## Objetivo
Resolver las vulnerabilidades críticas reportadas por el linter de seguridad de Supabase en el proyecto en producción:
1. `rls_disabled_in_public`: Tablas expuestas públicamente sin Row-Level Security.
2. `sensitive_columns_exposed`: Exposición de datos sensibles (contraseñas en la tabla de Usuarios) a través de la API pública.

## Contexto y Arquitectura
- BocadoApp utiliza una arquitectura basada en un backend personalizado en Node.js (Express) y Prisma ORM.
- Prisma se conecta a la base de datos usando un rol con privilegios (que ignora las políticas de RLS).
- La API Data de Supabase (PostgREST) no se utiliza en el frontend; toda la comunicación pasa por nuestro backend en Express.
- Las vulnerabilidades surgieron porque, por defecto, Supabase expone las tablas del esquema `public` mediante PostgREST y, al no tener RLS habilitado, cualquier usuario con la clave `anon` o la URL del proyecto podría interactuar con los datos directamente, saltándose nuestro backend.

## Solución Implementada
La solución elegida fue **habilitar RLS en todas las tablas del esquema `public` sin agregar políticas permisivas**.
- Al no existir políticas, la API de Supabase (PostgREST) denegará cualquier petición de lectura o escritura a los roles `anon` y `authenticated`. Esto cierra efectivamente la brecha de seguridad.
- Puesto que Prisma se conecta a la base de datos mediante un rol administrativo (ej. `postgres`), sus operaciones (y por tanto, las de nuestro backend Express) no se verán afectadas y continuarán funcionando con normalidad.

## Tareas Ejecutadas
- [x] Ejecutar la consulta SQL `ALTER TABLE "public"."NombreTabla" ENABLE ROW LEVEL SECURITY;` para todas las tablas del modelo.
- [x] Verificar con el Linter de Seguridad de Supabase (`supabase_get_advisors`) que las alertas críticas (`ERROR`) hayan desaparecido. (Aparecerán alertas de nivel `INFO` indicando que RLS está habilitado sin políticas, lo cual es el resultado esperado).
- [x] Correr la suite de pruebas del backend para asegurar que Prisma y la API sigan operando correctamente a pesar del cambio en la BD.
