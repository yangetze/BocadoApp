# Guía de Estilos Frontend - BocadoApp (Visión 2026) 🍰✨

Bienvenido a la guía visual de BocadoApp. Esta aplicación SaaS para reposteros profesionales está diseñada bajo la estética de **"Minimalismo Sensorial"**.

Nuestro objetivo es crear una interfaz "Data-First" extremadamente limpia para manejar cálculos complejos, pero que al mismo tiempo se sienta humana, orgánica y con texturas sutiles que evoquen el mundo de la repostería (masas, cremas, harina espolvoreada).

---

## 🎨 1. Paleta de Colores Oficial (Sólidos)

La paleta se compone de tres colores fundamentales que guían toda la interfaz:

- **Primary (Color de Marca): Peach Soft `#F7C5B2`**
  - **Uso:** Iconos clave, batidores (elementos del logo), estados activos (active states), acentos visuales y el mango del batidor en el logo.
  - **Sensación:** Calidez, dulzura sutil, el color de una masa horneada perfecta.

- **Secondary (Tipografía y Estructura): Slate Gray `#3E4A59`**
  - **Uso:** Textos principales, bordes de contenedores, elementos estructurales (tablas, líneas divisorias) y botones de acción principal.
  - **Sensación:** Profesionalismo, legibilidad absoluta, solidez de utensilios de acero.

- **Base (Fondo): Clean White `#FFFFFF`**
  - **Uso:** El lienzo principal sobre el que respira la aplicación.
  - **Sensación:** Higiene, espacio negativo, "Data-First".

---

## 🌓 2. Modos de Visualización (Guía 2026)

### Light Mode (Por Defecto)
El Light Mode es la experiencia principal de BocadoApp.
- **Fondo:** Clean White `#FFFFFF`.
- **Texto Principal:** Slate Gray `#3E4A59`.
- **Estados Interactivos (Hover/Focus):** Usa el Primary **Peach Soft `#F7C5B2` con opacidad al 10%**.
  - *Ejemplo Tailwind:* `bg-[#F7C5B2]/10` para filas de tablas al hacer hover o para el fondo de los inputs de texto cuando están enfocados (`focus:bg-[#F7C5B2]/10`).

### Dark Mode (Automático)
El Dark Mode debe sentirse como entrar a una cocina profesional de noche: elegante y descansado a la vista.
- **Fondo Base:** Invierte el Secondary. Usa Slate Gray `#3E4A59` como fondo de la aplicación.
- **Texto Principal:** Blanco Roto `#FDFDFD`.
- **Acentos:** El Peach Soft `#F7C5B2` se mantiene como color de acento, pero se recomienda aplicarle un ligero incremento de brillo o contraste para que destaque sobre el fondo oscuro.

---

## 🔘 3. Componentes Clave

### Botones
- **Regla de Usabilidad (Agregada Feb 2025):** El botón primario ("Guardar", "Crear", etc.) debe tener **siempre un color fuerte y de alto contraste** (idealmente Slate Gray `#3E4A59`) para evitar que parezca bloqueado o deshabilitado. El uso de colores muy suaves (como Peach Soft sólido) para botones principales de acción ha demostrado ser confuso para los usuarios.
- **Botón Primario:** Fondo Slate Gray `#3E4A59` con texto blanco.
  - *Tailwind:* `bg-[#3E4A59] text-white hover:bg-opacity-90 transition-colors`
- **Botón Secundario:** Borde Peach Soft `#F7C5B2` con texto Peach Soft. Fondo transparente.
  - *Tailwind:* `border-2 border-[#F7C5B2] text-[#F7C5B2] hover:bg-[#F7C5B2]/10 transition-colors`

### Empty States (Estados Vacíos)
Cuando no hay datos (ej. "Aún no tienes recetas creadas"), no mostramos una pantalla vacía y aburrida.
- **Visual:** Ilustraciones lineales que usen la combinación de Peach Soft `#F7C5B2` y Slate Gray `#3E4A59` con mucha ligereza y trazos finos (ej. un batidor de globo descansando sobre un bol vacío).
- **Texto:** Mensaje amigable y de apoyo.

---

## 🌿 4. Texturas Orgánicas (El "Sensorial" del Minimalismo)

Para evitar que el "Data-First" se vuelva frío o corporativo, aplicaremos sutiles toques orgánicos:
- **Bordes Suaves:** Evitamos esquinas 100% afiladas. Los contenedores principales deben usar `rounded-2xl` o `rounded-xl`.
- **Sombras Difusas:** Las sombras de las tarjetas (cards) no deben ser duras. Deben simular la luz natural sobre una encimera blanca.
  - *Sugerencia Tailwind:* `shadow-[0_8px_30px_rgb(0,0,0,0.04)]` (muy sutil).
- **Ruido/Grain Sutil (Opcional):** Para fondos muy amplios, se puede considerar un filtro SVG de ruido con opacidad inferior al 2% para darle "tacto" a la pantalla, como si fuera papel vegetal de repostería.

---

## 🗣️ 5. Voz y Tono (Microcopy)

- **Idioma:** Todos los textos, mensajes de error, notificaciones y placeholders de la aplicación **deben estar exclusivamente en Español**.
- **Tono:** **Amigable, alentador y profesional.**
  - *En lugar de:* "Error 404: Ruta no encontrada."
  - *Usa:* "¡Ups! Parece que esta receta no está en nuestro recetario."
  - *En lugar de:* "Datos insuficientes."
  - *Usa:* "Agrega algunos ingredientes para que podamos calcular la magia."

---

## 🖼️ 6. Activos Visuales (Iconos y Logos)

Los iconos de la aplicación (Favicon y App Icon) deberán ubicarse en la carpeta pública del frontend una vez que el diseñador los provea.

**Rutas esperadas para que el código las lea automáticamente:**
- **Favicon (Pestaña del navegador):** `apps/frontend/public/favicon.ico`
- **Apple Touch Icon (Logo de la App en móviles/PWA):** `apps/frontend/public/apple-touch-icon.png` (Idealmente 180x180px o 512x512px).
- **Logo SVG (Header de la app):** `apps/frontend/public/logo.svg`

*Nota para el desarrollador:* Cuando subas los archivos de iconos a estas rutas, asegúrate de referenciarlos correctamente en `apps/frontend/index.html` (o `_document.tsx` si el stack cambia a Next.js en el futuro).
## 📱 7. Diseño Responsivo (Responsive Design)

La aplicación debe ser completamente usable desde dispositivos móviles. El enfoque "Data-First" debe adaptarse a pantallas pequeñas sin sacrificar la claridad.

### Navegación Móvil
- **Menú Colapsado:** En pantallas móviles (menores a `sm` o `md` en Tailwind), la navegación principal debe colapsarse en un menú tipo "hamburguesa" (Hamburger Menu).
- **Accesibilidad:**
  - El botón del menú hamburguesa debe tener un `aria-label="Abrir menú de navegación"` o `aria-label="Cerrar menú de navegación"`.
  - Debe usar `aria-expanded="true"` o `aria-expanded="false"` dependiendo del estado del menú.
- **Interacción:** El menú colapsable debe usar animaciones suaves (ej. Framer Motion o transiciones de Tailwind) para aparecer/desaparecer. El menú debe ocupar toda la pantalla o un panel lateral (drawer) para facilitar la selección de opciones con el dedo (touch targets amplios).
- **Prioridad de Acción:** Las acciones principales (ej. crear nueva receta, buscar) deben mantenerse accesibles rápidamente, idealmente fuera del menú hamburguesa si el espacio lo permite, o como opciones destacadas dentro del menú.
