import React, { useState, useEffect, Suspense, lazy } from 'react';
import { User, Menu, X, Phone, Tag } from 'lucide-react';
import HomePage from './components/HomePage';
import CategoryPage from './components/CategoryPage';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';
import WhatsAppButton from './components/WhatsAppButton';
import CartNotification from './components/CartNotification';
import InfoBar from './components/InfoBar';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

export type View = 'home' | 'category' | 'cart' | 'checkout' | 'admin' | 'admin-login';

function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Función para obtener la vista desde la URL
  const getViewFromURL = (): { view: View; category?: string } => {
    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    
    if (path === '/admin') {
      return { view: 'admin' };
    } else if (path === '/admin-login') {
      return { view: 'admin-login' };
    } else if (path === '/cart') {
      return { view: 'cart' };
    } else if (path === '/checkout') {
      return { view: 'checkout' };
    } else if (path === '/category') {
      const categoryId = searchParams.get('id');
      return { view: 'category', category: categoryId || undefined };
    } else {
      return { view: 'home' };
    }
  };

  // Función para actualizar la URL sin recargar la página
  const updateURL = (view: View, categoryId?: string) => {
    let path = '/';
    let search = '';
    
    switch (view) {
      case 'admin':
        path = '/admin';
        break;
      case 'admin-login':
        path = '/admin-login';
        break;
      case 'cart':
        path = '/cart';
        break;
      case 'checkout':
        path = '/checkout';
        break;
      case 'category':
        path = '/category';
        if (categoryId) {
          search = `?id=${categoryId}`;
        }
        break;
      default:
        path = '/';
    }
    
    const url = path + search;
    if (window.location.pathname + window.location.search !== url) {
      window.history.pushState({ view, categoryId }, '', url);
    }
  };

  // Inicializar la vista desde la URL al cargar
  useEffect(() => {
    const { view, category } = getViewFromURL();
    setCurrentView(view);
    if (category) {
      setSelectedCategory(category);
    }
  }, []);

  // Manejar el evento popstate (botones atrás/adelante del navegador)
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state) {
        setCurrentView(event.state.view);
        if (event.state.categoryId) {
          setSelectedCategory(event.state.categoryId);
        } else {
          setSelectedCategory(null);
        }
      } else {
        // Si no hay estado, obtener de la URL
        const { view, category } = getViewFromURL();
        setCurrentView(view);
        setSelectedCategory(category || null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToView = (view: View) => {
    setCurrentView(view);
    setIsMenuOpen(false);
    updateURL(view);
  };

  const navigateToCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentView('category');
    setIsMenuOpen(false);
    updateURL('category', categoryId);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'category':
        return selectedCategory ? (
          <CategoryPage 
            categoryId={selectedCategory}
            onBack={() => navigateToView('home')}
          />
        ) : (
          <HomePage 
            onCategorySelect={navigateToCategory}
            onViewChange={navigateToView}
          />
        );
      case 'cart':
        return <Cart onViewChange={navigateToView} />;
      case 'checkout':
        return <Checkout onViewChange={navigateToView} />;
      case 'admin':
        return <AdminPanel onLogout={() => navigateToView('home')} />;
      case 'admin-login':
        return <AdminLogin 
          onLoginSuccess={() => navigateToView('admin')} 
          onViewChange={(view) => navigateToView(view as View)}
        />;
      default:
        return <HomePage 
          onCategorySelect={navigateToCategory}
          onViewChange={navigateToView}
        />;
    }
  };

  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-gray-900">
            {/* InfoBar - Mostrar en todas las vistas excepto admin */}
            {currentView !== 'admin' && currentView !== 'admin-login' && (
              <InfoBar />
            )}
            
            {/* Header */}
            <header className="bg-black border-b border-gray-800 sticky top-0 z-50">
              <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                  {/* Logo */}
                  <button 
                    onClick={() => navigateToView('home')}
                    className="hover:opacity-80 transition-opacity"
                  >
                    <img 
                      src="/LogoLaAlianza negro simple.JPG" 
                      alt="LA ALIANZA CARNICERIAS" 
                      className="h-8 md:h-10 w-auto"
                    />
                  </button>
                  
                  {/* Botones principales */}
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => navigateToView('home')}
                      className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
                    >
                      Inicio
                    </button>
                    
                    <button
                      onClick={() => navigateToView('admin-login')}
                      className="flex items-center space-x-1 text-white hover:text-yellow-400 transition-colors border border-gray-600 px-3 py-2 rounded-lg hover:border-yellow-400"
                    >
                      <User size={20} />
                      <span>Admin</span>
                    </button>
                    
                    <a
                      href="tel:+56912345678"
                      className="flex items-center space-x-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-500 transition-colors"
                    >
                      <Phone size={20} />
                      <span>Llamar</span>
                    </a>
                  </div>
                </div>
              </div>
            </header>
            
            {/* Main Content */}
            <main className="flex-1">
              {renderCurrentView()}
            </main>
            
            {/* WhatsApp Button - Solo mostrar si no estamos en vistas de admin */}
            {currentView !== 'admin' && currentView !== 'admin-login' && (
              <WhatsAppButton />
            )}
            
            {/* Cart Notification */}
            <CartNotification onNavigateToCart={() => navigateToView('cart')} />
          </div>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;