import { orm } from "../shared/db/orm.js";
import { Wallet } from "../wallet/wallet.entity.js";

// Nombres obtenidos de las imágenes (solo nombres)
const WALLET_NAMES = [
  "Banco Galicia",
  "Mercado Pago",
  "Banco Nación",
  "Banco Provincia",
  "Banco Santander",
  "Banco Hipotecario",
  "BBVA",
  "Modo",
  "Personal Pay",
  "Naranja X",
  "Prex",
  "Brubank",
];

// Si querés excluir nombres, añadelos aquí. Mantengo la exclusión previa.
const EXCLUDE_NAMES = new Set(["Banco Santander", "Mercado Pago", "Brubank", "Banco Galicia", "Naranja X"]);

function generateInterest(name: string): number {
  // Generador determinístico y reproducible: convierte el nombre en un número entre 5.0 y 20.9
  let s = 0;
  for (let i = 0; i < name.length; i++) s += name.charCodeAt(i);
  const whole = (s % 16) + 5; // 5..20
  const frac = (s % 10) / 10; // .0 .. .9
  return parseFloat((whole + frac).toFixed(1));
}

function generateDescription(name: string): string {
  return `Billetera ${name} — beneficios y descuentos exclusivos`;
}

async function seedWallets() {
  try {
    console.log("Seeding wallets (name, descripcion, interes_anual)...");

    for (const name of WALLET_NAMES) {
      if (EXCLUDE_NAMES.has(name)) {
        console.log(`Excluded: ${name}`);
        continue;
      }

      const existing = await orm.em.findOne(Wallet, { name });
      if (existing) {
        console.log(`Already exists, skipping: ${name}`);
        continue;
      }

      const w = new Wallet();
      w.name = name;
      w.descripcion = generateDescription(name);
      w.interes_anual = generateInterest(name);

      await orm.em.persistAndFlush(w);
      console.log(`Created wallet: ${name} (interes_anual=${w.interes_anual})`);
    }

    console.log("Seed completed.");
  } catch (err) {
    console.error("Error while seeding wallets:", err);
  } finally {
    try { await orm.close(true); } catch (e) { /* ignore */ }
    process.exit(0);
  }
}

seedWallets();
