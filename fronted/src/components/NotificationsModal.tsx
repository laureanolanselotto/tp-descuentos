import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { getWallets } from "@/api/wallets";
import { WalletImage } from "./WalletImage";
import { ChevronLeft, ChevronRight } from "lucide-react";

type DiscountType = "all" | "En cuotas" | "Reintegro" | "Sin tope";

const DISCOUNT_TYPES: { id: DiscountType; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "En cuotas", label: "Cuotas" },
  { id: "Reintegro", label: "Reintegro" },
  { id: "Sin tope", label: "Sin tope" },
];

// Días de la semana (abreviados en español)
export type Weekday = "Lunes" | "Martes" | "Miércoles" | "Jueves" | "Viernes" | "Sábado" | "Domingo";
const WEEK_DAYS: Weekday[] = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export interface NotificationsPrefs {
  enabled: boolean;
  minDiscount: number;
  types: DiscountType[]; // multiple allowed, can include "all"
  wallets: string[]; // subset of availableWallets
  days?: Weekday[];
}

interface NotificationsModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSave?: (prefs: NotificationsPrefs) => void;
  availableWallets: string[];
}

const STORAGE_KEY = "notifications-prefs";

const NotificationsModal = ({ isOpen, onClose, onSave, availableWallets }: NotificationsModalProps) => {
  // Por defecto: notificaciones desactivadas y sin selecciones
  const [enabled, setEnabled] = useState<boolean>(false);
  const [minDiscount, setMinDiscount] = useState<number>(0);
  const [selectedTypes, setSelectedTypes] = useState<DiscountType[]>([]);
  const [selectedWallets, setSelectedWallets] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<Weekday[]>([]);
  const [walletsData, setWalletsData] = useState<Array<{ _id?: string; id?: string; name?: string; descripcion?: string }>>([]);

  const ensureSubset = useCallback((arr: string[]) => arr.filter((id) => availableWallets.includes(id)), [availableWallets]);

  // 
  useEffect(() => {
    if (!isOpen) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
      const parsed = JSON.parse(raw) as NotificationsPrefs;
      // respetar lo guardado (si no existe, dejar en false / vacío)
      const parsedEnabled = parsed.enabled ?? false;
      setEnabled(parsedEnabled);
      setMinDiscount(parsed.minDiscount ?? 0);
      // Solo preseleccionar tipos, wallets y días si las notificaciones estaban activas
      setSelectedTypes(parsedEnabled && parsed.types && parsed.types.length ? parsed.types : []);
      setSelectedWallets(parsedEnabled ? ensureSubset(parsed.wallets || []) : []);
      setSelectedDays(parsedEnabled && (parsed as NotificationsPrefs).days && (parsed as NotificationsPrefs).days!.length ? (parsed as NotificationsPrefs).days as Weekday[] : []);
        } else {
          // Por defecto: deshabilitado y sin selecciones
          setEnabled(false);
          setMinDiscount(0);
          setSelectedTypes([]);
          setSelectedWallets([]);
          setSelectedDays([]);
        }
    } catch {
      // En caso de error al parsear, dejar en valores por defecto (desactivado y vacío)
      setEnabled(false);
      setMinDiscount(0);
      setSelectedTypes([]);
      setSelectedWallets([]);
      setSelectedDays([]);
    }
  }, [isOpen, availableWallets, ensureSubset]);

  // Fetch wallet metadata (name, description) so we can show names and images instead of raw ids
  useEffect(() => {
    let mounted = true;
    const fetchWallets = async () => {
      try {
        const res = await getWallets();
        const data = res.data?.data || res.data || [];
        if (mounted) setWalletsData(data);
      } catch (err) {
        console.error("NotificationsModal: failed to load wallets", err);
      }
    };
    if (isOpen) fetchWallets();
    return () => { mounted = false; };
  }, [isOpen]);

  // If the available wallets change while open, enforce subset
  useEffect(() => {
    setSelectedWallets((prev) => ensureSubset(prev));
  }, [availableWallets, ensureSubset]);

  const handleToggleType = (id: DiscountType) => {
    setSelectedTypes((prev) => {
      if (id === "all") return ["all"]; // selecting all resets others
      const has = prev.includes(id);
      const next = has ? prev.filter((t) => t !== id) : [...prev.filter((t) => t !== "all"), id];
      return next.length ? next : ["all"]; // never empty
    });
  };

  const handleToggleWallet = (id: string) => {
    if (!availableWallets.includes(id)) return;
    setSelectedWallets((prev) => (prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]));
  };

  const handleToggleDay = (d: Weekday) => {
    setSelectedDays((prev) => (prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]));
  };

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const formattedWallets = useMemo(() => {
    return availableWallets.map((id) => {
      // find metadata from walletsData
      const w = walletsData.find((x) => String(x._id) === String(id) || String(x.id) === String(id));
      return {
        id,
        name: w?.name || id,
        descripcion: w?.descripcion || undefined,
      };
    });
  }, [availableWallets, walletsData]);

  const handleSave = () => {
    const prefs: NotificationsPrefs = {
      enabled,
      minDiscount,
      types: selectedTypes,
      // Guardar exactamente lo seleccionado (si está vacío, guardar vacío)
      wallets: ensureSubset(selectedWallets),
      days: selectedDays,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    if (onSave) onSave(prefs);
    if (onClose) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open && onClose) onClose(); }}>
      <DialogContent className="max-w-xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl">Notificaciones</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Enable/Disable notifications toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">Recibir notificaciones</span>
              <span className="text-xs text-muted-foreground">
                {enabled ? "Recibirás alertas de nuevos beneficios" : "No recibirás notificaciones"}
              </span>
            </div>
            <Switch
              checked={enabled}
              onCheckedChange={setEnabled}
              aria-label="Activar o desactivar notificaciones"
            />
          </div>

          {/* Min discount range */}
          <div className={!enabled ? "opacity-50 pointer-events-none" : ""}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Mínimo descuento (%)</span>
              <span className="text-sm font-medium">{minDiscount}%</span>
            </div>
            <Slider
              value={[minDiscount]}
              min={0}
              max={100}
              step={1}
              onValueChange={(v) => setMinDiscount(v[0] ?? 0)}
            />
          </div>

          {/* Benefit types */}
          <div className={!enabled ? "opacity-50 pointer-events-none" : ""}>
            <div className="mb-2 text-sm text-muted-foreground">Tipo de beneficio</div>
            <div className="grid grid-cols-2 gap-2">
              {DISCOUNT_TYPES.map((t) => (
                <label key={t.id} className="flex items-center gap-2 p-2 rounded-md border border-border">
                  <Checkbox
                    checked={selectedTypes.includes(t.id)}
                    onCheckedChange={() => handleToggleType(t.id)}
                  />
                  <span className="text-sm">{t.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Días de la semana (estilo WeeklyCalendar) */}
          <div className={!enabled ? "opacity-50 pointer-events-none" : ""}>
            <div className="mb-2 text-sm text-muted-foreground">Días de la semana</div>

            {/* Desktop: grid 7 columnas */}
            <div className="hidden md:grid md:grid-cols-7 gap-2">
              {WEEK_DAYS.map((d) => {
                const isSelected = selectedDays.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handleToggleDay(d)}
                    className={`flex flex-col items-center p-3 h-auto ${
                      isSelected
                        ? "bg-gradient-primary text-primary-foreground shadow-lg"
                        : "hover:bg-secondary"
                    } rounded-md border border-border`}
                  >
                    <span className="text-base font-medium">{d}</span>
                  </button>
                );
              })}
            </div>

            {/* Mobile: carrusel horizontal con flechas */}
            <div className="md:hidden relative">
              <button
                onClick={() => {
                  if (scrollRef.current) scrollRef.current.scrollBy({ left: -120, behavior: 'smooth' });
                }}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-background transition-colors"
                aria-label="Scroll izquierda"
              >
                <ChevronLeft className="w-5 h-5 text-primary" />
              </button>

              <div
                ref={scrollRef}
                className="flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory px-8"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {WEEK_DAYS.map((d) => {
                  const isSelected = selectedDays.includes(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => handleToggleDay(d)}
                      className={`flex flex-col items-center p-3 min-w-[90px] h-auto snap-center shrink-0 ${
                        isSelected
                          ? "bg-gradient-primary text-primary-foreground shadow-lg"
                          : "hover:bg-secondary"
                      } rounded-md border border-border`}
                    >
                      <span className="text-sm font-medium">{d}</span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  if (scrollRef.current) scrollRef.current.scrollBy({ left: 120, behavior: 'smooth' });
                }}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-background transition-colors"
                aria-label="Scroll derecha"
              >
                <ChevronRight className="w-5 h-5 text-primary" />
              </button>

              <style>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
              `}</style>
            </div>
          </div>

          {/* Wallets multi-select */}
          <div className={!enabled ? "opacity-50 pointer-events-none" : ""}>
            <div className="mb-2 text-sm text-muted-foreground">Billeteras</div>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {formattedWallets.map((w) => (
                <label key={w.id} className="flex items-center gap-2 p-2 rounded-md border border-border">
                  <Checkbox
                    checked={selectedWallets.includes(w.id)}
                    onCheckedChange={() => handleToggleWallet(w.id)}
                  />
                  <div className="flex items-center gap-2">
                    <WalletImage walletName={w.name} size="sm" />
                    <span className="text-sm">{w.name}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleSave}>Guardar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationsModal;

