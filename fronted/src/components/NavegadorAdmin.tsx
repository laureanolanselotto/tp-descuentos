import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import TablaInfo from "./TablaInfo";
import FormularioCrear, { EntityType } from "./FormularioCrear";

interface NavegadorAdminProps {
  activeTab?: string;
  onTabChange?: (value: string) => void;
}

function NavegadorAdmin({ activeTab = "beneficios", onTabChange }: NavegadorAdminProps) {
  const [currentTab, setCurrentTab] = useState<EntityType>(activeTab as EntityType);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTabChange = (value: string) => {
    setCurrentTab(value as EntityType);
    onTabChange?.(value);
  };

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  const getTabLabel = (tab: EntityType) => {
    const labels: Record<EntityType, string> = {
      beneficios: "Beneficio",
      wallets: "Wallet",
      rubros: "Rubro",
      localidades: "Localidad",
      ciudades: "Ciudad",
      roles: "Rol"
    };
    return labels[tab];
  };

  return (
    <>
      <Tabs 
        defaultValue={activeTab} 
        className="w-full"
        onValueChange={handleTabChange}
      >
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="beneficios">Beneficios</TabsTrigger>
          <TabsTrigger value="wallets">Wallets</TabsTrigger>
          <TabsTrigger value="rubros">Rubros</TabsTrigger>
          <TabsTrigger value="localidades">Localidades</TabsTrigger>
          <TabsTrigger value="ciudades">Ciudades</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
        </TabsList>
        
        <TabsContent value="beneficios" className="space-y-4 mt-6">
          <Button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-green-600 hover:bg-green-700 mb-4"
          >
            <Plus className="w-4 h-4 mr-2" />
            Crear Beneficio
          </Button>
          <TablaInfo key={`beneficios-${refreshKey}`} entityType="beneficios" title="Beneficios" />
        </TabsContent>
        
        <TabsContent value="wallets" className="space-y-4 mt-6">
          <Button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-green-600 hover:bg-green-700 mb-4"
          >
            <Plus className="w-4 h-4 mr-2" />
            Crear Wallet
          </Button>
          <TablaInfo key={`wallets-${refreshKey}`} entityType="wallets" title="Wallets" />
        </TabsContent>

        <TabsContent value="rubros" className="space-y-4 mt-6">
          <Button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-green-600 hover:bg-green-700 mb-4"
          >
            <Plus className="w-4 h-4 mr-2" />
            Crear Rubro
          </Button>
          <TablaInfo key={`rubros-${refreshKey}`} entityType="rubros" title="Rubros" />
        </TabsContent>

        <TabsContent value="localidades" className="space-y-4 mt-6">
          <Button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-green-600 hover:bg-green-700 mb-4"
          >
            <Plus className="w-4 h-4 mr-2" />
            Crear Localidad
          </Button>
          <TablaInfo key={`localidades-${refreshKey}`} entityType="localidades" title="Localidades" />
        </TabsContent>

        <TabsContent value="ciudades" className="space-y-4 mt-6">
          <Button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-green-600 hover:bg-green-700 mb-4"
          >
            <Plus className="w-4 h-4 mr-2" />
            Crear Ciudad
          </Button>
          <TablaInfo key={`ciudades-${refreshKey}`} entityType="ciudades" title="Ciudades" />
        </TabsContent>

        <TabsContent value="roles" className="space-y-4 mt-6">
          <Button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-green-600 hover:bg-green-700 mb-4"
          >
            <Plus className="w-4 h-4 mr-2" />
            Crear Rol
          </Button>
          <TablaInfo key={`roles-${refreshKey}`} entityType="roles" title="Roles de Administrador" />
        </TabsContent>
      </Tabs>

      <FormularioCrear
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        entityType={currentTab}
        onSuccess={handleSuccess}
      />
    </>
  );
}

export default NavegadorAdmin;