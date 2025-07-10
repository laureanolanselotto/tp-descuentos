import { Router } from "express";
import {
  getBeneficios,
  getBeneficioById,
  createBeneficio,
  updateBeneficio,
  deleteBeneficio
} from "./beneficio.controller.js";

export const BeneficioRouter = Router();

BeneficioRouter.get("/", getBeneficios);
BeneficioRouter.get("/:id", getBeneficioById);
BeneficioRouter.post("/", createBeneficio);
BeneficioRouter.put("/:id", updateBeneficio);
BeneficioRouter.patch("/:id", updateBeneficio);
BeneficioRouter.delete("/:id", deleteBeneficio);