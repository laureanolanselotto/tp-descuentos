import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { getCategoriesFromRubros, type Category } from "@/api/rubros";

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

  if (loading) {
    return (
      <div className="w-full flex justify-center mb-4">
        <p className="text-muted-foreground">Cargando categorías...</p>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center mb-4">
      <div className="flex flex-wrap gap-3 items-center max-w-4xl w-full justify-center">
        {categories.map((category) => (
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

        <div className="ml-2">
          <select
            value={selectedDiscountType}
            onChange={(e) => onDiscountTypeSelect && onDiscountTypeSelect(e.target.value)}
            className="rounded-md border border-input px-3 py-2 bg-card text-card-foreground"
          >
            {discountTypes.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default CategoryFilter;