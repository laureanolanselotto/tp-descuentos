import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Iniciando servidor de desarrollo...');

const tscWatch = spawn('node', [
  join(__dirname, 'node_modules', 'typescript', 'bin', 'tsc'),
  '-w',
  '-p',
  './tsconfig.json'
], {
  stdio: 'inherit',
  shell: true
});

tscWatch.on('error', (error) => {
  console.error('Error al iniciar tsc-watch:', error);
});

tscWatch.on('close', (code) => {
  console.log(`tsc-watch cerrado con código ${code}`);
});