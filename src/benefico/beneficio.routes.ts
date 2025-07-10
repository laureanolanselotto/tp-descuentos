import { Router } from "express";
import { controler } from "./beneficio.controler.js";

export const BeneficioRouter = Router();

BeneficioRouter.get("/", controler.findAll); // esto es para reusar el controlador de
BeneficioRouter.get("/:id", controler.findOne ); // esto es para reusar el controlado
BeneficioRouter.post("/", controler.sanitizeBeneficioInput,controler.add); // crear una
BeneficioRouter.put("/:id", controler.sanitizeBeneficioInput,controler.uppdate); // act
BeneficioRouter.patch("/:id", controler.sanitizeBeneficioInput,controler.uppdate); // a
BeneficioRouter.delete("/:id",controler.remove); // eliminar una persona;