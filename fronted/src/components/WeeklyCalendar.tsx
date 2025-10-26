import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { useState, useRef } from "react";

interface WeeklyCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

const WeeklyCalendar = ({ selectedDate, onDateSelect }: WeeklyCalendarProps) => {
  const currentWeek = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -120, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 120, behavior: 'smooth' });
    }
  };

  return (
    <Card className="p-4 md:p-6 bg-card border-border">
      <div className="flex items-center mb-4 md:mb-6">
        <Calendar className="w-5 h-5 text-primary mr-2" />
        <h3 className="text-base md:text-lg font-semibold text-card-foreground">
          Calendario Semanal
        </h3>
      </div>

      {/* Vista Desktop: Grid de 7 columnas */}
      <div className="hidden md:grid md:grid-cols-7 gap-2">
        {weekDays.map((day, index) => {
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());
          return (
            <Button
              key={index}
              variant={isSelected ? "default" : "ghost"}
              className={`flex flex-col items-center p-3 h-auto ${
                isSelected 
                  ? "bg-gradient-primary text-primary-foreground shadow-lg" 
                  : isToday 
                    ? "bg-secondary border-2 border-primary/30" 
                    : "hover:bg-secondary"
              }`}
              onClick={() => onDateSelect(day)}
            >
              <span className="text-base font-medium">
                {format(day, "EEEE", { locale: es })}
              </span>
            </Button>
          );
        })}
      </div>

      {/* Vista Mobile: Carrusel horizontal con flechas */}
      <div className="md:hidden relative">
        {/* Flecha izquierda */}
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-background transition-colors"
          aria-label="Scroll izquierda"
        >
          <ChevronLeft className="w-5 h-5 text-primary" />
        </button>

        {/* Contenedor deslizable */}
        <div
          ref={scrollContainerRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory px-8"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {weekDays.map((day, index) => {
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            return (
              <Button
                key={index}
                variant={isSelected ? "default" : "ghost"}
                className={`flex flex-col items-center p-3 min-w-[90px] h-auto snap-center shrink-0 ${
                  isSelected 
                    ? "bg-gradient-primary text-primary-foreground shadow-lg" 
                    : isToday 
                      ? "bg-secondary border-2 border-primary/30" 
                      : "hover:bg-secondary"
                }`}
                onClick={() => onDateSelect(day)}
              >
                <span className="text-sm font-medium">
                  {format(day, "EEEE", { locale: es })}
                </span>
              </Button>
            );
          })}
        </div>

        {/* Flecha derecha */}
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-background transition-colors"
          aria-label="Scroll derecha"
        >
          <ChevronRight className="w-5 h-5 text-primary" />
        </button>
      </div>

      {/* CSS para ocultar scrollbar en webkit browsers */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </Card>
  );
};

export default WeeklyCalendar;