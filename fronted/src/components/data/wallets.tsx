import React from "react";
import { Wallet as WalletIcon, CreditCard, Smartphone } from "lucide-react";

// Las imágenes viven en fronted/src/public y se sirven en producción bajo /app/wallets/...
export const wallets = [
  { id: "mercadopago", name: "Mercado Pago", icon: <WalletIcon className="w-6 h-6" />, image: "/app/wallets/iconos-billeteras/mercado-pago.svg", color: "from-black-500 to-black-500", interes: 45.2 },
  { id: "banco galicia", name: "Banco Galicia", icon: <CreditCard className="w-6 h-6" />, image: "/app/wallets/iconos-billeteras/banco-galicia.svg", color: "from-red-500 to-red-600", interes: 38.5 },
  { id: "pagofacil", name: "Pago Fácil", icon: <Smartphone className="w-6 h-6" />, color: "from-green-500 to-green-600", interes: 41.0 },
  { id: "uala", name: "Ualá", icon: <CreditCard className="w-6 h-6" />, color: "from-purple-500 to-purple-600", interes: 47.8 },
  { id: "cuenta-dni", name: "Cuenta DNI", icon: <WalletIcon className="w-6 h-6" />, image: "/app/wallets/iconos-billeteras/cuenta-dni.svg", color: "from-orange-500 to-orange-600", interes: 50.0 },
  { id: "brubank", name: "Brubank", icon: <CreditCard className="w-6 h-6" />, color: "from-indigo-500 to-indigo-600", interes: 44.3 },
  { id: "modo", name: "MODO", icon: <Smartphone className="w-6 h-6" />, image: "/app/wallets/iconos-billeteras/modo.svg", color: "from-pink-500 to-pink-600", interes: 39.9 },
  { id: "personal-pay", name: "Personal Pay", icon: <WalletIcon className="w-6 h-6" />, image: "/app/wallets/iconos-billeteras/personal-pay.svg", color: "from-cyan-500 to-cyan-600", interes: 42.7 }
];

export type WalletData = typeof wallets[number];

export default wallets;

