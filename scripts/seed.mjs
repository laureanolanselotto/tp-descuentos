import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { MongoClient } from "mongodb";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const connectionString = process.env.MONGO_URI ?? "mongodb://127.0.0.1:27017/?retryWrites=true&w=majority";
const dbName = process.env.MONGO_DB ?? "tp-desuentos";
const dryRun = process.argv.includes("--dry-run");

function stripComments(source) {
  return source
    .replace(/\/\/.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");
}

async function extractArrayLiteral(filePath, options = {}) {
  const { variableName, transform, context = {} } = options;
  const source = await readFile(filePath, "utf8");
  const marker = variableName ? `const ${variableName}` : "[";
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) {
    throw new Error(`No se encontro ${variableName ?? "el arreglo"} en ${filePath}`);
  }

  const equalsIndex = source.indexOf("=", markerIndex);
  if (equalsIndex === -1) {
    throw new Error(`No se encontro el signo = para ${variableName ?? "el arreglo"} en ${filePath}`);
  }

  const arrayStart = source.indexOf("[", equalsIndex);
  if (arrayStart === -1) {
    throw new Error(`No se encontro el inicio del arreglo en ${filePath}`);
  }

  let depth = 0;
  let index = arrayStart;

  while (index < source.length) {
    const char = source[index];
    if (char === "[") {
      depth += 1;
    } else if (char === "]") {
      depth -= 1;
      if (depth === 0) {
        index += 1;
        break;
      }
    }
    index += 1;
  }

  if (depth !== 0) {
    throw new Error(`No se encontro el cierre del arreglo en ${filePath}`);
  }

  let literal = source.slice(arrayStart, index);
  literal = stripComments(literal);
  if (transform) {
    literal = transform(literal);
  }

  const script = `(${literal})`;
  return vm.runInNewContext(script, context);
}

function sanitizeIcons(literal) {
  return literal.replace(/icon:\s*<[\s\S]*?>,?/g, "icon: null,");
}

function toSlug(value, fallback) {
  if (!value) {
    return fallback;
  }
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || fallback;
}

function normalizeWallets(rawWallets) {
  const walletIdMap = new Map();
  const wallets = rawWallets.map((wallet, index) => {
    const baseSlug = toSlug(wallet.id ?? wallet.name, `wallet-${index + 1}`);
    const uuid = crypto.randomUUID();
    walletIdMap.set(wallet.id ?? baseSlug, uuid);
    walletIdMap.set(baseSlug, uuid);

    const { name, image = null, interes = null, color = null } = wallet;
    return {
      id: uuid,
      slug: baseSlug,
      nombre: name,
      icono: image,
      interes,
      color,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  return { wallets, walletIdMap };
}

function normalizeBenefits(rawBenefits, walletIdMap) {
  const seen = new Map();
  return rawBenefits.map((benefit, index) => {
    const baseSlug = toSlug(benefit.id ?? benefit.name, `beneficio-${index + 1}`);
    const count = seen.get(baseSlug) ?? 0;
    seen.set(baseSlug, count + 1);
    const uniqueId = count === 0 ? baseSlug : `${baseSlug}-${count + 1}`;

    const walletKey = benefit.walletId ?? null;
    const walletUuid = walletKey ? walletIdMap.get(walletKey) ?? walletKey : null;

    return {
      id: uniqueId,
      slug: baseSlug,
      name: benefit.name,
      porcentaje: benefit.discount,
      descripcion: benefit.category ?? "",
      fechaInicio: benefit.fecha_desde ?? null,
      fechaFin: benefit.fecha_hasta ?? null,
      mentodoPago: walletUuid ? [walletUuid] : [],
      tipoDescuento: benefit.discountType ?? "Sin especificar",
      walletId: walletUuid,
      walletSlug: walletKey,
      category: benefit.category ?? null,
      availableDays: benefit.availableDays ?? [],
      tope_reintegro: benefit.tope_reintegro ?? null,
      limit: benefit.limit ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });
}

async function main() {
  const walletsFile = path.join(projectRoot, "fronted", "src", "components", "data", "wallets.tsx");
  const benefitsFile = path.join(projectRoot, "fronted", "src", "components", "BenefitsGrid.tsx");

  const rawWallets = await extractArrayLiteral(walletsFile, {
    variableName: "wallets",
    transform: sanitizeIcons,
    context: {
      walletImage: (file) => `wallets/iconos-billeteras/${file}`,
    },
  });
  const walletData = rawWallets.map(({ icon, ...rest }) => rest);
  const { wallets, walletIdMap } = normalizeWallets(walletData);

  const rawBenefits = await extractArrayLiteral(benefitsFile, {
    variableName: "benefits",
    transform: sanitizeIcons,
  });
  const benefitData = rawBenefits.map(({ icon, ...rest }) => rest);
  const benefits = normalizeBenefits(benefitData, walletIdMap);

  if (dryRun) {
    console.log(`[DRY RUN] Wallets preparadas: ${wallets.length}`);
    console.log(`[DRY RUN] Beneficios preparados: ${benefits.length}`);
    if (wallets.length > 0) {
      console.log(`[DRY RUN] Primera wallet UUID: ${wallets[0].id}`);
    }
    if (benefits.length > 0) {
      console.log(`[DRY RUN] Ejemplo beneficio: ${benefits[0].name}`);
    }
    return;
  }

  const client = new MongoClient(connectionString);
  try {
    await client.connect();
    const database = client.db(dbName);
    const walletsCollection = database.collection("wallets");
    const benefitsCollection = database.collection("beneficios");

    await walletsCollection.deleteMany({});
    if (wallets.length > 0) {
      await walletsCollection.insertMany(wallets);
    }

    await benefitsCollection.deleteMany({});
    if (benefits.length > 0) {
      await benefitsCollection.insertMany(benefits);
    }

    console.log(`Seed completado. Wallets insertadas: ${wallets.length}. Beneficios insertados: ${benefits.length}.`);
  } catch (error) {
    console.error("Error al ejecutar el seed:", error);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

main();
