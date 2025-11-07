# 🛡️ Ejemplos de Uso del Middleware verifyAdmin

Este documento muestra cómo proteger diferentes rutas y controladores usando el middleware `verifyAdmin`.

---

## 📖 Importación del Middleware

```typescript
import { verifyAdmin } from '../APIS/auth.controler.js';
```

---

## 🎯 Ejemplos por Módulo

### 1. Proteger Rubros (Solo admins pueden crear/editar/eliminar)

**Archivo:** `src/rubros/rubros.routes.ts`

```typescript
import { Router } from 'express';
import { sanitizeRubrosInput, findAll, findOne, add, update, remove } from './rubros.controler.js';
import { verifyAdmin } from '../APIS/auth.controler.js';

export const RubrosRouter = Router();

// 👁️ Público: Cualquiera puede ver rubros
RubrosRouter.get('/', findAll);
RubrosRouter.get('/:id', findOne);

// 🔒 Protegido: Solo admins pueden modificar
RubrosRouter.post('/', verifyAdmin, sanitizeRubrosInput, add);
RubrosRouter.put('/:id', verifyAdmin, sanitizeRubrosInput, update);
RubrosRouter.patch('/:id', verifyAdmin, sanitizeRubrosInput, update);
RubrosRouter.delete('/:id', verifyAdmin, remove);
```

---

### 2. Proteger Beneficios (Crear y eliminar solo admins)

**Archivo:** `src/beneficios/beneficios.routes.ts`

```typescript
import { Router } from 'express';
import { sanitizeBeneficiosInput, findAll, findOne, add, update, remove } from './beneficios.controler.js';
import { verifyAdmin } from '../APIS/auth.controler.js';

export const BeneficiosRouter = Router();

// 👁️ Público: Ver beneficios
BeneficiosRouter.get('/', findAll);
BeneficiosRouter.get('/:id', findOne);

// 🔒 Protegido: Solo admins
RubrosRouter.post('/', verifyAdmin, sanitizeBeneficiosInput, add);
RubrosRouter.delete('/:id', verifyAdmin, remove);

// ⚠️ Semi-protegido: Admins o el creador del beneficio pueden editar
// (requeriría lógica adicional en el controlador)
RubrosRouter.put('/:id', sanitizeBeneficiosInput, update);
RubrosRouter.patch('/:id', sanitizeBeneficiosInput, update);
```

---

### 3. Proteger Sucursales (Solo admins administran sucursales)

**Archivo:** `src/sucursales/sucursal.routes.ts`

```typescript
import { Router } from 'express';
import { sanitizeSucursalInput, findAll, findOne, add, update, remove } from './sucursal.controler.js';
import { verifyAdmin } from '../APIS/auth.controler.js';

export const sucursalRouter = Router();

// 👁️ Público: Ver sucursales
sucursalRouter.get('/', findAll);
sucursalRouter.get('/:id', findOne);

// 🔒 Protegido: Solo admins gestionan sucursales
sucursalRouter.post('/', verifyAdmin, sanitizeSucursalInput, add);
sucursalRouter.put('/:id', verifyAdmin, sanitizeSucursalInput, update);
sucursalRouter.patch('/:id', verifyAdmin, sanitizeSucursalInput, update);
sucursalRouter.delete('/:id', verifyAdmin, remove);
```

---

### 4. Proteger Ubicaciones de Usuario (Usuarios solo ven/editan las suyas)

**Archivo:** `src/ubicacion_usuarios/ubicacion_usuario.routes.ts`

```typescript
import { Router } from 'express';
import { sanitizeUbicacionUsuarioInput, findAll, findOne, add, update, remove } from './ubicacion_usuario.controler.js';
import { verifyAdmin } from '../APIS/auth.controler.js';
import { authRequiredToken } from '../middlewares/validenteToken.js';

export const ubicacionUsuarioRouter = Router();

// 🔒 Solo admins pueden ver todas las ubicaciones
ubicacionUsuarioRouter.get('/', verifyAdmin, findAll);

// 🔐 Usuarios autenticados pueden ver ubicaciones específicas
// (requeriría validación adicional: solo sus ubicaciones)
ubicacionUsuarioRouter.get('/:id', authRequiredToken, findOne);

// 🔐 Usuarios pueden crear/editar sus propias ubicaciones
ubicacionUsuarioRouter.post('/', authRequiredToken, sanitizeUbicacionUsuarioInput, add);
ubicacionUsuarioRouter.put('/:id', authRequiredToken, sanitizeUbicacionUsuarioInput, update);
ubicacionUsuarioRouter.patch('/:id', authRequiredToken, sanitizeUbicacionUsuarioInput, update);

// 🔒 Solo admins pueden eliminar ubicaciones
ubicacionUsuarioRouter.delete('/:id', verifyAdmin, remove);
```

---

### 5. Proteger Wallets (Solo admins)

**Archivo:** `src/wallet/wallet.routes.ts`

```typescript
import { Router } from 'express';
import { sanitizeWalletInput, findAll, findOne, add, update, remove } from './wallet.controler.js';
import { verifyAdmin } from '../APIS/auth.controler.js';

export const WalletRouter = Router();

// 👁️ Público: Ver wallets
WalletRouter.get('/', findAll);
WalletRouter.get('/:id', findOne);

// 🔒 Protegido: Solo admins modifican wallets
WalletRouter.post('/', verifyAdmin, sanitizeWalletInput, add);
WalletRouter.put('/:id', verifyAdmin, sanitizeWalletInput, update);
WalletRouter.patch('/:id', verifyAdmin, sanitizeWalletInput, update);
WalletRouter.delete('/:id', verifyAdmin, remove);
```

---

### 6. Proteger Personas (Casos especiales)

**Archivo:** `src/personas/personas.routes.ts`

```typescript
import { Router } from 'express';
import { sanitizePersonaInput, findAll, findOne, add, update, remove } from './personas.controler.js';
import { verifyAdmin } from '../APIS/auth.controler.js';
import { authRequiredToken } from '../middlewares/validenteToken.js';

export const PersonasRouter = Router();

// 🔒 Solo admins ven todas las personas
PersonasRouter.get('/', verifyAdmin, findAll);

// 🔐 Usuarios autenticados ven su propio perfil
// Admins pueden ver cualquier perfil
PersonasRouter.get('/:id', authRequiredToken, findOne);

// 👁️ Público: Registro de nuevos usuarios
PersonasRouter.post('/', sanitizePersonaInput, add);

// 🔐 Usuarios autenticados editan su propio perfil
PersonasRouter.put('/:id', authRequiredToken, sanitizePersonaInput, update);
PersonasRouter.patch('/:id', authRequiredToken, sanitizePersonaInput, update);

// 🔒 Solo admins pueden eliminar usuarios
PersonasRouter.delete('/:id', verifyAdmin, remove);
```

---

## 🔧 Controlador con Validación Adicional

Si necesitas que los usuarios solo puedan editar **sus propios recursos**, agrega validación en el controlador:

### Ejemplo: `ubicacion_usuario.controler.ts`

```typescript
async function update(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const userId = req.decoded?.id; // Del token JWT
    
    // Buscar la ubicación
    let ubicacionToUpdate;
    try {
      ubicacionToUpdate = await em.findOneOrFail(UbicacionUsuario, { id }, { 
        populate: ['persona'] 
      });
    } catch (e) {
      ubicacionToUpdate = await em.findOneOrFail(UbicacionUsuario, { 
        _id: new ObjectId(id) 
      }, { 
        populate: ['persona'] 
      });
    }

    // ⭐ Verificar permisos
    const isAdmin = req.decoded?.isAdmin;
    const isOwner = ubicacionToUpdate.persona._id.toString() === userId;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ 
        message: 'No tienes permisos para editar esta ubicación' 
      });
    }

    // Continuar con la actualización...
    em.assign(ubicacionToUpdate, req.body.sanitizedInput);
    await em.flush();

    res.status(200).json({ 
      message: 'Ubicación actualizada', 
      data: ubicacionToUpdate 
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}
```

---

## 🎭 Combinación de Middlewares

Puedes combinar múltiples middlewares en una misma ruta:

```typescript
// Orden de ejecución: authRequiredToken → verifyAdmin → sanitize → add
router.post(
  '/', 
  authRequiredToken,  // 1️⃣ Verifica que hay un usuario autenticado
  verifyAdmin,        // 2️⃣ Verifica que es admin
  sanitizeInput,      // 3️⃣ Limpia el input
  add                 // 4️⃣ Ejecuta la lógica del controlador
);
```

---

## 📊 Tabla de Permisos Recomendados

| Módulo | GET all | GET :id | POST | PUT/PATCH | DELETE |
|--------|---------|---------|------|-----------|--------|
| **Rubros** | 👁️ Público | 👁️ Público | 🔒 Admin | 🔒 Admin | 🔒 Admin |
| **Beneficios** | 👁️ Público | 👁️ Público | 🔒 Admin | 🔐 Owner/Admin | 🔒 Admin |
| **Wallets** | 👁️ Público | 👁️ Público | 🔒 Admin | 🔒 Admin | 🔒 Admin |
| **Sucursales** | 👁️ Público | 👁️ Público | 🔒 Admin | 🔒 Admin | 🔒 Admin |
| **Personas** | 🔒 Admin | 🔐 Owner/Admin | 👁️ Público (registro) | 🔐 Owner/Admin | 🔒 Admin |
| **Ubicaciones** | 🔒 Admin | 🔐 Owner/Admin | 🔐 Auth | 🔐 Owner/Admin | 🔒 Admin |
| **Notificaciones** | 🔐 Own | 🔐 Own | 🔐 Auth | 🔐 Own | 🔐 Own/Admin |
| **Roles** | 🔒 Admin | 🔒 Admin | 🔒 Admin | 🔒 Admin | 🔒 Admin |
| **Ciudades** | 👁️ Público | 👁️ Público | 🔒 Admin | 🔒 Admin | 🔒 Admin |
| **Localidades** | 👁️ Público | 👁️ Público | 🔒 Admin | 🔒 Admin | 🔒 Admin |

**Leyenda:**
- 👁️ **Público**: Sin autenticación
- 🔐 **Auth**: Usuario autenticado
- 🔐 **Owner**: Usuario dueño del recurso
- 🔒 **Admin**: Solo administradores

---

## ⚠️ Consideraciones de Seguridad

### ✅ Buenas Prácticas

1. **Siempre valida en el backend**: El frontend puede ocultar botones, pero la seguridad real está en el servidor.

2. **Usa HTTPS en producción**: Las cookies con `secure: true` solo funcionan en HTTPS.

3. **Tokens de corta duración**: El token expira en 1 día, ajusta según necesidad.

4. **Registra acciones de admin**: Considera agregar logs de auditoría:
```typescript
console.log(`Admin ${req.decoded?.email} eliminó el rubro ${id}`);
```

### ❌ Anti-Patrones

1. ❌ No confíes solo en el campo `isAdmin` del JWT sin verificar contra la DB
2. ❌ No expongas rutas de admin sin protección
3. ❌ No uses el mismo middleware para todos los recursos (personaliza según necesidad)

---

## 🧪 Testing con REST Client

```http
### Probar ruta protegida sin token (debe fallar 401)
POST http://localhost:3000/api/rubros
Content-Type: application/json

{
  "nombre": "Test Rubro"
}

###

### Login como admin
# @name loginAdmin
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@empresa.com.ar",
  "password": "admin123"
}

###

### Probar ruta protegida CON token de admin (debe funcionar 201)
POST http://localhost:3000/api/rubros
Content-Type: application/json

{
  "nombre": "Test Rubro Admin"
}

###

### Login como usuario normal
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "usuario@gmail.com",
  "password": "1234"
}

###

### Probar ruta protegida con usuario normal (debe fallar 403)
POST http://localhost:3000/api/rubros
Content-Type: application/json

{
  "nombre": "Test Rubro Usuario"
}
```

---

## 📝 Resumen

1. Importa `verifyAdmin` donde necesites protección
2. Agrégalo antes del handler del controlador
3. Combínalo con otros middlewares si es necesario
4. Personaliza la lógica en el controlador para casos especiales (owner vs admin)
5. Prueba todos los casos: sin token, token de usuario, token de admin

**El middleware `verifyAdmin` verifica en tiempo real contra la base de datos, garantizando seguridad actualizada.**
