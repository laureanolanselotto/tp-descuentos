import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowRight, Wallet as WalletIcon, Check, CreditCard, Smartphone } from "lucide-react";
import { getWallets } from "../api/wallets";
import ConfirmAlert from "./ConfirmAlert";

interface WalletData {
  _id: string;
  id?: string;
  name: string;
  descripcion?: string;
  interes_anual?: number;
}

// Helper para asignar colores e íconos según el nombre de la wallet
const getWalletStyle = (name: string) => {
  const nameLower = name.toLowerCase();
  
  // Asignar ícono según tipo
  let icon = <WalletIcon className="w-6 h-6" />;
  if (nameLower.includes('banco') || nameLower.includes('galicia') || nameLower.includes('brubank')) {
    icon = <CreditCard className="w-6 h-6" />;
  } else if (nameLower.includes('pago') || nameLower.includes('modo')) {
    icon = <Smartphone className="w-6 h-6" />;
  } else if (nameLower.includes('uala') || nameLower.includes('ualá')) {
    icon = <CreditCard className="w-6 h-6" />;
  }
  
  // Asignar colores según nombre
  const colorMap: Record<string, string> = {
    'mercado': 'from-blue-500 to-blue-600',
    'galicia': 'from-red-500 to-red-600',
    'pagofacil': 'from-green-500 to-green-600',
    'pago facil': 'from-green-500 to-green-600',
    'uala': 'from-purple-500 to-purple-600',
    'ualá': 'from-purple-500 to-purple-600',
    'cuenta dni': 'from-orange-500 to-orange-600',
    'dni': 'from-orange-500 to-orange-600',
    'brubank': 'from-indigo-500 to-indigo-600',
    'modo': 'from-pink-500 to-pink-600',
    'personal': 'from-cyan-500 to-cyan-600',
  };
  
  let color = 'from-gray-500 to-gray-600'; // default
  for (const [key, value] of Object.entries(colorMap)) {
    if (nameLower.includes(key)) {
      color = value;
      break;
    }
  }
  
  return { icon, color };
};

interface WalletSelectionModalProps {
  isOpen: boolean;
  onSelectWallets: (walletIds: string[]) => void;
  onClose?: () => void;
  selectedWallets?: string[];
}

const WalletSelectorCrud = ({ isOpen, onSelectWallets, onClose, selectedWallets: initialSelectedWallets = [] }: WalletSelectionModalProps) => {
  const [selectedWallets, setSelectedWallets] = useState<string[]>([]);
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingRemove, setPendingRemove] = useState<string | null>(null);

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
  // notify parent with updated selection (do NOT close the parent modal)
  onSelectWallets(next);
  };

  const cancelRemove = () => {
    setPendingRemove(null);
    setConfirmOpen(false);
  };

  const handleContinue = () => {
    if (selectedWallets.length > 0) {
      onSelectWallets(selectedWallets);
    }
    if (onClose) onClose();
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
            <p className="text-muted-foreground text-center">
              Elige una o varias billeteras virtuales para ver todos los beneficios disponibles
            </p>
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
              const { icon, color } = getWalletStyle(wallet.name);
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
                  <div className={`p-2 rounded-full flex items-center justify-center bg-gradient-to-r ${color}`}>
                    <div className="text-white">
                      {icon}
                    </div>
                  </div>
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
            disabled={selectedWallets.length === 0}
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
