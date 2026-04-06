# Plan: Exportación y Visualización de Presupuestos en PDF

## 1. Previsualización de Presupuesto (PDF)
- **Objetivo:** Permitir al usuario (repostero) previsualizar exactamente cómo se verá el presupuesto en formato PDF antes de generarlo, descargarlo o enviarlo.
- **Implementación (Frontend):**
  - Crear un componente modal o una vista dedicada de "Previsualización".
  - El diseño debe reflejar fielmente los estilos del sistema (Minimalismo Sensorial) pero adaptado al formato A4 de impresión/PDF.
  - Renderizar los datos del presupuesto actual: cliente, items (Súper Recetas), precios, moneda, notas configuradas y opciones de pago.

## 2. Descarga del Presupuesto como PDF
- **Objetivo:** Generar un archivo `.pdf` que el usuario pueda descargar a su dispositivo local.
- **Implementación (Frontend/Backend):**
  - Opción A (Frontend-only): Usar librerías como `html2pdf.js` o `@react-pdf/renderer` para transformar la vista de previsualización directamente en un PDF en el navegador.
  - Opción B (Backend-driven): Enviar los datos del presupuesto al backend y usar herramientas como `puppeteer` para generar el PDF y devolver el archivo como un stream binario.
  - *Recomendación:* Evaluar `@react-pdf/renderer` por su compatibilidad con React y flexibilidad de diseño para asegurar que el PDF cumpla con los estándares visuales de BocadoApp.

## 3. Generación de Enlace de Descarga
- **Objetivo:** Facilitar al repostero el envío del presupuesto mediante un enlace, en lugar de adjuntar un archivo pesado.
- **Implementación (Backend/Frontend):**
  - **Almacenamiento:** Cuando se decide compartir un presupuesto, guardar el PDF generado (o una versión de solo lectura de los datos) en un servicio de almacenamiento en la nube o sistema de archivos (ej. directorio público temporal o AWS S3/equivalente si aplica en el futuro, o directamente crear una vista pública en el frontend).
  - **Vista Pública Compartida:** La mejor opción para el MVP es generar una URL única (ej. `/shared/budget/:uuid`) en el frontend que recupere los datos del presupuesto en modo de solo lectura y ofrezca allí mismo el botón para descargar como PDF.
  - **Generación de Link:** Agregar un botón "Copiar Enlace" en la interfaz de gestión de presupuesto que genere esta URL de vista pública o un link directo de descarga.
