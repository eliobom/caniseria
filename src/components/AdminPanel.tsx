import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Grid, 
  Package, 
  Users, 
  Calendar, 
  BarChart3, 
  LogOut, 
  Settings, 
  Truck, 
  Menu, 
  X, 
  Percent,
  MapPin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CategoryManagement from './admin/CategoryManagement';
import ProductManagement from './admin/ProductManagement';
import InventoryManagement from './admin/InventoryManagement';
import CustomerManagement from './admin/CustomerManagement';
import OrderManagement from './admin/OrderManagement';
import Analytics from './admin/Analytics';
import Configuration from './admin/Configuration';
import DailyOffersManagement from './admin/DailyOffersManagement';
import DeliveryManagement from './admin/DeliveryManagement';
import CouponManagement from './admin/CouponManagement';
import StoreLocationManagement from './admin/StoreLocationManagement';

interface AdminPanelProps {
  onLogout: () => void;
}

type AdminView = 'categories' | 'products' | 'inventory' | 'customers' | 'orders' | 'analytics' | 'configuration' | 'offers' | 'delivery' | 'coupons' | 'locations';

const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
  const { logout } = useAuth();
  const [currentAdminView, setCurrentAdminView] = useState<AdminView>('analytics');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Función para obtener la vista admin desde la URL
  const getAdminViewFromURL = (): AdminView => {
    const searchParams = new URLSearchParams(window.location.search);
    const view = searchParams.get('view') as AdminView;
    return view || 'analytics';
  };

  // Función para actualizar la URL del panel admin
  const updateAdminURL = (view: AdminView) => {
    const url = `/admin?view=${view}`;
    if (window.location.pathname + window.location.search !== url) {
      window.history.pushState({ adminView: view }, '', url);
    }
  };

  // Inicializar la vista desde la URL
  useEffect(() => {
    const view = getAdminViewFromURL();
    setCurrentAdminView(view);
  }, []);

  // Manejar el evento popstate para el panel admin
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (window.location.pathname === '/admin') {
        if (event.state && event.state.adminView) {
          setCurrentAdminView(event.state.adminView);
        } else {
          const view = getAdminViewFromURL();
          setCurrentAdminView(view);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleLogout = () => {
    logout();
    onLogout();
  };

  const menuItems = [
    { id: 'analytics' as AdminView, label: 'Analítica', icon: BarChart3 },
    { id: 'categories' as AdminView, label: 'Categorías', icon: Grid },
    { id: 'products' as AdminView, label: 'Productos', icon: Package },
    { id: 'inventory' as AdminView, label: 'Inventarios', icon: Package },
    { id: 'customers' as AdminView, label: 'Clientes', icon: Users },
    { id: 'orders' as AdminView, label: 'Pedidos', icon: Calendar },
    { id: 'delivery' as AdminView, label: 'Gestión de Entregas', icon: Truck },
    { id: 'locations' as AdminView, label: 'Locales', icon: MapPin },
    { id: 'offers' as AdminView, label: 'Ofertas del Día', icon: Percent },
    { id: 'coupons' as AdminView, label: 'Cupones', icon: Percent },
    { id: 'configuration' as AdminView, label: 'Configuración', icon: Settings },
  ];

  const handleMenuItemClick = (viewId: AdminView) => {
    setCurrentAdminView(viewId);
    setIsMobileMenuOpen(false);
    updateAdminURL(viewId);
  };

  const renderCurrentView = () => {
    switch (currentAdminView) {
      case 'categories':
        return <CategoryManagement />;
      case 'products':
        return <ProductManagement />;
      case 'inventory':
        return <InventoryManagement />;
      case 'customers':
        return <CustomerManagement />;
      case 'orders':
        return <OrderManagement />;
      case 'analytics':
        return <Analytics />;
      case 'configuration':
        return <Configuration />;
      case 'offers':
        return <DailyOffersManagement />;
      case 'delivery':
        return <DeliveryManagement />;
      case 'coupons':
        return <CouponManagement />;
      case 'locations':
        return <StoreLocationManagement />;
      default:
        return <Analytics />;
    }
  };

  const getCurrentViewTitle = () => {
    const currentItem = menuItems.find(item => item.id === currentAdminView);
    return currentItem?.label || 'Panel Admin';
  };

  return (
    <div className="flex min-h-screen bg-black">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-yellow-400">{getCurrentViewTitle()}</h1>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-300 hover:text-white p-2"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-gray-900 border-r border-gray-800
        transform transition-transform duration-300 ease-in-out
        lg:transform-none
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 lg:p-6">
          {/* Desktop Header */}
          <div className="hidden lg:block">
            <h2 className="text-xl font-bold text-yellow-400 mb-8">Panel Admin</h2>
          </div>
          
          {/* Mobile Header in Sidebar */}
          <div className="lg:hidden mb-6 pt-2">
            <h2 className="text-xl font-bold text-yellow-400">Panel Admin</h2>
          </div>
          
          <nav className="space-y-1 lg:space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuItemClick(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg transition-colors text-sm lg:text-base ${
                    currentAdminView === item.id
                      ? 'bg-yellow-400 text-black'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon size={18} className="lg:w-5 lg:h-5" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-6 lg:mt-8 pt-6 lg:pt-8 border-t border-gray-800">
            <button
              onClick={() => {
                onLogout();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center space-x-3 px-3 lg:px-4 py-2 lg:py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors mb-2 text-sm lg:text-base"
            >
              <ArrowLeft size={18} className="lg:w-5 lg:h-5" />
              <span className="truncate">Volver al sitio</span>
            </button>
            
            <button
              onClick={() => {
                handleLogout();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center space-x-3 px-3 lg:px-4 py-2 lg:py-3 text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-lg transition-colors text-sm lg:text-base"
            >
              <LogOut size={18} className="lg:w-5 lg:h-5" />
              <span className="truncate">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0 pt-16 lg:pt-0">
        <div className="p-4 lg:p-8">
          {renderCurrentView()}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;