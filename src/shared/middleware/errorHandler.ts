import { Request, Response, NextFunction } from 'express';

/**
 * Middleware global para manejo de errores
 * @param err - Error capturado
 * @param req - Request object de Express
 * @param res - Response object de Express
 * @param next - Next function de Express
 * @returns Respuesta JSON con el error formateado
 */
export const errorHandler = (
    err: any, 
    req: Request, 
    res: Response, 
    next: NextFunction
) => {
    console.error('Error:', err.stack);
    
    // Error de validación
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Datos de entrada inválidos',
            errors: err.errors || []
        });
    }
    
    // Error de cast (MongoDB ObjectId inválido)
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: 'ID inválido',
            error: 'El ID proporcionado no tiene el formato correcto'
        });
    }
    
    // Error de conexión a base de datos
    if (err.name === 'MongoError' || err.name === 'MongoServerError') {
        return res.status(503).json({
            success: false,
            message: 'Error de base de datos',
            error: 'Servicio temporalmente no disponible'
        });
    }
    
    // Error genérico
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
    });
};

/**
 * Middleware para rutas no encontradas
 */
export const notFoundHandler = (req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada',
        path: req.originalUrl
    });
};

/**
 * Wrapper para funciones async que maneja errores automáticamente
 * Evita tener que escribir try-catch en cada controlador
 * @param fn - Función async a envolver
 * @returns Función que captura errores automáticamente
 * @example
 * const safeController = asyncHandler(async (req, res) => {
 *   const data = await someAsyncOperation();
 *   res.json(data);
 * });
 */
export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
