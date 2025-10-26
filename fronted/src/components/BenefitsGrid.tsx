import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, getDay } from "date-fns";
import { useState, useEffect } from "react";
import { useBeneficios } from "@/api/beneficios";
import { getWalletById } from "@/api/wallets";

import { wallets } from "./data/wallets.tsx";
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
          };
          
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
            <div className="w-12 h-12 md:w-20 md:h-20 rounded-xl md:rounded-2xl bg-white flex items-center justify-center group-hover:animate-float">
              <div className="text-primary">
                {wallets.find(w => w.id === benefit.walletId)?.image ? (
                  <img
                    src={wallets.find(w => w.id === benefit.walletId)!.image as string}
                    alt={wallets.find(w => w.id === benefit.walletId)!.name}
                    className="w-6 h-6 md:w-10 md:h-10 object-contain mix-blend-multiply"
                  />
                ) : (
                  wallets.find(w => w.id === benefit.walletId)?.icon || benefit.icon
                )}
              </div>
            </div>
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
                
                  ? `${benefit.discount} cuotas`
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

