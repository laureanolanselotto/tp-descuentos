// Cargar variables de entorno antes que todo
import dotenv from 'dotenv';
dotenv.config();

// Archivo principal de entrada
console.log('🚀 TP Descuentos - Sistema de gestión de descuentos iniciado');
console.log('🔧 Configuración cargada desde .env');

// Importar la aplicación después de cargar las variables
import('./app.js').catch(console.error);