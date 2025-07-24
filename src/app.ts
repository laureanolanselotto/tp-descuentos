import express  from "express";
import { PersonasRouter } from "./personas/personas.routes.js";
import { BeneficioRouter } from "./beneficios/beneficio.routes.js"
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware para servir archivos estáticos del frontend
app.use('/front', express.static(path.join(__dirname, '../front')));

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

// Ruta para servir la página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../front/index.html'));
});

// Ruta para servir promociones
app.get('/promociones', (req, res) => {
    res.sendFile(path.join(__dirname, '../front/promociones.html'));
});

// Ruta para servir la página de login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../Ingreso/login.html'));
});

app.listen(3000,()=>{
    console.log('Server is running on port 3000');
    console.log('Frontend available at: http://localhost:3000');
    console.log('API available at: http://localhost:3000/api');
})

