import { Request, Response, NextFunction } from 'express';
import { ImagenService } from './imagen.service.js';

export function sanitizeImagenInput(req: Request, _res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    url: req.body.url,
    nombre: req.body.nombre,
  };

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });

  next();
}

export async function findAll(_req: Request, res: Response) {
  try {
    const imagenes = await ImagenService.findAll();
    res.status(200).json({ message: 'found all imagenes', data: imagenes });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function findOne(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const imagen = await ImagenService.findById(id);

    if (!imagen) {
      res.status(404).json({ message: 'imagen not found' });
      return;
    }

    res.status(200).json({ message: 'found imagen', data: imagen });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function add(req: Request, res: Response) {
  try {
    const imagen = await ImagenService.create(req.body.sanitizedInput);
    res.status(201).json({ message: 'imagen created', data: imagen });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function findByNombre(req: Request, res: Response) {
  try {
    const { nombre } = req.query;
    
    if (!nombre || typeof nombre !== 'string') {
      res.status(400).json({ message: 'El parámetro "nombre" es requerido' });
      return;
    }

    const imagen = await ImagenService.findByNombre(nombre);

    if (!imagen) {
      res.status(404).json({ message: 'imagen not found' });
      return;
    }

    res.status(200).json({ message: 'found imagen', data: imagen });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}
