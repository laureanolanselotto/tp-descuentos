import instance from './axios';
import { 
  Grid3X3, 
  Coffee, 
  Flame, 
  Shirt, 
  Baby, 
  Dumbbell, 
  Home, 
  Sparkles, 
  Gamepad2,
  ShoppingBag
} from "lucide-react";
import { createElement } from 'react';

// Interfaz para Rubro del backend
export interface Rubro {
  _id?: string;
  id?: string;
  nombre: string;
  descripcion: string;
  beneficios?: Array<unknown>;
}

// Interfaz para Category (formato usado en CategoryFilter)
export interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
}

// Mapeo de nombres de rubros a iconos
const iconMap: Record<string, any> = {
  'comida': Coffee,
  'food': Coffee,
  'combustible': Flame,
  'fuel': Flame,
  'indumentaria': Shirt,
  'ropa': Shirt,
  'clothing': Shirt,
  'niños': Baby,
  'ninos': Baby,
  'kids': Baby,
  'deporte': Dumbbell,
  'deportes': Dumbbell,
  'sport': Dumbbell,
  'sports': Dumbbell,
  'hogar': Home,
  'home': Home,
  'belleza': Sparkles,
  'beauty': Sparkles,
  'entretenimiento': Gamepad2,
  'entertainment': Gamepad2,
  'default': ShoppingBag
};

// Función para obtener el icono basado en el nombre del rubro
const getIconForRubro = (nombre: string): any => {
  const nombreLower = nombre.toLowerCase().trim();
  
  // Buscar coincidencia exacta primero
  if (iconMap[nombreLower]) {
    return iconMap[nombreLower];
  }
  
  // Buscar coincidencia parcial
  for (const [key, icon] of Object.entries(iconMap)) {
    if (nombreLower.includes(key) || key.includes(nombreLower)) {
      return icon;
    }
  }
  
  // Retornar icono por defecto
  return iconMap.default;
};

// Función para transformar Rubro a Category
const transformRubroToCategory = (rubro: Rubro): Category => {
  const IconComponent = getIconForRubro(rubro.nombre);
  
  return {
    id: rubro.id || rubro._id || '',
    name: rubro.nombre,
    icon: createElement(IconComponent, { className: 'w-4 h-4' })
  };
};

// Obtener todos los rubros desde el backend
export const getRubros = async (): Promise<Rubro[]> => {
  try {
    const response = await instance.get('/rubros');
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error('Error al cargar rubros:', error);
    throw error;
  }
};

// Obtener rubros transformados al formato Category
export const getCategoriesFromRubros = async (): Promise<Category[]> => {
  try {
    const rubros = await getRubros();
    
    // Transformar rubros a categorías
    const categories = rubros.map(transformRubroToCategory);
    
    // Agregar la categoría "Todas" al inicio
    const allCategory: Category = {
      id: 'all',
      name: 'Todas',
      icon: createElement(Grid3X3, { className: 'w-4 h-4' })
    };
    
    return [allCategory, ...categories];
  } catch (error) {
    console.error('Error al transformar rubros a categorías:', error);
    // Retornar al menos la categoría "Todas" en caso de error
    return [{
      id: 'all',
      name: 'Todas',
      icon: createElement(Grid3X3, { className: 'w-4 h-4' })
    }];
  }
};

// Obtener un rubro específico por ID
export const getRubroById = async (id: string): Promise<Rubro> => {
  try {
    const response = await instance.get(`/rubros/${id}`);
    return response.data?.data || response.data;
  } catch (error) {
    console.error(`Error al cargar rubro ${id}:`, error);
    throw error;
  }
};

// Crear un nuevo rubro
export const createRubro = async (rubro: Omit<Rubro, '_id' | 'id'>): Promise<Rubro> => {
  try {
    const response = await instance.post('/rubros', rubro);
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error al crear rubro:', error);
    throw error;
  }
};

// Actualizar un rubro existente
export const updateRubro = async (id: string, rubro: Partial<Rubro>): Promise<Rubro> => {
  try {
    const response = await instance.put(`/rubros/${id}`, rubro);
    return response.data?.data || response.data;
  } catch (error) {
    console.error(`Error al actualizar rubro ${id}:`, error);
    throw error;
  }
};

// Eliminar un rubro
export const deleteRubro = async (id: string): Promise<void> => {
  try {
    await instance.delete(`/rubros/${id}`);
  } catch (error) {
    console.error(`Error al eliminar rubro ${id}:`, error);
    throw error;
  }
};
