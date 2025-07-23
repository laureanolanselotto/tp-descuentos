# Sistema de Autenticación - TP Descuentos

## Descripción General

Se ha implementado un sistema completo de autenticación JWT (JSON Web Tokens) para la aplicación TP Descuentos. Este sistema permite registro, login, y protección de rutas usando tokens de seguridad.

## 🏗️ Arquitectura del Sistema

### Backend (src/auth/)

```
src/auth/
├── user.entity.ts          # Entidad Usuario y DTOs
├── user.repository.ts      # Repositorio en memoria para usuarios
├── auth.service.ts         # Lógica de negocio de autenticación
├── auth.controller.ts      # Controladores HTTP
├── auth.middleware.ts      # Middleware de autenticación
└── auth.routes.ts          # Rutas de la API
```

### Frontend (front/services/)

```
front/services/
└── auth.js                 # Servicio de autenticación para el cliente
```

### Páginas Actualizadas

```
Ingreso/
├── login.html              # Página de login funcional
└── signup.html             # Página de registro funcional

front/
└── index.html              # Página principal con estado de autenticación
```

## 🚀 Funcionalidades Implementadas

### 1. **Registro de Usuarios**
- **Endpoint:** `POST /api/auth/register`
- **Campos:** email, password, nombre, apellido
- **Validaciones:** 
  - Email único y formato válido
  - Contraseña mínima de 6 caracteres
  - Nombre y apellido requeridos
- **Respuesta:** Usuario creado + token JWT

### 2. **Inicio de Sesión**
- **Endpoint:** `POST /api/auth/login`
- **Campos:** email, password
- **Seguridad:** Contraseñas hasheadas con bcrypt
- **Respuesta:** Información del usuario + token JWT

### 3. **Verificación de Token**
- **Endpoint:** `POST /api/auth/verify`
- **Uso:** Validar tokens existentes
- **Respuesta:** Estado de validez del token

### 4. **Perfil de Usuario**
- **Endpoint:** `GET /api/auth/profile`
- **Protegido:** Requiere token válido
- **Respuesta:** Información pública del usuario

### 5. **Cerrar Sesión**
- **Endpoint:** `POST /api/auth/logout`
- **Funcionalidad:** Limpieza del estado local

## 🔒 Seguridad Implementada

### Hashing de Contraseñas
```typescript
// Usando bcryptjs con 12 rounds de salt
const hashedPassword = await bcrypt.hash(password, 12);
```

### JWT Tokens
```typescript
// Configuración del token
{
  expiresIn: '24h',
  issuer: 'tp-descuentos-app',
  audience: 'tp-descuentos-users'
}
```

### Middleware de Protección
```typescript
// Proteger rutas específicas
router.get('/protected', authMiddleware.authenticate, controller.method);

// Autenticación opcional
router.get('/optional', authMiddleware.optionalAuth, controller.method);
```

## 📋 Uso del Sistema

### 1. **Registrar un Usuario**

```bash
curl -X POST http://localhost:3000/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "mipassword123",
    "nombre": "Juan",
    "apellido": "Pérez"
  }'
```

### 2. **Iniciar Sesión**

```bash
curl -X POST http://localhost:3000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "mipassword123"
  }'
```

### 3. **Acceder a Ruta Protegida**

```bash
curl -X GET http://localhost:3000/api/auth/profile \\
  -H "Authorization: Bearer <tu-token-jwt>"
```

## 🌐 Funcionalidades del Frontend

### Servicio de Autenticación JavaScript

```javascript
// Registrarse
await authService.register({
  email: 'test@example.com',
  password: 'password123',
  nombre: 'Test',
  apellido: 'User'
});

// Iniciar sesión
await authService.login('test@example.com', 'password123');

// Verificar autenticación
if (authService.isAuthenticated()) {
  console.log('Usuario logueado:', authService.getUser());
}

// Cerrar sesión
await authService.logout();
```

### Estado de la UI

- **Header dinámico:** Muestra botones de login/registro o información del usuario
- **Redirección automática:** Los usuarios logueados son redirigidos desde páginas de auth
- **Persistencia:** Los tokens se almacenan en localStorage
- **Manejo de errores:** Mensajes informativos para el usuario

## 🔧 Configuración y Variables

### Variables de Entorno (Opcionales)
```bash
JWT_SECRET=tu-clave-secreta-aqui
JWT_EXPIRES_IN=24h
NODE_ENV=development
```

### Dependencias Agregadas
```json
{
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "express-validator": "^7.0.1"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.2",
    "@types/jsonwebtoken": "^9.0.1"
  }
}
```

## 🧪 Pruebas y Verificación

### 1. **Probar Registro**
1. Ir a http://localhost:3000/signup.html
2. Completar el formulario
3. Verificar redirección automática
4. Comprobar estado en la página principal

### 2. **Probar Login**
1. Ir a http://localhost:3000/login
2. Usar credenciales creadas
3. Verificar autenticación exitosa
4. Comprobar información en header

### 3. **Probar API Directamente**
```bash
# Registrar
curl -X POST http://localhost:3000/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"email":"test@test.com","password":"123456","nombre":"Test","apellido":"User"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"test@test.com","password":"123456"}'
```

## 🚀 Próximos Pasos

### Mejoras Posibles:
1. **Base de datos real:** Migrar de memoria a MongoDB
2. **Refresh tokens:** Implementar renovación automática
3. **OAuth:** Integrar login con Google
4. **Roles de usuario:** Admin, usuario regular, etc.
5. **Recuperación de contraseña:** Reset via email
6. **Perfil de usuario:** Página dedicada para editar información
7. **Sesiones persistentes:** Remember me functionality

### Protección de Rutas Existentes:
```typescript
// Ejemplo: Proteger rutas de beneficios para usuarios autenticados
app.use('/api/beneficios', authMiddleware.optionalAuth, beneficioRouter);
app.use('/api/personas', authMiddleware.authenticate, personasRouter);
```

## 📁 Estructura de Respuestas de la API

### Respuesta Exitosa
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "1",
      "email": "test@example.com",
      "nombre": "Test",
      "apellido": "User"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "message": "Login exitoso"
  }
}
```

### Respuesta de Error
```json
{
  "success": false,
  "message": "Credenciales inválidas",
  "error": "Email o contraseña incorrectos"
}
```

---

## ✅ Estado Actual

**El sistema de autenticación está completamente funcional e integrado en la aplicación existente.**

- ✅ Backend completo con JWT
- ✅ Frontend con JavaScript nativo
- ✅ Páginas de login y registro funcionales
- ✅ Integración con la aplicación existente
- ✅ Manejo de errores y validaciones
- ✅ UI responsive y moderna
- ✅ Persistencia de sesión en localStorage
- ✅ Protección de rutas con middleware

¡El sistema está listo para usar! 🎉
