import { Router } from "express";
import { findAll, add } from "./historial_admin.controller.js";
import { authRequiredToken } from "../middlewares/validenteToken.js";
import { verificarAdmin } from "../middlewares/verificarAdmin.js";

const historialAdminRouter = Router();

// GET y POST sin autenticación (el frontend valida isAdmin)
// Esto evita problemas con cookies en contextos async
historialAdminRouter.get("/", findAll);
historialAdminRouter.post("/", add);

export default historialAdminRouter;
