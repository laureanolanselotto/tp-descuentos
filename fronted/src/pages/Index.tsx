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
import { updatePersonaWallets } from "@/api/personas";
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
  const { persona, isAuthenticated, logout, loading } = usePersonaAuth();
  const [selectedWallets, setSelectedWallets] = useState<string[]>([]);
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDiscountType, setSelectedDiscountType] = useState<string>("all");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedBenefit, setSelectedBenefit] = useState<BenefitDetailData | null>(null);
  const [walletFilter, setWalletFilter] = useState<string | null>(null);
  const [personaRecord, setPersonaRecord] = useState<PersonaData | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

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
      // Esperar a que termine de cargar el contexto
      if (loading) {
        return;
      }

      // Si no está autenticado, terminar inicialización
      if (!isAuthenticated) {
        setPersonaRecord(null);
        setSelectedWallets([]);
        setShowModal(false);
        setIsInitializing(false);
        return;
      }

      // Verificar que tenemos una persona válida
      if (!persona) {
        return;
      }

      const personaData = (persona ?? null) as PersonaData | null;
      
      // Con el backend actualizado, el contexto ya trae los datos completos
      console.log("Datos de persona desde contexto:", personaData);
      
      setPersonaRecord(personaData);

      // Buscar wallets en la estructura correcta
      // Puede venir como personaData.wallets o personaData.wallet (por si acaso)
      const walletsArray = personaData?.wallets || (personaData as any)?.wallet || [];
      
      const rawWallets = Array.isArray(walletsArray)
        ? walletsArray
        : [];

      console.log("📦 Raw wallets encontradas:", rawWallets);

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

      // Si tiene wallets, cargarlas y NO mostrar modal
      if (normalizedWallets.length > 0) {
        console.log("✅ Usuario con", normalizedWallets.length, "wallets existentes:", normalizedWallets);
        setSelectedWallets(normalizedWallets);
        setShowModal(false);
      } else {
        // Si NO tiene wallets (primera vez), mostrar modal para seleccionar
        console.log("ℹ️ Usuario sin wallets, mostrando modal de selección");
        setSelectedWallets([]);
        setShowModal(true);
      }
      
      // Finalizar inicialización
      setIsInitializing(false);
    };

    hydrateWalletsFromBackend();
  }, [persona, isAuthenticated, loading]);

  // Mientras se redirige o está cargando, mostrar pantalla de carga
  if (loading || !isAuthenticated) {
    return null;
  }

  // Mostrar loading mientras inicializamos los datos del usuario
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Cargando tus datos...</p>
        </div>
      </div>
    );
  }

  const handleWalletsSelect = async (walletIds: string[]) => {
    const normalizedIds = walletIds.map((id) => normalizeWalletId(id));
    setSelectedWallets(normalizedIds);
    setShowModal(false);

    // Guardar las wallets seleccionadas en el backend
    const personaData = (persona ?? null) as PersonaData | null;
    const personaId = personaData?._id ?? personaData?.id ?? personaData?.data?.id;
    
    if (personaId && normalizedIds.length > 0) {
      try {
        await updatePersonaWallets(personaId, normalizedIds);
        console.log("Wallets guardadas en el backend:", normalizedIds);
      } catch (error) {
        console.error("Error al guardar wallets:", error);
      }
    }
  };

  const handleUpdateSelectedWallets = async (walletIds: string[]) => {
    console.log("Actualizando wallets seleccionadas:", walletIds);
    setSelectedWallets(walletIds);
    
    // No necesitamos actualizar en el backend aquí porque WalletSelectorCrud ya lo hace
    // Solo actualizamos el estado local
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

  // Mostrar selección de billeteras SOLO si es primera vez (no tiene wallets)
  if (showModal) {
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
        selectedWallet={selectedWallets[0]}
        selectedWallets={selectedWallets}
        onUpdateSelectedWallets={handleUpdateSelectedWallets}
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
            Encuentra las mejores ofertas y descuentos disponibles para tus billeteras virtuales
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
