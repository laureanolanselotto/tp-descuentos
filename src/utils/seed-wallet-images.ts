// Script para cargar imágenes de wallets en la base de datos
// Ejecutar con: node --loader ts-node/esm src/utils/seed-wallet-images.ts

import { orm } from '../shared/db/orm.js';
import { Imagen } from '../imagenes/imagen.entity.js';

const walletImages = [
  {
    nombre: 'Banco Galicia',
    url: '/wallets/iconos-billeteras/banco-galicia-logo.svg'
  },
  {
    nombre: 'mercado pago',
    url: '/wallets/iconos-billeteras/mercado-pago-logo-0-1-2048x2048.png'
  },
  // Brubank y tralalero no tienen imagen específica por ahora
  // Puedes agregar las imágenes a la carpeta public/wallets/iconos-billeteras/ y descomentar:
  // {
  //   nombre: 'Brubank',
  //   url: '/wallets/iconos-billeteras/brubank.png'
  // },
  // {
  //   nombre: 'tralalero',
  //   url: '/wallets/iconos-billeteras/tralalero.png'
  // },
  
  // Adicionales por si las necesitas después
  {
    nombre: 'Banco Nación',
    url: '/wallets/iconos-billeteras/banco-nacion-seeklogo.png'
  },
  {
    nombre: 'Banco Provincia',
    url: '/wallets/iconos-billeteras/cuenta-dni-banco-provincia-logo-png_seeklogo-444642.png'
  },
  {
    nombre: 'Banco Santander',
    url: '/wallets/iconos-billeteras/banco-santander-seeklogo.svg'
  },
  {
    nombre: 'Modo',
    url: '/wallets/iconos-billeteras/modo-seeklogo.png'
  },
  {
    nombre: 'Personal Pay',
    url: '/wallets/iconos-billeteras/personal pay.png'
  },
  {
    nombre: 'Naranja X',
    url: '/wallets/iconos-billeteras/naranja-x-seeklogo.svg'
  },
  {
    nombre: 'Prex',
    url: '/wallets/iconos-billeteras/prex.png'
  }
];

async function seedWalletImages() {
  try {
    const em = orm.em.fork();
    
    console.log('🌱 Iniciando carga de imágenes de wallets...');
    
    for (const imageData of walletImages) {
      // Check if image already exists
      const existing = await em.findOne(Imagen, { nombre: imageData.nombre });
      
      if (existing) {
        console.log(`⏭️  Imagen para "${imageData.nombre}" ya existe, saltando...`);
        continue;
      }
      
      const imagen = em.create(Imagen, imageData);
      await em.persist(imagen);
      console.log(`✅ Imagen agregada: ${imageData.nombre}`);
    }
    
    await em.flush();
    console.log('🎉 Carga de imágenes completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error al cargar imágenes:', error);
  } finally {
    await orm.close();
  }
}

seedWalletImages();
