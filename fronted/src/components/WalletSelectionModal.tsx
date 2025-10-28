import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ArrowRight, Wallet, Check } from "lucide-react";
import { getWallets } from "../api/wallets";
import { updatePersonaWallets } from "../api/personas";
import { usePersonaAuth } from "@/context/personaContext";
import { WalletImage } from './WalletImage';
import type { PersonaData } from "../api/personas";

interface WalletData {
  _id: string;
  id?: string;
  name: string;
  descripcion?: string;
  interes_anual?: number;
}

interface WalletSelectionModalProps {
  isOpen: boolean;
  onSelectWallets: (walletIds: string[]) => void;
  onClose?: () => void;
}

const WalletSelectionModal = ({ isOpen, onSelectWallets, onClose }: WalletSelectionModalProps) => {
  const [selectedWallets, setSelectedWallets] = useState<string[]>([]);
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { persona } = usePersonaAuth();
  const personaData = (persona || null) as unknown as PersonaData | null;
  const personaId = personaData?._id ?? personaData?.id ?? personaData?.data?.id;
  
  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const response = await getWallets();
        const walletsData = response.data.data || response.data || [];
        setWallets(walletsData);
        setLoading(false);
      } catch (err) {
        console.error("Error al cargar wallets:", err);
        setLoading(false);
      }
    };
    if (isOpen) {
      fetchWallets();
    }
  }, [isOpen]);

  const handleWalletToggle = (walletId: string) => {
    setSelectedWallets(prev => {
      if (prev.includes(walletId)) {
        return prev.filter(id => id !== walletId);
      } else {
        return [...prev, walletId];
      }
    });
  };

  const handleContinue = async () => {
    if (!personaId) {
      console.error("No se pudo determinar el ID de la persona autenticada");
      return;
    }

    if (selectedWallets.length === 0) {
      return;
    }

    setSubmitting(true);
    try {
      console.log("WalletSelectionModal -> updatePersonaWallets payload", {
        personaId,
        walletIds: selectedWallets
      });
      const response = await updatePersonaWallets(personaId, selectedWallets);
      const rawRequestData = response?.config?.data;
      let parsedRequestData: unknown = rawRequestData;
      if (typeof rawRequestData === "string") {
        try {
          parsedRequestData = JSON.parse(rawRequestData);
        } catch {
          parsedRequestData = rawRequestData;
        }
      }
      console.log("WalletSelectionModal -> axios request data", parsedRequestData);
      console.log("WalletSelectionModal -> updatePersonaWallets response", response?.data ?? response);
      onSelectWallets(selectedWallets);
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Error al actualizar las billeteras seleccionadas:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => { if (!open && onClose) onClose(); }}>
      <DialogContent className="max-w-2xl bg-card border-border">
        <DialogHeader>
          <div className="flex flex-col items-center space-y-4 py-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center animate-glow">
              <Wallet className="w-8 h-8 text-primary-foreground" />
            </div>
            <DialogTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent text-center">
              Selecciona tus Billeteras Virtuales
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-center">
              Elige una o varias billeteras virtuales para ver todos los beneficios disponibles
            </DialogDescription>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Cargando billeteras...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto p-2">
            {wallets.map((wallet) => {
              const walletId = wallet._id || wallet.id || "";
              return (
                <Card
                  key={walletId}
                  className={`p-4 cursor-pointer transition-all hover:scale-105 border-2 relative ${
                    selectedWallets.includes(walletId)
                      ? "border-primary bg-gradient-secondary shadow-lg animate-glow"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => handleWalletToggle(walletId)}
                >
                  {selectedWallets.includes(walletId) && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                  <div className="flex flex-col items-center space-y-2">
                    <WalletImage 
                      walletName={wallet.name}
                      size="md"
                      fallbackIcon={<Wallet className="w-6 h-6 text-primary" />}
                    />
                    <span className="font-medium text-card-foreground text-center text-sm">
                      {wallet.name}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        <div className="flex flex-col items-center space-y-4 pt-4">
          <p className="text-sm text-muted-foreground">
            {selectedWallets.length} billetera{selectedWallets.length !== 1 ? 's' : ''} seleccionada{selectedWallets.length !== 1 ? 's' : ''}
          </p>
          <Button
            onClick={handleContinue}
            disabled={selectedWallets.length === 0 || submitting}
            className="w-full py-6 bg-gradient-primary hover:opacity-90 text-lg font-semibold group"
            size="lg"
          >
            Continuar
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WalletSelectionModal;
