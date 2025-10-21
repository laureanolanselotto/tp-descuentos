import { useState, useEffect } from "react";
import type { ComponentProps } from "react";
import { useNavigate } from "react-router-dom";
import WalletSelectionModal from "@/components/WalletSelectionModal";
import Header from "@/components/Header";
import CategoryFilter from "@/components/CategoryFilter";
import BenefitsGrid from "@/components/BenefitsGrid";
import BenefitDetail from "@/components/BenefitDetail";
import WeeklyCalendar from "@/components/WeeklyCalendar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import InterestWalletsList from "@/components/InterestWalletsList";
import { usePersonaAuth } from "@/context/personaContext";
import { getWallets } from "@/api/wallets";
import { getPersonaById, getPersonaByEmail } from "@/api/personas";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import type { PersonaData } from "@/api/personas";

type BenefitDetailData = ComponentProps<typeof BenefitDetail>["benefit"];

type WalletId = string | { $oid: string };

interface WalletData {
  _id: WalletId;
  id?: WalletId;
  name: string;
  descripcion?: string;
  interes_anual?: number;
}

const Index = () => {
  const navigate = useNavigate();
  const { persona, isAuthenticated, logout } = usePersonaAuth();
  const [selectedWallets, setSelectedWallets] = useState<string[]>([]);
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDiscountType, setSelectedDiscountType] = useState<string>("all");
  const [showModal, setShowModal] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedBenefit, setSelectedBenefit] = useState<BenefitDetailData | null>(null);
  const [walletFilter, setWalletFilter] = useState<string | null>(null);
  const [personaRecord, setPersonaRecord] = useState<PersonaData | null>(null);

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

  const getWalletLabel = (walletId: string): string => {
    if (!walletId) return "";
    const wallet = wallets.find(
      (w) => normalizeWalletId(w._id) === walletId || normalizeWalletId(w.id) === walletId
    );
    if (wallet?.name) {
      return wallet.name;
    }
    return walletId;
  };

  // Cargar wallets desde el backend
  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const response = await getWallets();
        const walletsData = response.data.data || response.data || [];
        setWallets(walletsData);
      } catch (err) {
        console.error("Error al cargar wallets:", err);
      }
    };
    fetchWallets();
  }, []);


  useEffect(() => {
    const hydrateWalletsFromBackend = async () => {
      if (!persona) {
        setPersonaRecord(null);
        setSelectedWallets([]);
        setShowModal(true);
        return;
      }

      const personaData = (persona ?? null) as PersonaData | null;
      const personaId = personaData?._id ?? personaData?.id ?? personaData?.data?.id;

      try {
        let personaFromDb: PersonaData | null = null;

        if (personaId) {
          personaFromDb = await getPersonaById(personaId);
        } else if (personaData?.email) {
          personaFromDb = await getPersonaByEmail(personaData.email);
        }

        if (!personaFromDb) {
          console.warn("No se encontró la persona en la base de datos para hidratar wallets");
          return;
        }

        setPersonaRecord(personaFromDb);

        const rawWallets = Array.isArray(personaFromDb.wallets)
          ? (personaFromDb.wallets as NonNullable<PersonaData["wallets"]>)
          : [];

        type PersonaWalletEntry = NonNullable<PersonaData["wallets"]>[number];

        const normalizedWallets = rawWallets.reduce<string[]>((acc, walletEntry) => {
          if (!walletEntry) {
            return acc;
          }

          const appendIfValid = (value: WalletId | undefined) => {
            if (!value) {
              return;
            }
            const normalized = normalizeWalletId(value);
            if (normalized) {
              acc.push(normalized);
            }
          };

          if (typeof walletEntry === "string") {
            appendIfValid(walletEntry);
            return acc;
          }

          const walletObject = walletEntry as Exclude<PersonaWalletEntry, string>;
          const candidate = (walletObject?._id as WalletId | undefined)
            ?? (walletObject?.id as WalletId | undefined)
            ?? (walletObject?.walletId as WalletId | undefined);

          appendIfValid(candidate);

          return acc;
        }, []);

        if (normalizedWallets.length > 0) {
          setSelectedWallets(normalizedWallets);
          setShowModal(false);
          return;
        }

        setSelectedWallets([]);
        setShowModal(true);
      } catch (error) {
        console.error("Error al obtener la persona desde la base de datos:", error);
      }
    };

    hydrateWalletsFromBackend();
  }, [persona]);

  // Mientras se redirige, no renderizar nada
  if (!isAuthenticated) {
    return null;
  }

  const handleWalletsSelect = (walletIds: string[]) => {
    const normalizedIds = walletIds.map((id) => normalizeWalletId(id));
    setSelectedWallets(normalizedIds);
    setShowModal(false);
  };

  const handleBackToWalletSelection = () => {
    setSelectedWallets([]);
    setSelectedCategory("all");
    setShowModal(true);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleDiscountTypeSelect = (discountType: string) => {
    setSelectedDiscountType(discountType);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  // Mostrar selección de billeteras si no se han seleccionado aún
  if (showModal || selectedWallets.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Beneficios de Billeteras Virtuales
          </h1>
          <p className="text-muted-foreground text-lg">
            Descubre las mejores ofertas y descuentos disponibles
          </p>
        </div>
        <WalletSelectionModal 
          isOpen={showModal}
          onSelectWallets={handleWalletsSelect}
        />
      </div>
    );
  }

  if (selectedBenefit) {
    return <BenefitDetail benefit={selectedBenefit} onBack={() => setSelectedBenefit(null)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        userName={personaRecord?.name || persona?.name || "Usuario"}
        selectedWallet={selectedWallets['']}
        selectedWallets={selectedWallets}
        onUpdateSelectedWallets={setSelectedWallets}
        onBackToWalletSelection={handleBackToWalletSelection}
        onLogout={logout}
      />
      <div className="max-w-7xl mx-auto p-6 space-y-8">

        <div className="text-center space-y-4">
          {/* Espacio para imagen rectangular */}
          <div className="flex justify-center mb-4">
            <div className="w-[800px] h-[300px] bg-muted rounded-xl overflow-hidden flex items-center justify-center">
              {/* Aquí puedes colocar tu imagen: <img src="/ruta/imagen.jpg" alt="Banner" className="w-full h-full object-cover rounded-xl" /> */}
              <img
                src={`${import.meta.env.BASE_URL}public/git/Tito_Calder_n_Bailando.gif`}
                alt="Banner"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
          </div>
          <h1 className="max-w-7xl mx-auto p-6 space-y-8 text-2xl font-bold">
            Encuentra las mejores ofertas y descuentos disponibles con tus billeteras virtuales
          </h1>
          <div className="flex justify-center items-center gap-4 mb-4">
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground font-medium shadow hover:bg-primary hover:text-primary-foreground transition">
                    {walletFilter ? getWalletLabel(walletFilter) : "Filtrar billetera"}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Filtrar por billetera</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setWalletFilter(null)}>
                    Todas
                  </DropdownMenuItem>
                  {selectedWallets.map((walletId) => (
                    <DropdownMenuItem key={walletId} onClick={() => setWalletFilter(walletId)}>
                      {getWalletLabel(walletId)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedWallets.map((walletId) => (
                <span
                  key={walletId}
                  className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm font-medium"
                >
                  {getWalletLabel(walletId)}
                </span>
              ))}
            </div>
          </div>
        </div>

        <Tabs defaultValue="beneficio" className="mb-6">
          <TabsList className="mb-8 flex justify-center">
            <TabsTrigger value="beneficio">Beneficio</TabsTrigger>
            <TabsTrigger value="interes">Interés</TabsTrigger>
          </TabsList>
          <TabsContent value="beneficio">
            <div className="flex flex-col gap-8">
              <WeeklyCalendar 
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
              />
              <CategoryFilter 
                selectedCategory={selectedCategory}
                onCategorySelect={handleCategorySelect}
                selectedDiscountType={selectedDiscountType}
                onDiscountTypeSelect={handleDiscountTypeSelect}
              />
              <BenefitsGrid 
                selectedWallets={walletFilter ? [walletFilter] : selectedWallets}
                selectedCategory={selectedCategory}
                selectedDiscountType={selectedDiscountType}
                selectedDate={selectedDate}
                onBenefitClick={(benefit) =>
                  setSelectedBenefit({
                    ...benefit,
                    discountType: benefit.discountType ?? "",
                  })
                }
              />
            </div>
          </TabsContent>
          <TabsContent value="interes">
            <InterestWalletsList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};


export default Index;
