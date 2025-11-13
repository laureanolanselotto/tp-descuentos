import { Request, Response, NextFunction } from "express";
import { orm } from "../shared/db/orm.js";
import { HistorialAdmin } from "../historial_admin/historial_admin.entity.js";

const em = orm.em;

interface CambioConfig {
  entidad: string; // Nombre de la entidad (ej: "beneficios", "wallets")
  accion: "CREATE" | "UPDATE" | "DELETE";
}

/**
 * Middleware para registrar cambios en el historial de admin
 * Actúa como un trigger de SQL, guardando automáticamente los cambios
 */
export function registrarCambio(config: CambioConfig) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Obtener datos del usuario autenticado (debe venir del middleware validarToken)
      const persona = (req as any).persona;
      
      if (!persona) {
        console.warn("No se puede registrar cambio: persona no encontrada en request");
        return next();
      }

      // Verificar si es admin
      if (!persona.isAdmin) {
        // Si no es admin, simplemente continuar sin registrar
        return next();
      }

      // Para UPDATE y DELETE, necesitamos el estado anterior
      let estadoAnterior: any = null;
      const entidadId = req.params.id;

      if ((config.accion === "UPDATE" || config.accion === "DELETE") && entidadId) {
        // Aquí deberíamos obtener el estado anterior del registro
        // Lo haremos después de que se ejecute el controlador
        // Por ahora, guardamos una referencia para usar en el hook de respuesta
        const originalJson = res.json.bind(res);
        
        res.json = function(body: any) {
          // Registrar el cambio después de que la operación sea exitosa
          if (res.statusCode >= 200 && res.statusCode < 300) {
            registrarEnHistorial({
              personaId: persona._id?.toString() || persona.id,
              personaNombre: persona.name,
              entidad: config.entidad,
              entidadId: entidadId || body.data?._id?.toString() || body.data?.id,
              accion: config.accion,
              cambios: {
                antes: (req as any).estadoAnterior,
                despues: config.accion !== "DELETE" ? body.data : undefined
              }
            }).catch(err => console.error("Error al registrar en historial:", err));
          }
          return originalJson(body);
        };
      } else if (config.accion === "CREATE") {
        // Para CREATE, solo guardamos el estado después
        const originalJson = res.json.bind(res);
        
        res.json = function(body: any) {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            registrarEnHistorial({
              personaId: persona._id?.toString() || persona.id,
              personaNombre: persona.name,
              entidad: config.entidad,
              entidadId: body.data?._id?.toString() || body.data?.id,
              accion: config.accion,
              cambios: {
                despues: body.data
              }
            }).catch(err => console.error("Error al registrar en historial:", err));
          }
          return originalJson(body);
        };
      }

      next();
    } catch (error) {
      console.error("Error en middleware registrarCambio:", error);
      // No bloqueamos la operación si hay error en el registro
      next();
    }
  };
}

/**
 * Función auxiliar para registrar en el historial
 */
async function registrarEnHistorial(datos: {
  personaId: string;
  personaNombre: string;
  entidad: string;
  entidadId: string;
  accion: string;
  cambios?: any;
}) {
  try {
    const fork = em.fork();
    
    const historial = fork.create(HistorialAdmin, {
      ...datos,
      fechaModificacion: new Date()
    });

    await fork.flush();
    console.log(`✓ Cambio registrado: ${datos.accion} en ${datos.entidad} por ${datos.personaNombre}`);
  } catch (error) {
    console.error("Error al guardar en historial:", error);
  }
}

/**
 * Middleware para capturar el estado anterior (usar antes del controlador)
 */
export function capturarEstadoAnterior(entidadClass: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      if (!id) return next();

      const fork = em.fork();
      const registro = await fork.findOne(entidadClass, { _id: id } as any);
      
      if (registro) {
        (req as any).estadoAnterior = JSON.parse(JSON.stringify(registro));
      }
      
      next();
    } catch (error) {
      console.error("Error al capturar estado anterior:", error);
      next();
    }
  };
}
