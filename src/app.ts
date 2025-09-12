import express  from "express";
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PersonasRouter } from "./personas/personas.routes.js";
import { BeneficioRouter } from "./benefico/beneficio.routes.js"
import { WalletsRouter } from "./wallets/wallets.routes.js"

const app = express();
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
app.use('/api/wallets', WalletsRouter); // utiliza el router de wallets para hacer todas las peticines

// Static frontend (Virtual Wallets)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '../public');

// Serve static files
app.use('/virtual-wallets', express.static(path.join(publicDir, 'virtual-wallets')));
// SPA fallback for Virtual Wallets
app.get('/virtual-wallets/*', (_req, res) => {
    res.sendFile(path.join(publicDir, 'virtual-wallets', 'index.html'));
});

app.listen(3000,()=>{
    console.log('Server is running on port 3000');
})

