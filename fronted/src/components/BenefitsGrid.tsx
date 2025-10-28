import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, getDay } from "date-fns";
import { useState, useEffect } from "react";
import { useBeneficios } from "@/api/beneficios";
import { getWalletById } from "@/api/wallets";
import { WalletImage } from './WalletImage';

import { wallets } from "./data/wallets.tsx";

const extractLocalidadNames = (value: unknown): string[] => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .map((loc) => {
        if (typeof loc === "string") {
          return loc;
        }
        if (loc && typeof loc === "object") {
          const { name, nombre, descripcion } = loc as { name?: string; nombre?: string; descripcion?: string };
          return name ?? nombre ?? descripcion ?? "";
        }
        return "";
      })
      .filter((loc): loc is string => typeof loc === "string" && loc.trim().length > 0);
  }

  if (value && typeof value === "object") {
    const maybeCollection = value as { toArray?: () => unknown[]; items?: unknown[] };
    if (typeof maybeCollection.toArray === "function") {
      return extractLocalidadNames(maybeCollection.toArray());
    }
    if (Array.isArray(maybeCollection.items)) {
      return extractLocalidadNames(maybeCollection.items);
    }
  }

  return [];
};
interface Benefit {
  id: string;
  descripcion: string;
  discount: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  icon: React.ReactNode;
  category: string;
  categoryId?: string; // ID del rubro para filtrar
  walletId: string;
  availableDays: number[]; // 0 = domingo, 1 = lunes, etc.
  discountType?: string;
  tope_reintegro?: number;
  cant_cuotas?: number;
  localidad?: string;
  localidades?: string[];
  infoWallet?: {
    name: string;
    [key: string]: unknown;
  };
}

// Static benefits removed - now loaded from backend

interface BenefitsGridProps {
  selectedWallets: string[];
  selectedCategory: string;
  selectedDiscountType?: string;
  selectedDate: Date;
  onBenefitClick?: (benefit: Benefit) => void;
}

const BenefitsGrid = ({ selectedWallets, selectedCategory, selectedDiscountType = "all", selectedDate, onBenefitClick }: BenefitsGridProps) => {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  
  // Usar el hook que filtra por localidad
  const { beneficios: beneficiosLocalidad, loading: loadingBeneficios, errors: errorsBeneficios } = useBeneficios();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const transformBeneficios = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Verificar si hay errores del hook
        if (errorsBeneficios && errorsBeneficios.length > 0) {
          setError(errorsBeneficios.join(", "));
          setBenefits([]);
          setLoading(false);
          return;
        }
        
        // Verificar si aún está cargando
        if (loadingBeneficios) {
          return;
        }
        
        // Transformar los beneficios ya filtrados por localidad
        const transformedBenefits: Benefit[] = await Promise.all(beneficiosLocalidad.map(async (item: unknown) => {
          const beneficioItem = item as {
            _id?: string;
            id?: string;
            descripcion?: string;
            discount?: number;
            fecha_desde?: string;
            fecha_hasta?: string;
            icon?: string;
            rubro?: { 
              name?: string;
              _id?: string;
              id?: string;
            };
            category?: string;
            wallet?: { _id?: string; id?: string };
            walletId?: string;
            availableDays?: number[];
            discountType?: string;
            tope_reintegro?: number;
            cant_cuotas?: number;
            localidad?: string;
            localidades?: Array<{ _id?: string; id?: string; name?: string; nombre?: string }>;
          };

          console.log("[BenefitsGrid] beneficio crudo", beneficioItem);
          
          const walletId = beneficioItem.wallet?._id || beneficioItem.wallet?.id || beneficioItem.walletId || '';
          let infoWallet = undefined;
          
          if (walletId) {
            try {
              const walletResponse = await getWalletById(walletId);
              infoWallet = {
                name: walletResponse.data?.data?.name || walletResponse.data?.name || walletId,
                ...walletResponse.data?.data || walletResponse.data
              };
            } catch (error) {
              console.warn(`Error fetching wallet ${walletId}:`, error);
              infoWallet = { name: walletId };
            }
          }
          
          // Extraer el ID del rubro para comparar con selectedCategory
          const rubroId = beneficioItem.rubro?._id || beneficioItem.rubro?.id || '';
          
          // Extraer los nombres de las localidades
          const localidadesArray = extractLocalidadNames(
            beneficioItem.localidades ?? beneficioItem.localidad
          );
          const localidadTexto = localidadesArray.length > 0
            ? localidadesArray.join(', ')
            : typeof beneficioItem.localidad === "string"
              ? beneficioItem.localidad
              : "";
          
          console.log('Beneficio:', beneficioItem.descripcion, '| Rubro:', beneficioItem.rubro?.name, '| RubroID:', rubroId);
          
          return {
            id: beneficioItem._id || beneficioItem.id || '',
            descripcion: beneficioItem.descripcion || '',
            discount: beneficioItem.discount || 0,
            fecha_desde: beneficioItem.fecha_desde,
            fecha_hasta: beneficioItem.fecha_hasta,
            icon: null, // El ícono se obtiene del wallet
            category: beneficioItem.rubro?.name || beneficioItem.category || '',
            categoryId: rubroId, // Guardar el ID del rubro
            walletId,
            availableDays: Array.isArray(beneficioItem.availableDays) ? beneficioItem.availableDays : [],
            discountType: beneficioItem.discountType || '',
            tope_reintegro: beneficioItem.tope_reintegro,
            cant_cuotas: beneficioItem.cant_cuotas,
            localidad: localidadTexto,
            localidades: localidadesArray,
            infoWallet,
          };
        }));
        
        setBenefits(transformedBenefits);
      } catch (err) {
        console.error("Error al transformar beneficios:", err);
        setError("Error al procesar beneficios");
        setBenefits([]);
      } finally {
        setLoading(false);
      }
    };

    transformBeneficios();
  }, [beneficiosLocalidad, loadingBeneficios, errorsBeneficios]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground text-lg">Cargando beneficios...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  const selectedDayOfWeek = getDay(selectedDate);
  
  console.log('Filtrando beneficios con:', {
    selectedCategory,
    selectedWallets,
    selectedDiscountType,
    selectedDayOfWeek
  });
  
  const filteredBenefits = benefits.filter(benefit => {
    const walletMatch = selectedWallets.includes(benefit.walletId);
    
    // Comparar por ID de rubro (categoryId) en lugar de nombre (category)
    const categoryMatch = selectedCategory === "all" || benefit.categoryId === selectedCategory;
    
    const dayMatch = benefit.availableDays.includes(selectedDayOfWeek);
    const discountTypeMatch = selectedDiscountType === "all" || (benefit.discountType && benefit.discountType.toLowerCase().includes(selectedDiscountType.toLowerCase()));
    
    if (categoryMatch && benefit.categoryId) {
      console.log(' Beneficio filtrado:', benefit.descripcion, '| Categoría:', benefit.category, '| ID:', benefit.categoryId);
    }
    
    return walletMatch && categoryMatch && dayMatch && discountTypeMatch;
  });
  
  console.log('Total beneficios filtrados:', filteredBenefits.length);

  const getDiscountColor = (discount: number) => {
    if (discount >= 40) return "bg-green-500";
    if (discount >= 25) return "bg-yellow-500";
    if (discount >= 15) return "bg-red-600";
    return "bg-blue-500";
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
      {filteredBenefits.map((benefit) => (
        <Card
          key={benefit.id}
          className="p-3 md:p-6 hover:scale-105 transition-all cursor-pointer group bg-card border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20"
          onClick={() => onBenefitClick && onBenefitClick(benefit)}
        >
            <div className="flex flex-col items-center space-y-2 md:space-y-4">
            <WalletImage
              walletName={benefit.infoWallet?.name || benefit.walletId}
              size="md"
              className="group-hover:animate-float"
              fallbackIcon={benefit.icon}
            />
            {/* el nombre de benefico asociado a la wallet con logo */ }
            <div className="text-center space-y-1 md:space-y-2">
              <div className="flex items-center justify-center">
                <h3 className="font-bold text-sm md:text-lg text-card-foreground">
                  {benefit.infoWallet?.name || benefit.walletId}
                </h3>
              </div>
            {/* cambie en funcion del tipo de descuento descuento*/ }

              <Badge className={`${getDiscountColor(benefit.discount)} text-white font-bold text-xs md:text-lg px-2 py-1 md:px-4 md:py-2`}>
                {benefit.discountType?.toLowerCase().includes("cuota")
                
                  ? `${benefit.discount} % OFF`
                  : benefit.discountType?.toLowerCase().includes("reintegro")
                    ? `Reintegro ${benefit.discount}%`
                    : benefit.discountType?.toLowerCase().includes("sin tope")
                      ? `${benefit.discount}% OFF`
                  : `${benefit.discount}% OFF`}
              </Badge>
            </div>
            
            <div className="text-xs md:text-sm text-muted-foreground capitalize">
              {/* Aquí va el tipo de descuento, por ejemplo: "Reintegro", "Sin tope", "En cuotas" */}
              {/* Puedes agregar una propiedad "discountType" al objeto Benefit y mostrarla aquí */}
              {benefit.discountType }
            </div>
            </div>
          </Card>
          ))}
          
          {filteredBenefits.length === 0 && (
        <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
          <div className="text-muted-foreground text-lg">
            No hay beneficios disponibles para {['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'][getDay(selectedDate)]}
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            Selecciona otro día u otra categoría para ver más ofertas
          </div>
        </div>
      )}
    </div>
  );
};

export default BenefitsGrid;

