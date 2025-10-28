import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ArrowRight, Wallet as WalletIcon, Check } from "lucide-react";
import { getWallets } from "../api/wallets";
import { updatePersonaWallets } from "../api/personas";
import { usePersonaAuth } from "@/context/personaContext";
import { WalletImage } from './WalletImage';
import ConfirmAlert from "./ConfirmAlert";
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
  selectedWallets?: string[];
}

const WalletSelectorCrud = ({ isOpen, onSelectWallets, onClose, selectedWallets: initialSelectedWallets = [] }: WalletSelectionModalProps) => {
  const { persona } = usePersonaAuth();
  const [selectedWallets, setSelectedWallets] = useState<string[]>([]);
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingRemove, setPendingRemove] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const personaData = (persona || null) as unknown as PersonaData | null;
  const personaId = personaData?._id ?? personaData?.id ?? personaData?.data?.id;

  useEffect(() => {
    setSelectedWallets(initialSelectedWallets || []);
  }, [initialSelectedWallets]);

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const response = await getWallets();
        setWallets(response.data.data || response.data || []);
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
        // request confirmation before removing
        setPendingRemove(walletId);
        setConfirmOpen(true);
        return prev;
      } else {
        return [...prev, walletId];
      }
    });
  };

  const confirmRemove = () => {
    if (!pendingRemove) return;
    const next = selectedWallets.filter(id => id !== pendingRemove);
    setSelectedWallets(next);
    setPendingRemove(null);
    setConfirmOpen(false);
  };

  const cancelRemove = () => {
    setPendingRemove(null);
    setConfirmOpen(false);
  };

  const handleContinue = async () => {
    if (!personaId) {
      console.error("No se pudo determinar el ID de la persona autenticada");
      return;
    }

    setUpdating(true);
    try {
      console.log("WalletSelectorCrud -> updatePersonaWallets payload", {
        personaId,
        walletIds: selectedWallets,
      });
      const response = await updatePersonaWallets(personaId, selectedWallets);
      console.log("WalletSelectorCrud -> updatePersonaWallets response", response?.data ?? response);
      onSelectWallets(selectedWallets);
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Error al actualizar las billeteras seleccionadas:", error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open && onClose) { onClose(); } }}>
      <DialogContent className="max-w-2xl bg-card border-border">
        <DialogHeader>
          <div className="flex flex-col items-center space-y-4 py-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center animate">
              <WalletIcon className="w-8 h-8 text-primary-foreground" />
            </div>
            <DialogTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent text-center">
              Tus Billeteras Virtuales
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
          <div className="flex flex-col gap-2 max-h-80 overflow-y-auto p-2">
            {wallets.map((wallet) => {
              const walletId = wallet._id || wallet.id || "";
              return (
                <div
                  key={walletId}
                  className={`flex items-center justify-between gap-2 p-3 rounded-lg border cursor-pointer transition-all hover:scale-[1.01] ${
                    selectedWallets.includes(walletId)
                      ? "border-primary bg-gradient-secondary shadow animate-glow"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => handleWalletToggle(walletId)}
                >
                  <WalletImage 
                    walletName={wallet.name}
                    size="sm"
                    fallbackIcon={<WalletIcon className="w-6 h-6 text-primary" />}
                  />
                  <div className="flex-1 flex flex-col items-center">
                    <span className="font-medium text-card-foreground text-base">
                      {wallet.name}
                    </span>
                  </div>
                  <span className="flex items-center justify-center w-8">
                    {selectedWallets.includes(walletId) && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </span>
                </div>
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
            disabled={selectedWallets.length === 0 || updating}
            className="w-full py-6 bg-gradient-primary hover:opacity-90 text-lg font-semibold group"
            size="lg"
          >
            Continuar
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
        <ConfirmAlert
          show={confirmOpen}
          title="¿Eliminar billetera?"
          message="Estás por eliminar una billetera seleccionada. ¿Seguro que querés continuar?"
          onConfirm={confirmRemove}
          onClose={cancelRemove}
        />
      </DialogContent>
    </Dialog>
  );
};

export default WalletSelectorCrud;
