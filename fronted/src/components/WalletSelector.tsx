import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Wallet, CreditCard, Smartphone } from "lucide-react";
import { getWallets } from "../api/wallets";

interface Wallet {
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
  let icon = <Wallet className="w-8 h-8" />;
  if (nameLower.includes('banco') || nameLower.includes('galicia') || nameLower.includes('brubank')) {
    icon = <CreditCard className="w-8 h-8" />;
  } else if (nameLower.includes('pago') || nameLower.includes('modo')) {
    icon = <Smartphone className="w-8 h-8" />;
  } else if (nameLower.includes('uala') || nameLower.includes('ualá')) {
    icon = <CreditCard className="w-8 h-8" />;
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

const WalletSelector = ({ onSelectWallet }: { onSelectWallet: (walletId: string) => void }) => {
  const [selectedWallet, setSelectedWallet] = useState<string>("");
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const response = await getWallets();
        setWallets(response.data.data || response.data || []);
        setLoading(false);
      } catch (err) {
        console.error("Error al cargar wallets:", err);
        setError("No se pudieron cargar las billeteras");
        setLoading(false);
      }
    };
    fetchWallets();
  }, []);

  const handleWalletSelect = (walletId: string) => {
    setSelectedWallet(walletId);
  };

  const handleContinue = () => {
    if (selectedWallet) {
      onSelectWallet(selectedWallet);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Cargando billeteras...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-gradient-primary rounded-full flex items-center justify-center animate-glow">
            <Wallet className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Selecciona tu Billetera Virtual
          </h1>
          <p className="text-muted-foreground">
            Elige tu billetera virtual favorita para ver todos los beneficios disponibles
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {wallets.map((wallet) => {
            const walletId = wallet._id || wallet.id || "";
            return (
              <Card
                key={walletId}
                className={`p-6 cursor-pointer transition-all hover:scale-105 border-2 ${
                  selectedWallet === walletId
                    ? "border-primary bg-gradient-secondary shadow-lg animate-glow"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => handleWalletSelect(walletId)}
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className={`p-3 rounded-full bg-gradient-to-r ${getWalletStyle(wallet.name).color}`}>
                    <div className="text-white">
                      {getWalletStyle(wallet.name).icon}
                    </div>
                  </div>
                  <span className="font-semibold text-card-foreground text-center">
                    {wallet.name}
                  </span>
                  {wallet.interes_anual && (
                    <span className="text-xs text-muted-foreground">
                      {wallet.interes_anual}% anual
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        <Button
          onClick={handleContinue}
          disabled={!selectedWallet}
          className="w-full py-6 bg-gradient-primary hover:opacity-90 text-lg font-semibold group"
          size="lg"
        >
          Continuar
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
};

export default WalletSelector;