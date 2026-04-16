# Plan: Configuración Avanzada de Presupuestos

**Estado:** Completado
**Rama:** (Por definir)


## 1. Configuración de Moneda
- **Nivel de Sistema (Ajustes Globales):**
  - Añadir en el menú de "Configuración del Sistema" un campo para definir la **Moneda Default para Presupuestos**.
  - Aunque el sistema interno trabaje en dólares (USD base), el repostero puede definir si por defecto sus presupuestos se emiten en VES (Bolívares) o USD.
- **Nivel de Presupuesto (Módulo Individual):**
  - Al crear o editar un presupuesto específico, debe existir un selector de moneda (USD/VES) que sobrescriba temporalmente el ajuste global para ese documento en particular.
  - El sistema de costos debe asegurar la conversión utilizando la tasa de cambio vigente asociada al presupuesto.

## 2. Personalización Visual: Logo
- **Configuración Global:**
  - Permitir subir y almacenar un **Logo Personalizado** de la marca del repostero en las configuraciones del sistema.
  - Al generar el PDF o la vista compartida del presupuesto, este logo debe posicionarse en la cabecera (header) del documento.

## 3. Textos y Notas Finales Configurables
- **Configuración Global:**
  - Campo de texto largo para definir las **Políticas Generales** (ej. "Términos y Condiciones", "Información relacionada a tasas de cambio", "Validez del presupuesto").
  - Estos textos se anexarán automáticamente al final de cada nuevo presupuesto.
- **Nivel de Presupuesto:**
  - Posibilidad de editar este texto "boilerplate" en cada presupuesto individual antes de enviarlo.

## 4. Opciones de Pago Flexibles (Estructura JSON)
- **Objetivo:** Permitir n opciones de pago (Zelle, Pago Móvil, PayPal, Transferencia, Efectivo) con estructuras de datos dinámicas.
- **Implementación (Backend - Esquema de Base de Datos):**
  - Crear una tabla/entidad `PaymentMethods` asociada al usuario, o almacenar estas configuraciones como un campo `JSONB` en la tabla de perfil de usuario o configuraciones globales.
  - *Estructura Sugerida:*
    ```json
    [
      {
        "type": "Pago Móvil",
        "currency": "VES",
        "details": {
          "banco": "Mercantil",
          "telefono": "0414-XXXXXXX",
          "cedula": "V-XXXXXXXX"
        }
      },
      {
        "type": "PayPal",
        "currency": "USD",
        "details": {
          "correo": "pagos@mireposteria.com"
        }
      }
    ]
    ```
- **Implementación (Frontend):**
  - Crear una interfaz en Ajustes para agregar y estructurar estos métodos dinámicamente.
  - Al visualizar el presupuesto, renderizar esta información de manera limpia y organizada en el footer del PDF/vista previa, agrupando por moneda y método.
