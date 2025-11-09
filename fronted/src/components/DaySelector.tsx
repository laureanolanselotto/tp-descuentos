import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface DaySelectorProps {
  selectedDays: number[];
  onDaysChange: (days: number[]) => void;
}
// Días de la semana con sus valores correspondientes
const DAYS = [
  { value: 0, label: "Lunes" },
  { value: 1, label: "Martes" },
  { value: 2, label: "Miércoles" },
  { value: 3, label: "Jueves" },
  { value: 4, label: "Viernes" },
  { value: 5, label: "Sábado" },
  { value: 6, label: "Domingo" },
];
// Componente DaySelector
const DaySelector = ({ selectedDays, onDaysChange }: DaySelectorProps) => {
  const toggleDay = (dayValue: number) => {
    if (selectedDays.includes(dayValue)) {
      onDaysChange(selectedDays.filter(d => d !== dayValue));
    } else {
      onDaysChange([...selectedDays, dayValue].sort());
    }
  };

  const selectAll = () => {
    onDaysChange([0, 1, 2, 3, 4, 5, 6]);
  };

  const clearAll = () => {
    onDaysChange([]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Días Disponibles</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={selectAll}
            className="h-7 text-xs"
          >
            Todos
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearAll}
            className="h-7 text-xs"
          >
            Ninguno
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {DAYS.map((day) => {
          const isSelected = selectedDays.includes(day.value);
          return (
            <Button
              key={day.value}
              type="button"
              variant={isSelected ? "default" : "outline"}
              className={`h-10 ${
                isSelected 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-secondary"
              }`}
              onClick={() => toggleDay(day.value)}
            >
              {day.label}
            </Button>
          );
        })}
      </div>
      
      <p className="text-xs text-muted-foreground">
        {selectedDays.length === 0 
          ? "Ningún día seleccionado" 
          : `${selectedDays.length} día${selectedDays.length !== 1 ? 's' : ''} seleccionado${selectedDays.length !== 1 ? 's' : ''}`}
      </p>
    </div>
  );
};

export default DaySelector;
