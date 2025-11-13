import { Router } from "express";
import { findAll, add } from "./historial_admin.controller.js";
import { authRequiredToken } from "../middlewares/validenteToken.js";
import { verificarAdmin } from "../middlewares/verificarAdmin.js";

const historialAdminRouter = Router();

// Solo admins pueden ver y crear registros de historial
historialAdminRouter.get("/", authRequiredToken, verificarAdmin, findAll);
historialAdminRouter.post("/", authRequiredToken, verificarAdmin, add);

export default historialAdminRouter;
