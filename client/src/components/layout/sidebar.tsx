import { Link, useLocation } from "wouter";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: "fas fa-chart-pie",
  },
  {
    name: "Colaboradores", 
    href: "/employees",
    icon: "fas fa-users",
  },
  {
    name: "Contatos da Gerência",
    href: "/contacts",
    icon: "fas fa-phone",
  },
  {
    name: "Mensagens",
    href: "/messages", 
    icon: "fas fa-whatsapp",
  },
  {
    name: "WhatsApp",
    href: "/whatsapp",
    icon: "fas fa-qrcode",
  },
  {
    name: "Configurações",
    href: "/settings",
    icon: "fas fa-cog",
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const [location] = useLocation();

  return (
    <aside className={`
      w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col
      fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out
      lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      {/* Brand Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <i className="fas fa-birthday-cake text-white text-lg"></i>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Sistema de</h1>
            <p className="text-sm text-gray-500">Aniversários</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <div
                onClick={() => onClose?.()}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                  isActive
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <i className={item.icon}></i>
                <span>{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <i className="fas fa-user text-white text-sm"></i>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Admin</p>
            <p className="text-xs text-gray-500">Gerência</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
