import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, ShoppingCart, DollarSign, Star, BarChart3, Loader2 } from 'lucide-react';
import { getAnalytics, getTopProducts, getFrequentCustomers, getSalesByCategory } from '../../services/supabaseService';

interface AnalyticsData {
  id: string;
  date: string;
  total_sales: number;
  total_orders: number;
  new_customers: number;
  created_at: string;
  updated_at: string;
}

interface TopProduct {
  name: string;
  sales: number;
}

interface FrequentCustomer {
  name: string;
  orders: number;
}

interface CategorySales {
  category: string;
  percentage: number;
  amount: number;
}

const Analytics: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [frequentCustomers, setFrequentCustomers] = useState<FrequentCustomer[]>([]);
  const [salesByCategory, setSalesByCategory] = useState<CategorySales[]>([]);
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Cargar datos de analytics
        const analytics = await getAnalytics();
        if (analytics && analytics.length > 0) {
          setAnalyticsData(analytics[0]);
        }
        
        // Cargar productos más vendidos
        const topProductsData = await getTopProducts(5);
        setTopProducts(topProductsData);
        
        // Cargar clientes frecuentes
        const frequentCustomersData = await getFrequentCustomers(5);
        setFrequentCustomers(frequentCustomersData);
        
        // Cargar ventas por categoría
        const salesByCategoryData = await getSalesByCategory();
        setSalesByCategory(salesByCategoryData);
      } catch (error) {
        console.error('Error al cargar datos de analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Calcular ticket promedio
  const averageTicket = analyticsData && analyticsData.total_orders > 0 
    ? Math.round(analyticsData.total_sales / analyticsData.total_orders) 
    : 0;

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Analítica</h1>
        <p className="text-gray-400">Dashboard de métricas y estadísticas</p>
      </div>

      {/* Main Stats Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Ventas Total"
            value={`$${(analyticsData?.total_sales || 0).toLocaleString()}`}
            icon={DollarSign}
            color="bg-green-500 text-white"
          />
          <StatCard
            title="Pedidos Total"
            value={analyticsData?.total_orders || 0}
            icon={ShoppingCart}
            color="bg-blue-500 text-white"
          />
          <StatCard
            title="Clientes Unidos"
            value={analyticsData?.new_customers || 0}
            icon={Users}
            color="bg-purple-500 text-white"
          />
          <StatCard
            title="Ticket Promedio"
            value={`$${averageTicket.toLocaleString()}`}
            icon={TrendingUp}
            color="bg-yellow-500 text-black"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Top Products */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <Star className="mr-2 text-yellow-400" size={20} />
            Productos Más Vendidos
          </h2>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-6 w-6 animate-spin text-yellow-400" />
            </div>
          ) : topProducts.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No hay datos de productos disponibles</p>
          ) : (
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-gray-400 w-6">{index + 1}.</span>
                    <span className="text-white ml-2">{product.name}</span>
                  </div>
                  <span className="text-yellow-400 font-semibold">{product.sales} ventas</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Frequent Customers */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <Users className="mr-2 text-blue-400" size={20} />
            Clientes Más Frecuentes
          </h2>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
            </div>
          ) : frequentCustomers.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No hay datos de clientes disponibles</p>
          ) : (
            <div className="space-y-4">
              {frequentCustomers.map((customer, index) => (
                <div key={customer.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-gray-400 w-6">{index + 1}.</span>
                    <span className="text-white ml-2">{customer.name}</span>
                  </div>
                  <span className="text-blue-400 font-semibold">{customer.orders} pedidos</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sales by Category */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <BarChart3 className="mr-2 text-green-400" size={20} />
          Ventas por Categoría
        </h2>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-6 w-6 animate-spin text-green-400" />
          </div>
        ) : salesByCategory.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No hay datos de categorías disponibles</p>
        ) : (
          <div className="space-y-4">
            {salesByCategory.map((category) => (
              <div key={category.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">{category.category}</span>
                  <span className="text-gray-400">
                    {category.percentage}% - ${category.amount.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;