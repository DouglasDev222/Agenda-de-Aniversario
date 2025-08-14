import { Home, Users, MessageCircle, Settings as SettingsIcon, Phone, LogOut, User } from "lucide-react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/context/auth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

const getNavigation = (isAdmin: boolean) => [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
    allowedRoles: ["admin", "management"],
  },
  {
    title: "Colaboradores",
    url: "/employees",
    icon: Users,
    allowedRoles: ["admin", "management"],
  },
  {
    title: "Contatos",
    url: "/contacts",
    icon: Phone,
    allowedRoles: ["admin", "management"],
  },
  {
    title: "Mensagens",
    url: "/messages",
    icon: MessageCircle,
    allowedRoles: ["admin", "management"],
  },
  {
    title: "Usuários",
    url: "/users",
    icon: User,
    allowedRoles: ["admin"],
  },
  {
    title: "WhatsApp",
    url: "/whatsapp",
    icon: MessageCircle,
    allowedRoles: ["admin"],
  },
  {
    title: "Configurações",
    url: "/settings",
    icon: SettingsIcon,
    allowedRoles: ["admin"],
  },
].filter(item => {
  if (isAdmin) return true;
  return item.allowedRoles.includes("management");
});

export default function AppSidebar() {
  const [location] = useLocation();
  const { user, logout, isAdmin } = useAuth();

  const navigation = getNavigation(isAdmin);

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.username || 'Usuário'}
            </p>
            <p className="text-xs text-gray-500">
              {user?.role === 'admin' ? 'Administrador' : 'Gerência'}
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout}>
              <LogOut />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}