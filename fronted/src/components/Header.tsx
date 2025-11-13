import { useState, useEffect } from "react";
import { Button  } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "./ui/alert-dialog.tsx";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Settings  } from "lucide-react";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";
import WalletSelectorCrud from "@/components/WalletSelectorCrud";
import AccountModal from "@/components/AccountModal";
import NotificationsModal from "@/components/NotificationsModal";
import { usePersonaAuth } from "../context/personaContext";
import { useNavigate } from "react-router-dom";
// icon imports removed (not used here)
import type { PersonaData } from "../api/personas";
import { getPersonaByEmail, eliminarPersona } from "@/api/personas";
function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <Switch
      checked={theme === "dark"}
      onCheckedChange={checked => setTheme(checked ? "dark" : "light")}
      aria-label="Alternar modo oscuro"
    />
  );
}

interface HeaderProps {
  userName?: string;
  selectedWallet: string | undefined;
  selectedWallets: string[];
  onUpdateSelectedWallets: (ids: string[]) => void;
  onBackToWalletSelection: () => void;
  onLogout: () => void;
}

const Header = ({ selectedWallets, onUpdateSelectedWallets, onBackToWalletSelection, onLogout }: HeaderProps) => {
  const { logout, persona, isAdmin } = usePersonaAuth(); // ⭐ Importar isAdmin
  const navigate = useNavigate();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  // Alert dialog open state (true/false) requested
  const [alertOpen, setAlertOpen] = useState(false);
  const [personaExists, setPersonaExists] = useState(false);
  const [personaId, setPersonaId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // useStatus: buscar a la persona si existe (por email) y guardar su id
  useEffect(() => {
    let mounted = true;
    const checkPersona = async () => {
      const personaEmail = (persona as unknown as { email?: string })?.email;
      if (!personaEmail) {
        if (mounted) {
          setPersonaExists(false);
          setPersonaId(null);
        }
        return;
      }
      try {
        const p = await getPersonaByEmail(personaEmail);
        if (!mounted) return;
        if (p) {
          const pid = (p as PersonaData)._id ?? (p as PersonaData).id ?? null;
          setPersonaExists(true);
          setPersonaId(pid ?? null);
        } else {
          setPersonaExists(false);
          setPersonaId(null);
        }
      } catch (err) {
        console.error("Error checking persona status:", err);
        if (mounted) {
          setPersonaExists(false);
          setPersonaId(null);
        }
      }
    };
    checkPersona();
    return () => { mounted = false; };
  }, [persona]);
  return (
    <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Descubre tus Beneficios
            </h1>
          </div>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="secondary" size="sm" className="p-2">
              <Settings className="w-4 h-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Configuraciones</SheetTitle>
            </SheetHeader>
            <div className="mt-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Modo oscuro</span>
                <ThemeToggle />
              </div>
              <Button variant="secondary" className="w-full" onClick={() => setShowWalletModal(true)}>
                Billeteras
              </Button>
              <Button variant="secondary" className="w-full" onClick={() => setShowNotificationsModal(true)}>
                Notificaciones
              </Button>
              <Button variant="secondary" className="w-full" onClick={() => setShowAccountModal(true)}>
                Cuenta
              </Button>
              
              {/* Botón Admin - Solo visible para administradores */}
              {isAdmin && (
                <Button variant="default" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" 
                onClick={() => navigate("/admin")}>
                  Configuraciones Admin
                </Button>
              )}
              
              <Button variant="destructive" className="w-full mt-2" onClick={logout}>Cerrar sesión</Button>

              {/* pregunta antes de hacer cagada y si reponde que si se elimina la cuenta*/}
              <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="flex flex-col justify-end" onClick={() => setAlertOpen(true)} disabled={!personaExists}>
                    Eliminar cuenta
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Eliminar cuenta</AlertDialogTitle>
                    <AlertDialogDescription>
                      ¿Estás seguro? Esta acción es irreversible y eliminará todos tus datos asociados.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="flex gap-2 justify-end pt-4">
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction asChild>
                      <Button
                        variant="destructive"
                        onClick={async () => {
                          if (!personaId) return;
                          try {
                            setDeleting(true);
                            await eliminarPersona(personaId);
                            // luego de eliminar, hacer logout y cerrar dialog
                            console.log("Persona eliminada correctamente", personaId);
                            setDeleting(false);
                            setAlertOpen(false);
                            logout();
                          } catch (err) {
                            console.error("Error eliminando persona:", err);
                            setDeleting(false);
                          }
                        }}
                        disabled={deleting}
                      >
                        {deleting ? "Eliminando..." : "Eliminar"}
                      </Button>
                    </AlertDialogAction>
                  </div>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </SheetContent>
        </Sheet>
  {/* Modal de billeteras */}
  <WalletSelectorCrud isOpen={showWalletModal} selectedWallets={selectedWallets} onSelectWallets={(ids) => { onUpdateSelectedWallets(ids); setShowWalletModal(false); }} onClose={() => setShowWalletModal(false)} />
  {/* Modal de cuenta */}
  <AccountModal isOpen={showAccountModal} onClose={() => setShowAccountModal(false)} />
  {/* Modal de notificaciones */}
  <NotificationsModal isOpen={showNotificationsModal} availableWallets={selectedWallets} onClose={() => setShowNotificationsModal(false)} />
      </div>
    </div>
  );
};

export default Header;

// export default Header;
