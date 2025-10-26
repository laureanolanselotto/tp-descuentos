import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { getCategoriesFromRubros, type Category } from "@/api/rubros";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CategoryFilterProps {
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
  selectedDiscountType?: string;
  onDiscountTypeSelect?: (discountType: string) => void;
}

const discountTypes = [
  { id: "all", label: "Todos" },
  { id: "En cuotas", label: "Cuotas" },
  { id: "Reintegro", label: "Reintegro" },
  { id: "Sin tope", label: "Sin tope" }
];

const CategoryFilter = ({ selectedCategory, onCategorySelect, selectedDiscountType = "all", onDiscountTypeSelect }: CategoryFilterProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showMoreCategories, setShowMoreCategories] = useState(false);
  
  // Mostrar solo las primeras 6 categorías en desktop, el resto en el dropdown
  const visibleCategoriesCount = 6;
  const visibleCategories = categories.slice(0, visibleCategoriesCount);
  const hiddenCategories = categories.slice(visibleCategoriesCount);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesFromBackend = await getCategoriesFromRubros();
        setCategories(categoriesFromBackend);
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar categorías:", error);
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -150, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 150, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center mb-4">
        <p className="text-muted-foreground">Cargando categorías...</p>
      </div>
    );
  }

  return (
    <div className="w-full mb-6">
      {/* Vista Desktop: Categorías en línea con botón "+" */}
      <div className="hidden md:flex flex-col gap-6 items-center max-w-6xl mx-auto">
        {/* Sección de Rubros */}
        <div className="flex justify-center items-center gap-3 flex-wrap w-full">
          {visibleCategories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "secondary"}
              size="sm"
              onClick={() => onCategorySelect(category.id)}
              className={`flex items-center gap-2 transition-all ${
                selectedCategory === category.id
                  ? "bg-gradient-primary hover:opacity-90 shadow-lg"
                  : "hover:border-primary/50"
              }`}
            >
              {category.icon}
              <span className="font-medium">{category.name}</span>
            </Button>
          ))}

          {/* Botón "+" para categorías adicionales */}
          {hiddenCategories.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex items-center gap-1 hover:border-primary/50"
                >
                  <Plus className="w-4 h-4" />
                  <span className="font-medium">Más</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="max-h-96 overflow-y-auto">
                {hiddenCategories.map((category) => (
                  <DropdownMenuItem
                    key={category.id}
                    onClick={() => onCategorySelect(category.id)}
                    className={`flex items-center gap-2 cursor-pointer ${
                      selectedCategory === category.id ? "bg-primary/10" : ""
                    }`}
                  >
                    {category.icon}
                    <span>{category.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        {/* Selector de tipo de descuento separado */}
        <div className="flex flex-col items-center gap-2">
          <label className="text-sm font-medium text-muted-foreground">Filtrar por tipo:</label>
          <select
            value={selectedDiscountType}
            onChange={(e) => onDiscountTypeSelect && onDiscountTypeSelect(e.target.value)}
            className="rounded-md border border-input px-4 py-2 bg-card text-card-foreground text-sm min-w-[200px] cursor-pointer hover:border-primary/50 transition-colors"
          >
            {discountTypes.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Vista Mobile: Carrusel horizontal con flechas */}
      <div className="md:hidden space-y-6 px-2">
        {/* Sección de Rubros */}
        <div className="relative">
          {/* Flecha izquierda */}
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm rounded-full p-1.5 shadow-md hover:bg-background transition-colors"
            aria-label="Scroll izquierda"
          >
            <ChevronLeft className="w-4 h-4 text-primary" />
          </button>

          {/* Contenedor deslizable de categorías */}
          <div
            ref={scrollContainerRef}
            className="flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory px-6 pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "secondary"}
                size="sm"
                onClick={() => onCategorySelect(category.id)}
                className={`flex items-center gap-2 transition-all snap-center shrink-0 ${
                  selectedCategory === category.id
                    ? "bg-gradient-primary hover:opacity-90 shadow-lg"
                    : "hover:border-primary/50"
                }`}
              >
                {category.icon}
                <span className="font-medium text-xs">{category.name}</span>
              </Button>
            ))}
          </div>

          {/* Flecha derecha */}
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm rounded-full p-1.5 shadow-md hover:bg-background transition-colors"
            aria-label="Scroll derecha"
          >
            <ChevronRight className="w-4 h-4 text-primary" />
          </button>
        </div>

        {/* Separador visual */}
        <div className="w-full h-px bg-border mx-auto max-w-xs"></div>

        {/* Selector de tipo de descuento en móvil */}
        <div className="flex flex-col items-center gap-2">
          <label className="text-xs font-medium text-muted-foreground">Filtrar por tipo de beneficio:</label>
          <select
            value={selectedDiscountType}
            onChange={(e) => onDiscountTypeSelect && onDiscountTypeSelect(e.target.value)}
            className="rounded-md border border-input px-3 py-2 bg-card text-card-foreground text-sm w-full max-w-xs cursor-pointer"
          >
            {discountTypes.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* CSS para ocultar scrollbar */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default CategoryFilter;