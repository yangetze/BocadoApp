# 🔐 Plan de Trabajo: Autenticación y Registro (BocadoApp)

Este plan detalla la implementación del sistema de seguridad para el MVP 1.5, integrando el backend existente con una nueva interfaz de usuario moderna y segura.

---

## 🛠️ Fase 1: Refuerzo del Backend (Seguridad)
- [ ] **Middleware de Verificación**: Crear `authMiddleware.js` para proteger rutas privadas del API.
- [ ] **Validación de Datos**: Mejorar la validación en `authController.js` para asegurar correos válidos y contraseñas seguras.
- [ ] **Endpoint `/me`**: Crear un endpoint para que el frontend recupere el perfil del usuario actual usando su token JWT al recargar la página.

## 🎨 Fase 2: Interfaz de Usuario (Frontend)
- [ ] **Página de Login**: Diseño basado en la guía de estilos (Peach Soft & Slate Gray) con Framer Motion.
- [ ] **Página de Registro**: Formulario amigable para nuevos reposteros.
- [ ] **AuthContext**: Implementar el `AuthContext.jsx` en React para persistir la sesión en `localStorage`.

## 🛡️ Fase 3: Protección de la Aplicación
- [ ] **Protección de Rutas**: Crear componentes `ProtectedRoute` para redirigir al Login si no hay sesión.
- [ ] **Navegación Dinámica**: Mostrar "Cerrar Sesión" y el nombre del pastelero en el Header si está logueado.

## 🧪 Fase 4: Pruebas y QA
- [ ] **Test de Flujo Completo**: Registro -> Login -> Acceso a Recetas Privadas.
- [ ] **Manejo de Errores**: Feedback visual (toasts/alertas) para "Credenciales Inválidas" o "Usuario Ya Existe".

---

> [!TIP]
> Dado que ya tenemos el motor de Prisma conectado a Supabase, el registro de usuarios creará filas reales en la tabla `User`. ¡Podremos verlo en vivo en el Dashboard de Supabase!

> [!IMPORTANT]
> El tono de voz de los mensajes de error y éxito debe ser siempre **amigable y en español**, como define nuestro guía de estilos.
