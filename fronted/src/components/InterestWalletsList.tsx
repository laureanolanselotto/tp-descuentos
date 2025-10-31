import { useEffect, useMemo, useState } from "react";
import { getWallets } from "@/api/wallets";
import { WalletImage } from "./WalletImage.tsx";

type WalletId = string | { $oid: string };

interface WalletData {
  _id: WalletId;
  id?: WalletId;
  name: string;
  interes_anual?: number;
  descripcion?: string;
}

const normalizeWalletId = (value: WalletId | undefined): string => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null && "$oid" in value) {
    const oidValue = value as { $oid?: unknown };
    if (typeof oidValue.$oid === "string") {
      return oidValue.$oid;
    }
  }
  return String(value);
};

const InterestWalletsList = () => {
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const response = await getWallets();
        const walletsData = response.data.data || response.data || [];
        setWallets(walletsData);
        console.log("Wallets cargadas e interes", walletsData);
      } catch (err) {
        console.error("Error al cargar wallets:", err);
        setError("No se pudieron cargar las billeteras");
        setLoading(false);
      }
    };

    fetchWallets();
  }, []);

  const sortedWallets = useMemo(() => {// Ordenar las billeteras por interés anual descendente
    return [...wallets].sort(
      (a, b) => (b.interes_anual ?? 0) - (a.interes_anual ?? 0) // se calcula el interés anual, considerando N/D como 0
    );
  }, [wallets]);

  return (
    <div className="flex flex-col gap-4">
      {sortedWallets.map((wallet) => {
        const walletId = normalizeWalletId(wallet._id || wallet.id);
        return (
          <div
            key={walletId}
            className="flex items-center justify-between p-4 rounded-lg bg-muted shadow"
          >
            <div className="flex items-center gap-4">
              <WalletImage walletName={wallet.name} size="sm" />
              <div className="flex flex-col">
                <span className="font-semibold text-lg">{wallet.name}</span>
              </div>
            </div>
            <span className="text-primary font-bold text-xl">
              {wallet.interes_anual !== undefined ? `${wallet.interes_anual}%` : "N/D"}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default InterestWalletsList;
