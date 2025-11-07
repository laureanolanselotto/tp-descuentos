# 🚀 Guía Rápida de Testing - Sistema de Roles

## 📋 Prerequisitos
Asegúrate de tener el servidor corriendo en `http://localhost:3000`

---

## ✅ Pasos para Testear el Sistema Completo

### 1️⃣ Crear un Usuario Normal

**Archivo:** `src/personas/personas.http`

```http
POST http://localhost:3000/api/personas
Content-Type: application/json

{
    "name": "Usuario Test",
    "email": "usuario@test.com",
    "password": "1234",
    "tel": "+54 221 4231234",
    "direccion": "Calle 7 N° 776",
    "localidadId": "TU_LOCALIDAD_ID_AQUI"
}
```

**Nota:** Guarda el email para los siguientes pasos.

---

### 2️⃣ Hacer Login (Usuario Normal)

**Archivo:** `src/APIS/auth.http` → Test #1

```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "usuario@test.com",
  "password": "1234"
}
```

**Resultado esperado:**
```json
{
  "message": "Login exitoso",
  "token": "...",
  "user": {
    ...
    "isAdmin": false  // ⭐ Debe ser false
  }
}
```

---

### 3️⃣ Verificar Token (Usuario Normal)

**Archivo:** `src/APIS/auth.http` → Test #2

```http
GET http://localhost:3000/api/auth/verify-token
```

**Resultado esperado:**
```json
{
  "message": "Token válido",
  ...
  "isAdmin": false  // ⭐ Debe ser false
}
```

---

### 4️⃣ Intentar Acceder a Ruta de Admin (Debe Fallar)

**Archivo:** `src/APIS/auth.http` → Test #10

```http
GET http://localhost:3000/api/auth/admin-only
```

**Resultado esperado:**
```json
{
  "message": "Acceso denegado - Se requieren permisos de administrador"
}
```
**Status:** `403 Forbidden` ✅

---

### 5️⃣ Crear Rol de Administrador

**Archivo:** `src/rol_personas/rol_personas.http` → Test #2

```http
POST http://localhost:3000/api/roles
Content-Type: application/json

{
    "email_admins": "usuario@test.com"
}
```

**Resultado esperado:**
```json
{
  "message": "roles created",
  "data": {
    "id": "...",
    "email_admins": "usuario@test.com"
  }
}
```

**Nota:** Guarda el `id` para poder eliminar el rol después.

---

### 6️⃣ Hacer Login Nuevamente (Ahora es Admin)

**Archivo:** `src/APIS/auth.http` → Test #5

```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "usuario@test.com",
  "password": "1234"
}
```

**Resultado esperado:**
```json
{
  "message": "Login exitoso",
  "token": "...",
  "user": {
    ...
    "isAdmin": true  // ⭐ Ahora debe ser true
  }
}
```

---

### 7️⃣ Verificar Token (Ahora es Admin)

**Archivo:** `src/APIS/auth.http` → Test #6

```http
GET http://localhost:3000/api/auth/verify-token
```

**Resultado esperado:**
```json
{
  "message": "Token válido",
  ...
  "isAdmin": true  // ⭐ Debe ser true
}
```

---

### 8️⃣ Acceder a Ruta de Admin (Debe Funcionar)

**Archivo:** `src/APIS/auth.http` → Test #7

```http
GET http://localhost:3000/api/auth/admin-only
```

**Resultado esperado:**
```json
{
  "message": "Acceso permitido - Usuario administrador verificado",
  "adminEmail": "usuario@test.com"
}
```
**Status:** `200 OK` ✅

---

### 9️⃣ Listar Todos los Admins

**Archivo:** `src/rol_personas/rol_personas.http` → Test #1

```http
GET http://localhost:3000/api/roles
```

**Resultado esperado:**
```json
{
  "message": "found all roles",
  "data": [
    {
      "id": "...",
      "email_admins": "usuario@test.com"
    }
  ]
}
```

---

### 🔟 Eliminar Rol de Admin

**Archivo:** `src/rol_personas/rol_personas.http` → Test #13

```http
DELETE http://localhost:3000/api/roles/{roleId}
```

**Reemplaza** `{roleId}` con el ID guardado del paso 5.

---

### 1️⃣1️⃣ Verificar Token (Ya No es Admin)

**Archivo:** `src/APIS/auth.http` → Test #2

```http
GET http://localhost:3000/api/auth/verify-token
```

**Resultado esperado:**
```json
{
  "message": "Token válido",
  ...
  "isAdmin": false  // ⭐ Vuelve a ser false
}
```

**Nota:** Aunque el token antiguo decía `isAdmin: true`, la verificación es en **tiempo real** consultando la base de datos.

---

### 1️⃣2️⃣ Intentar Acceder a Ruta de Admin (Debe Fallar Nuevamente)

**Archivo:** `src/APIS/auth.http` → Test #10

```http
GET http://localhost:3000/api/auth/admin-only
```

**Resultado esperado:**
```json
{
  "message": "Acceso denegado - Se requieren permisos de administrador"
}
```
**Status:** `403 Forbidden` ✅

---

## ✨ Resumen de Estados

| Paso | Email en `roles` | Login `isAdmin` | Verify `isAdmin` | Ruta Admin |
|------|------------------|-----------------|------------------|------------|
| 2-4  | ❌ No existe     | `false`         | `false`          | ❌ 403     |
| 6-8  | ✅ Existe        | `true`          | `true`           | ✅ 200     |
| 11-12| ❌ Eliminado     | N/A*            | `false`          | ❌ 403     |

*N/A: No se hace nuevo login, se usa el token antiguo pero la verificación es en tiempo real.

---

## 🎯 Comandos VS Code REST Client

Si usas la extensión **REST Client** en VS Code:

1. Abre cada archivo `.http`
2. Haz clic en **Send Request** sobre cada línea `POST`, `GET`, `DELETE`
3. Observa las respuestas en el panel derecho

---

## 🔍 Verificación Adicional

### Ver en Base de Datos (MongoDB)
```javascript
// En MongoDB Compass o mongo shell
use tp-desuentos

// Ver todos los roles
db.roles.find()

// Ver personas
db.persona.find({ email: "usuario@test.com" })
```

---

## ⚠️ Troubleshooting

### Error: "No autorizado - Token requerido"
- Asegúrate de haber hecho login antes de hacer peticiones protegidas
- El token se guarda automáticamente en cookies

### Error: "Usuario no encontrado"
- Verifica que el usuario existe en la base de datos
- Usa el endpoint `GET /api/personas` para listar usuarios

### Error: "ciudadId inválido" al crear persona
- Primero crea una localidad en `/api/localidades`
- Luego crea una ciudad en `/api/ciudades`
- Usa el ID de la ciudad para crear la persona

---

## 📚 Archivos de Referencia

- **Controlador Auth:** `src/APIS/auth.controler.ts`
- **Rutas Auth:** `src/APIS/auth.routes.ts`
- **Entidad Roles:** `src/rol_personas/rol_personas.entity.ts`
- **Controlador Roles:** `src/rol_personas/rol_personas.controler.ts`
- **Tipos Express:** `src/types/express.d.ts`
- **Guía Frontend:** `docs/SISTEMA_ROLES_FRONTEND.md`
