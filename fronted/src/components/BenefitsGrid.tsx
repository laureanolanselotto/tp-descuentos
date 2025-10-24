import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Coffee, 
  ShoppingCart, 
  Car, 
  Pizza, 
  Gamepad2, 
  BookOpen,
  Music,
  Plane,
  Hotel
} from "lucide-react";
import { format, getDay } from "date-fns";
import { useState, useEffect } from "react";
import { getBeneficios } from "@/api/beneficios";
import { getWalletById } from "@/api/wallets";

import { wallets } from "./data/wallets.tsx";
interface Benefit {
  id: string;
  name: string;
  discount: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  icon: React.ReactNode;
  category: string;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to map icon strings to React components
  const getIconComponent = (iconName?: string): React.ReactNode => {
    const iconMap: Record<string, React.ReactNode> = {
      'coffee': <Coffee className="w-8 h-8" />,
      'shopping': <ShoppingCart className="w-8 h-8" />,
      'car': <Car className="w-8 h-8" />,
      'pizza': <Pizza className="w-8 h-8" />,
      'gamepad': <Gamepad2 className="w-8 h-8" />,
      'book': <BookOpen className="w-8 h-8" />,
      'music': <Music className="w-8 h-8" />,
      'plane': <Plane className="w-8 h-8" />,
      'hotel': <Hotel className="w-8 h-8" />,
    };
    return iconMap[iconName || ''] || <Coffee className="w-8 h-8" />;
  };

  useEffect(() => {
    const fetchBeneficios = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getBeneficios();
        const beneficiosData = response.data?.data || response.data || [];
        
        // Transform backend data to match expected Benefit structure
        const transformedBenefits: Benefit[] = await Promise.all(beneficiosData.map(async (item: unknown) => {
          const beneficioItem = item as {
            _id?: string;
            id?: string;
            name?: string;
            discount?: number;
            fecha_desde?: string;
            fecha_hasta?: string;
            icon?: string;
            rubro?: { name?: string };
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
          
          return {
            id: beneficioItem._id || beneficioItem.id || '',
            name: beneficioItem.name || '',
            discount: beneficioItem.discount || 0,
            fecha_desde: beneficioItem.fecha_desde,
            fecha_hasta: beneficioItem.fecha_hasta,
            icon: getIconComponent(beneficioItem.icon),
            category: beneficioItem.rubro?.name || beneficioItem.category || '',
            walletId,
            availableDays: Array.isArray(beneficioItem.availableDays) ? beneficioItem.availableDays : [],
            discountType: beneficioItem.discountType || '',
            tope_reintegro: beneficioItem.tope_reintegro,
            infoWallet,
          };
        }));
        
        setBenefits(transformedBenefits);
      } catch (err) {
        console.error("Error al cargar beneficios:", err);
        setError("Error al cargar beneficios");
        setBenefits([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBeneficios();
  }, []);

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
  const filteredBenefits = benefits.filter(benefit => {
    const walletMatch = selectedWallets.includes(benefit.walletId);
    const categoryMatch = selectedCategory === "all" || benefit.category === selectedCategory;
    const dayMatch = benefit.availableDays.includes(selectedDayOfWeek);
    const discountTypeMatch = selectedDiscountType === "all" || (benefit.discountType && benefit.discountType.toLowerCase().includes(selectedDiscountType.toLowerCase()));
    return walletMatch && categoryMatch && dayMatch && discountTypeMatch;
  });

  const getDiscountColor = (discount: number) => {
    if (discount >= 40) return "bg-green-500";
    if (discount >= 25) return "bg-yellow-500";
    if (discount >= 15) return "bg-red-600";
    return "bg-blue-500";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredBenefits.map((benefit) => (
        <Card
          key={benefit.id}
          className="p-6 hover:scale-105 transition-all cursor-pointer group bg-card border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20"
          onClick={() => onBenefitClick && onBenefitClick(benefit)}
        >
            <div className="flex flex-col items-center space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center group-hover:animate-float">
              <div className="text-primary">
                {wallets.find(w => w.id === benefit.walletId)?.image ? (
                  <img
                    src={wallets.find(w => w.id === benefit.walletId)!.image as string}
                    alt={wallets.find(w => w.id === benefit.walletId)!.name}
                    className="w-10 h-10 object-contain mix-blend-multiply"
                  />
                ) : (
                  wallets.find(w => w.id === benefit.walletId)?.icon || benefit.icon
                )}
              </div>
            </div>
            {/* el nombre de benefico asociado a la wallet con logo */ }
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center">
                <h3 className="font-bold text-lg text-card-foreground">
                  {benefit.infoWallet?.name || benefit.walletId}
                </h3>
              </div>
            {/* cambie en funcion del tipo de descuento descuento*/ }

              <Badge className={`${getDiscountColor(benefit.discount)} text-white font-bold text-lg px-4 py-2`}>
                {benefit.discountType?.toLowerCase().includes("cuota")
                
                  ? `${benefit.discount} cuotas`
                  : benefit.discountType?.toLowerCase().includes("reintegro")
                    ? `Reintegro ${benefit.discount}%`
                    : benefit.discountType?.toLowerCase().includes("sin tope")
                      ? `${benefit.discount}% OFF`
                  : `${benefit.discount}% OFF`}
              </Badge>
            </div>
            
            <div className="text-sm text-muted-foreground capitalize">
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

