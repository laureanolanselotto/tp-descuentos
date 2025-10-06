import express from "express";
import path from 'node:path';
import 'reflect-metadata';
import { fileURLToPath } from 'node:url';
import { PersonasRouter } from "./personas/personas.routes.js";
import { BeneficiosRouter } from './beneficios/beneficios.routes.js';
import { orm } from "./shared/db/orm.js";
import { RequestContext } from '@mikro-orm/core';
import { WalletRouter } from "./wallet/wallet.routes.js";
import { MikroORM } from "@mikro-orm/core";
import { NotificacionRouter } from "./notificacion/notificacion.routes.js";
import { RubrosRouter } from "./rubros/rubros.routes.js";
import { LocalidadRouter } from "./localidad/localidad.routes.js";
import { CiudadRouter  } from "./ciudad/ciudad.routes.js";
const app = express();
app.use(express.json());

app.use((req, res, next) => {
  RequestContext.create(orm.em, next);
});

app.use('/api/personas', PersonasRouter)
app.use('/api/beneficios', BeneficiosRouter)
app.use('/api/wallets', WalletRouter)
app.use('/api/notificaciones', NotificacionRouter)
app.use('/api/rubros', RubrosRouter)
app.use('/api/localidades', LocalidadRouter)
app.use('/api/ciudades', CiudadRouter);
/*const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '../public');*/

/*app.use('/virtual-wallets', express.static(path.join(publicDir, 'virtual-wallets')));
app.get(/^\/virtual-wallets(?:\/.*)?$/, (_req, res) => {
  res.sendFile(path.join(publicDir, 'virtual-wallets', 'index.html'));
});*/

app.use((_, res) => {
  res.status(404).send({ message: 'Resource not found' })
  return
})

app.listen(3000, () => {
  console.log('Server is running on port http://localhost:3000');
});
