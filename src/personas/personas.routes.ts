import { Router } from "express";
import  { controler } from "./personas.controler.js";

export const PersonasRouter = Router();

PersonasRouter.get("/", controler.findAll); // esto es para reusar el controlador de findAll
PersonasRouter.get("/:id", controler.findOne ); // esto es para reusar el controlador de findAll
PersonasRouter.post("/", controler.sanitizePersonaInput,controler.add); // crear una nueva persona
PersonasRouter.put("/:id", controler.sanitizePersonaInput,controler.update); // actualizar una persona existente
PersonasRouter.patch("/:id", controler.sanitizePersonaInput,controler.update); // actualizar una persona existente
PersonasRouter.delete("/:id",controler.remove); // eliminar una persona