# Sistema de Roles y Autenticación - Guía de Uso Frontend

## 📋 Resumen del Sistema

El sistema de roles permite diferenciar entre usuarios normales y administradores mediante la validación del email en la tabla `roles`.

---

## 🔐 Endpoints Disponibles

### 1. Login
**POST** `/api/auth/login`

**Request:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña"
}
```

**Response exitoso:**
```json
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "68e5b58603cec7b6df2b5e1a",
    "id": "68e5b58603cec7b6df2b5e1a",
    "email": "usuario@ejemplo.com",
    "name": "Juan Pérez",
    "tel": "+54 221 4231234",
    "direccion": "Calle 7 N° 776",
    "localidad": { ... },
    "wallets": [ ... ],
    "isAdmin": false  // ⭐ Nuevo campo
  }
}
```

---

### 2. Verificar Token
**GET** `/api/auth/verify-token`

**Response:**
```json
{
  "message": "Token válido",
  "_id": "68e5b58603cec7b6df2b5e1a",
  "id": "68e5b58603cec7b6df2b5e1a",
  "name": "Juan Pérez",
  "email": "usuario@ejemplo.com",
  "tel": "+54 221 4231234",
  "direccion": "Calle 7 N° 776",
  "localidad": { ... },
  "wallets": [ ... ],
  "isAdmin": false  // ⭐ Indica si es admin
}
```

---

### 3. Ruta Protegida (Solo Admins)
**GET** `/api/auth/admin-only`

**Cookies requeridas:** `token` (JWT)

**Response exitoso (si es admin):**
```json
{
  "message": "Acceso permitido - Usuario administrador verificado",
  "adminEmail": "admin@empresa.com.ar"
}
```

**Response error (si NO es admin):**
```json
{
  "message": "Acceso denegado - Se requieren permisos de administrador"
}
```
**Status:** 403 Forbidden

---

## 🎯 Uso en Frontend

### Ejemplo con React + TypeScript

#### 1. Definir tipos
```typescript
interface User {
  _id: string;
  id: string;
  email: string;
  name: string;
  tel?: string;
  direccion?: string;
  localidad?: any;
  wallets?: any[];
  isAdmin: boolean; // ⭐ Nuevo campo
}

interface LoginResponse {
  message: string;
  token: string;
  user: User;
}
```

#### 2. Función de Login
```typescript
const login = async (email: string, password: string) => {
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // ⭐ Importante para cookies
      body: JSON.stringify({ email, password })
    });

    const data: LoginResponse = await response.json();
    
    if (response.ok) {
      // Guardar datos del usuario
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      
      // ⭐ Verificar si es admin
      if (data.user.isAdmin) {
        console.log('Usuario administrador detectado');
        // Redirigir al panel de admin
        navigate('/admin/dashboard');
      } else {
        // Redirigir al panel de usuario normal
        navigate('/dashboard');
      }
    }
  } catch (error) {
    console.error('Error en login:', error);
  }
};
```

#### 3. Verificar Token al Cargar la App
```typescript
const verifyToken = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/auth/verify-token', {
      method: 'GET',
      credentials: 'include' // ⭐ Envía las cookies automáticamente
    });

    const data = await response.json();
    
    if (response.ok) {
      // Actualizar estado del usuario
      setUser(data);
      setIsAdmin(data.isAdmin); // ⭐ Actualizar estado de admin
    } else {
      // Token inválido, limpiar sesión
      localStorage.clear();
      navigate('/login');
    }
  } catch (error) {
    console.error('Error verificando token:', error);
  }
};

// Ejecutar al montar el componente
useEffect(() => {
  verifyToken();
}, []);
```

#### 4. Proteger Rutas de Admin
```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean; // ⭐ Nuevo prop
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/auth/verify-token', {
          credentials: 'include'
        });
        
        const data = await response.json();
        
        if (response.ok) {
          setUser(data);
          
          // ⭐ Verificar permisos de admin si es requerido
          if (requireAdmin && !data.isAdmin) {
            navigate('/unauthorized'); // No es admin
          }
        } else {
          navigate('/login');
        }
      } catch (error) {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [requireAdmin]);

  if (loading) return <div>Cargando...</div>;
  
  return user ? <>{children}</> : null;
};
```

#### 5. Configurar Rutas
```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {/* Ruta normal (usuario autenticado) */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* ⭐ Ruta solo para admins */}
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminPanel />
            </ProtectedRoute>
          } 
        />
        
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

#### 6. Componente Condicional (UI)
```typescript
const Header = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  return (
    <header>
      <nav>
        <Link to="/dashboard">Dashboard</Link>
        
        {/* ⭐ Mostrar enlace solo si es admin */}
        {user?.isAdmin && (
          <Link to="/admin/panel">Panel Admin</Link>
        )}
        
        <button onClick={logout}>Logout</button>
      </nav>
    </header>
  );
};
```

---

## 🔧 Gestión de Roles (Backend)

### Crear Admin
Para convertir un usuario en administrador, agregar su email a la tabla `roles`:

**POST** `/api/roles`
```json
{
  "email_admins": "admin@empresa.com.ar"
}
```

### Listar Admins
**GET** `/api/roles`

### Eliminar Admin
**DELETE** `/api/roles/{id}`

---

## 🧪 Flujo de Prueba Completo

1. **Crear un usuario normal** en `/api/personas`
2. **Hacer login** con ese usuario → `isAdmin: false`
3. **Crear un rol de admin** en `/api/roles` con el email del usuario
4. **Hacer login nuevamente** → `isAdmin: true`
5. **Acceder a `/api/auth/admin-only`** → Debe permitir acceso
6. **Eliminar el rol** en `/api/roles`
7. **Verificar token** → `isAdmin: false`

---

## 📝 Notas Importantes

- ✅ El token JWT incluye el campo `isAdmin` desde el login
- ✅ El middleware `verifyAdmin` valida contra la tabla `roles`
- ✅ El frontend puede confiar en el campo `isAdmin` del token
- ✅ Usar `credentials: 'include'` en todas las peticiones fetch
- ✅ El sistema verifica roles en **tiempo real** (consulta DB en cada request)

---

## 🚀 Ejemplo de Uso del Middleware en Otras Rutas

Puedes proteger cualquier ruta con el middleware `verifyAdmin`:

```typescript
// En cualquier archivo de rutas
import { verifyAdmin } from '../APIS/auth.controler.js';

// Ruta protegida solo para admins
router.delete('/beneficios/:id', verifyAdmin, deleteBeneficio);
router.post('/rubros', verifyAdmin, createRubro);
router.put('/sucursales/:id', verifyAdmin, updateSucursal);
```

**Comportamiento:**
- Si el usuario **NO** tiene token → 401 (No autorizado)
- Si el usuario **NO** es admin → 403 (Acceso denegado)
- Si el usuario **ES** admin → Continúa a la función del controlador
