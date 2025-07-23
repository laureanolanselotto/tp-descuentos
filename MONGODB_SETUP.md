# Script para configurar MongoDB local

## Opción A: MongoDB Community Server (Local)

### Windows:
1. Descargar MongoDB Community Server desde: https://www.mongodb.com/try/download/community
2. Ejecutar el instalador
3. MongoDB se ejecutará como servicio automáticamente

### Verificar instalación:
```bash
mongosh --version
```

### Conectar a MongoDB:
```bash
mongosh "mongodb://localhost:27017"
```

## Opción B: MongoDB Atlas (Cloud - Gratis)

### 1. Crear cuenta en MongoDB Atlas:
https://www.mongodb.com/cloud/atlas/register

### 2. Crear cluster gratuito (M0)

### 3. Obtener string de conexión:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/tp-descuentos?retryWrites=true&w=majority
```

### 4. Crear archivo .env en la raíz del proyecto:
```
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/tp-descuentos?retryWrites=true&w=majority
MONGO_DB_NAME=tp-descuentos
JWT_SECRET=tu-clave-secreta-super-segura
JWT_EXPIRES_IN=24h
```

## Opción C: Docker (Desarrollo)

### Ejecutar MongoDB en Docker:
```bash
docker run -d -p 27017:27017 --name tp-descuentos-mongo mongo:latest
```

## Configuración Actual

El proyecto está configurado para:
- **Local:** mongodb://127.0.0.1:27017
- **Base de datos:** tp-descuentos
- **Colección:** users

## Comandos útiles de MongoDB

### Ver bases de datos:
```javascript
show dbs
```

### Usar base de datos:
```javascript
use tp-descuentos
```

### Ver colecciones:
```javascript
show collections
```

### Ver usuarios:
```javascript
db.users.find().pretty()
```

### Contar usuarios:
```javascript
db.users.countDocuments()
```

### Eliminar todos los usuarios (testing):
```javascript
db.users.deleteMany({})
```

## Estructura de Documentos de Usuario

```json
{
  "_id": ObjectId("..."),
  "email": "usuario@ejemplo.com",
  "password": "$2a$12$...", // Hash bcrypt
  "nombre": "Juan",
  "apellido": "Pérez",
  "fechaRegistro": ISODate("2025-01-23T..."),
  "activo": true
}
```

## Índices Creados Automáticamente

- **email:** Único (previene duplicados)
- **activo:** Para consultas por estado
