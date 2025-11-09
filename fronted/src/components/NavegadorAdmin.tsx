import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import TablaInfo from "./TablaInfo";

interface NavegadorAdminProps {
  activeTab?: string;
  onTabChange?: (value: string) => void;
}

function NavegadorAdmin({ activeTab = "beneficios", onTabChange }: NavegadorAdminProps) {
  return (
    <Tabs 
      defaultValue={activeTab} 
      className="w-full"
      onValueChange={onTabChange}
    >
      <TabsList className="grid w-full grid-cols-7">
        <TabsTrigger value="beneficios">Beneficios</TabsTrigger>
        <TabsTrigger value="wallets">Wallets</TabsTrigger>
        <TabsTrigger value="personas">Personas</TabsTrigger>
        <TabsTrigger value="rubros">Rubros</TabsTrigger>
        <TabsTrigger value="localidades">Localidades</TabsTrigger>
        <TabsTrigger value="ciudades">Ciudades</TabsTrigger>
        <TabsTrigger value="roles">Roles</TabsTrigger>
      </TabsList>
      
      <TabsContent value="beneficios" className="space-y-4 mt-6">
        <TablaInfo entityType="beneficios" title="Beneficios" />
      </TabsContent>
      
      <TabsContent value="wallets" className="space-y-4 mt-6">
        <TablaInfo entityType="wallets" title="Wallets" />
      </TabsContent>
      
      <TabsContent value="personas" className="space-y-4 mt-6">
        <TablaInfo entityType="personas" title="Personas" />
      </TabsContent>

      <TabsContent value="rubros" className="space-y-4 mt-6">
        <TablaInfo entityType="rubros" title="Rubros" />
      </TabsContent>

      <TabsContent value="localidades" className="space-y-4 mt-6">
        <TablaInfo entityType="localidades" title="Localidades" />
      </TabsContent>

      <TabsContent value="ciudades" className="space-y-4 mt-6">
        <TablaInfo entityType="ciudades" title="Ciudades" />
      </TabsContent>

      <TabsContent value="roles" className="space-y-4 mt-6">
        <TablaInfo entityType="roles" title="Roles de Administrador" />
      </TabsContent>
    </Tabs>
  );
}

export default NavegadorAdmin;