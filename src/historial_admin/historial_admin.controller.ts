import { Request, Response } from "express";
import { ObjectId } from "@mikro-orm/mongodb";
import { orm } from "../shared/db/orm.js";
import { HistorialAdmin } from "./historial_admin.entity.js";

const em = orm.em;

// GET - Obtener historial con filtros opcionales
async function findAll(req: Request, res: Response) {
  try {
    const { entidad, accion, desde, hasta, limit = 100 } = req.query;

    const filter: any = {};

    // Filtros opcionales
    if (entidad) filter.entidad = entidad;
    if (accion) filter.accion = accion;
    
    // Filtro de fecha
    if (desde || hasta) {
      filter.fechaModificacion = {};
      if (desde) filter.fechaModificacion.$gte = new Date(desde as string);
      if (hasta) filter.fechaModificacion.$lte = new Date(hasta as string);
    }

    const historial = await em.find(HistorialAdmin, filter, {
      orderBy: { fechaModificacion: "DESC" },
      limit: Number(limit)
    });

    return res.status(200).json({
      message: "Historial obtenido exitosamente",
      data: historial,
      total: historial.length
    });
  } catch (error: any) {
    return res.status(500).json({ 
      message: "Error al obtener el historial",
      error: error.message 
    });
  }
}

// POST - Crear registro de historial
async function add(req: Request, res: Response) {
  try {
    const { personaNombre, entidad, accion } = req.body;

    // Validaciones básicas
    if (!personaNombre || !entidad || !accion) {
      return res.status(400).json({
        message: "Faltan campos requeridos: personaNombre, entidad, accion"
      });
    }

    const historial = em.create(HistorialAdmin, {
      personaNombre,
      entidad,
      accion,
      fechaModificacion: new Date()
    });

    await em.flush();

    return res.status(201).json({
      message: "Registro de historial creado exitosamente",
      data: historial
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Error al crear registro de historial",
      error: error.message
    });
  }
}

export { findAll, add };
