# Guía de Despliegue de BocadoApp (100% Gratuito)

¡Hola! Esta guía te explicará paso a paso cómo publicar BocadoApp en internet utilizando herramientas gratuitas, de manera que cualquier persona pueda acceder desde cualquier lugar.

Utilizaremos tres servicios principales:
1. **Supabase**: Para alojar la Base de Datos (PostgreSQL).
2. **Render**: Para alojar el Backend (Node.js).
3. **Vercel**: Para alojar el Frontend (React/Vite).

---

## Requisitos previos

1. Tu código debe estar en un repositorio en **GitHub** (puedes crear una cuenta gratuita en github.com y subir tu código allí si aún no lo has hecho).

---

## Paso 1: Base de Datos en Supabase

1. Ve a [Supabase.com](https://supabase.com/) y haz clic en "Start your project" (crea una cuenta si es necesario).
2. Haz clic en **"New project"** y selecciona una organización (puedes crear una con tu nombre).
3. Rellena el formulario:
   - **Name:** BocadoApp
   - **Database Password:** Escribe una contraseña segura y **guárdala en un lugar seguro** (la necesitarás pronto).
   - **Region:** Elige la más cercana a ti (ej. US East).
4. Haz clic en **"Create new project"**. Esto tardará unos minutos en configurar la base de datos.
5. Una vez que termine, en el menú lateral izquierdo busca el icono de un engranaje (⚙️ **Project Settings**) y luego haz clic en **"Database"**.
6. Desplázate hacia abajo hasta la sección **"Connection string"** (asegúrate de que la pestaña "URI" esté seleccionada).
7. Copia la URL que aparece allí. Se verá algo así:
   `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxx.supabase.co:5432/postgres`
8. Reemplaza `[YOUR-PASSWORD]` con la contraseña que creaste en el paso 3. **Esta es tu `DATABASE_URL` completa.** ¡Guárdala!

---

## Paso 2: Backend en Render

1. Ve a [Render.com](https://render.com/) y crea una cuenta gratuita (puedes usar tu cuenta de GitHub).
2. En el panel de control de Render (Dashboard), haz clic en el botón **"New"** y selecciona **"Web Service"**.
3. Selecciona **"Build and deploy from a Git repository"** y haz clic en "Next".
4. Conecta tu cuenta de GitHub y busca el repositorio donde tienes subido "BocadoApp". Haz clic en "Connect".
5. Verás una pantalla de configuración. Dado que el proyecto ya tiene un archivo `render.yaml`, Render debería autocompletar casi todo, pero verifica lo siguiente:
   - **Name:** bocadoapp-backend
   - **Region:** La misma (o cercana) a la que elegiste en Supabase.
   - **Branch:** main (o master)
   - **Root Directory:** *(déjalo vacío)*
   - **Runtime:** Node
   - **Build Command:** `npm install && npm run prisma:generate --workspace=apps/backend`
   - **Start Command:** `npm start --workspace=apps/backend`
   - **Instance Type:** Free
6. Desplázate hacia abajo hasta la sección **"Advanced"** y haz clic en **"Add Environment Variable"**.
   - **Key:** `DATABASE_URL`
   - **Value:** Pega aquí la URL completa que obtuviste de Supabase en el Paso 1.
7. Haz clic en **"Create Web Service"**.
8. Render comenzará a construir tu aplicación. Esto puede tardar unos minutos. Cuando termine y diga "Live", verás un enlace en la parte superior izquierda que se ve como `https://bocadoapp-backend-xxxxx.onrender.com`.
9. **Copia esta URL**, es la dirección de tu Backend en internet.

---

## Paso 3: Frontend en Vercel

1. Ve a [Vercel.com](https://vercel.com/) y crea una cuenta gratuita usando tu cuenta de GitHub.
2. En el panel de Vercel (Dashboard), haz clic en el botón negro **"Add New..."** y selecciona **"Project"**.
3. Busca el repositorio de BocadoApp en la lista de GitHub y haz clic en **"Import"**.
4. En la pantalla "Configure Project", asegúrate de que el **"Root Directory"** esté vacío. Vercel utilizará el archivo `vercel.json` de la raíz automáticamente.
5. En la misma pantalla, verás una sección llamada **"Environment Variables"** (Variables de entorno).
6. Abre esa sección y añade lo siguiente:
   - **Name:** `VITE_API_URL`
   - **Value:** Pega la URL que obtuviste en Render (Paso 2, punto 9) y añádele `/api` al final.
     *Ejemplo: `https://bocadoapp-backend-xxxxx.onrender.com/api`*
   - Haz clic en **"Add"**.
7. (El archivo `vercel.json` en la raíz del proyecto se encargará del resto de la configuración automáticamente).
8. Haz clic en el botón **"Deploy"**.
9. Espera un par de minutos a que Vercel construya la aplicación. Cuando termine, ¡te mostrará confeti 🎉 y te dará un enlace (URL)!
10. **Haz clic en ese enlace**. ¡Esa es tu aplicación BocadoApp funcionando en internet para cualquier usuario!

---

## Recomendaciones de Seguridad (Opcional pero Recomendado)

Actualmente, por facilidad de despliegue, el Backend acepta peticiones de cualquier lugar (CORS abierto). Una vez que tu frontend esté funcionando en Vercel:

1. Ve a tu código en `apps/backend/src/index.js`.
2. Busca la línea: `app.use(cors());`
3. Cámbiala por:
   ```javascript
   app.use(cors({
     origin: 'https://tu-url-de-vercel.vercel.app'
   }));
   ```
4. Sube este cambio a GitHub, y Render lo actualizará automáticamente en un par de minutos para que solo tu aplicación de Vercel pueda comunicarse con tu Backend.

¡Felicidades por tu despliegue!
