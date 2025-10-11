#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

console.log('🔨 Compilando TypeScript...');

try {
  // Compilar
  const { stdout: compileOut, stderr: compileErr } = await execAsync('tsc -p tsconfig.json', {
    cwd: process.cwd()
  });
  
  if (compileErr && !compileErr.includes('warning')) {
    console.error('❌ Error en compilación:', compileErr);
    process.exit(1);
  }
  
  console.log('✅ Compilación exitosa');
  console.log('🚀 Iniciando servidor...\n');
  
  // Ejecutar
  const server = exec('node dist/app.js', {
    cwd: process.cwd()
  });
  
  server.stdout.on('data', (data) => {
    process.stdout.write(data);
  });
  
  server.stderr.on('data', (data) => {
    process.stderr.write(data);
  });
  
  server.on('close', (code) => {
    console.log(`\n❌ Servidor cerrado con código ${code}`);
  });
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}