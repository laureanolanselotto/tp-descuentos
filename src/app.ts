// Cargar variables de entorno
import dotenv from 'dotenv';
dotenv.config();

import express  from "express";
import { PersonasRouter } from "./personas/personas.routes.js";
import { BeneficioRouter } from "./beneficios/beneficio.routes.js";
import { authRouter } from "./auth/auth.routes.js";
import { errorHandler } from "./shared/middleware/errorHandler.js";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware para servir archivos estáticos del frontend
app.use('/front', express.static(path.join(__dirname, '../front')));
app.use('/assets', express.static(path.join(__dirname, '../front/assets')));
app.use('/services', express.static(path.join(__dirname, '../front/services')));
app.use('/utils', express.static(path.join(__dirname, '../front/utils')));
app.use('/js', express.static(path.join(__dirname, '../front/js')));
app.use('/ingreso', express.static(path.join(__dirname, '../front/nose/Ingreso')));
// Si compilas el frontend React (Vite), lo servimos bajo /app
app.use('/app', express.static(path.join(__dirname, '../fronted/src/dist')));
app.get('/app/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../fronted/src/dist/index.html'));
});
// Exponer también los assets públicos de Vite bajo /app/wallets
app.use('/app/wallets', express.static(path.join(__dirname, '../fronted/src/dist/wallets')));

// Middleware para parsear JSON
app.use(express.json());
// el express.json() middleware permite que la aplicación pueda recibir datos en formato JSON en el cuerpo de las solicitudes HTTP. Esto es útil para manejar datos enviados por el cliente, como en solicitudes POST o PUT, donde se espera que el cuerpo de la solicitud contenga información estructurada en formato JSON.
//get = obtener datos =>(/api//characteres/)obtener listas de characteres
//get (/api//characteres/:id)obtener listas el charactere con id = :id
//post = enviar datos =>(/api//characteres/) crear un nuevo character
//user => request => express => express que forme req.body=> app.post(req.body)=>respose =>user
//delete = eliminar datos =>(/api//characteres/:id) eliminar el character con id = :id
//put & patch  = modificar datos =>(/api//characteres/:id) modificar el character con id = :id
//character => /api//characteres/

app.use('/api/personas', PersonasRouter); // utiliza el router de personas para hacer todas las peticines
app.use('/api/beneficios', BeneficioRouter); // utiliza el router de beneficios para hacer todas las peticines
app.use('/api/auth', authRouter); // utiliza el router de autenticación para manejar login/registro

// Ruta para servir la página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../front/nose/index.html'));
});

// Ruta para servir promociones
app.get('/promociones', (req, res) => {
    res.sendFile(path.join(__dirname, '../front/nose/promociones.html'));
});

// Ruta para servir la página de login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../front/nose/Ingreso/login.html'));
});

// Ruta para servir la página de registro
app.get('/signup.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../front/nose/Ingreso/signup.html'));
});

// Ruta para servir la demo de autenticación
app.get('/auth-demo', (req, res) => {
    res.sendFile(path.join(__dirname, '../front/nose/auth-demo.html'));
});

// Ruta para servir la vista de base de datos
app.get('/database', (req, res) => {
    res.sendFile(path.join(__dirname, '../front/nose/database-view.html'));
});

// Middleware de manejo de errores (debe ir al final)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    errorHandler(err, req, res, next);
});

app.listen(3000,()=>{
    console.log('Server is running on port 3000');
    console.log('Frontend available at: http://localhost:3000');
    console.log('API available at: http://localhost:3000/api');
    console.log('Auth endpoints available at: http://localhost:3000/api/auth');
})

