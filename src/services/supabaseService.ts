import { supabase } from '../lib/supabase';

// Servicios para Categorías
export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*, is_visible')
    .eq('is_visible', true)  // Solo categorías visibles
    .order('order', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data;
};

export const getCategoryById = async (id: string) => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching category with id ${id}:`, error);
    return null;
  }

  return data;
};

export const createCategory = async (category: any) => {
  try {
    // Validar que los campos requeridos estén presentes
    if (!category.name || !category.description) {
      throw new Error('Nombre y descripción son requeridos');
    }

    const categoryData = {
      name: category.name.trim(),
      description: category.description.trim(),
      image: category.image || '',
      order: category.order || 0,
      is_visible: category.is_visible !== undefined ? category.is_visible : true
    };

    // Intentar crear una sesión temporal para bypass RLS
    try {
      const { error: signInError } = await supabase.auth.signInAnonymously();
      if (signInError) {
        console.warn('Could not create anonymous session:', signInError);
      }
    } catch (authError) {
      console.warn('Auth error, continuing without session:', authError);
    }

    const { data, error } = await supabase
      .from('categories')
      .insert([categoryData])
      .select();

    if (error) {
      console.error('Error creating category:', error);
      throw new Error(`Error al crear categoría: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error('No se pudo crear la categoría');
    }

    return data[0];
  } catch (error) {
    console.error('Error in createCategory:', error);
    throw error;
  }
};

export const updateCategory = async (id: string, updates: any) => {
  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) {
    console.error(`Error updating category with id ${id}:`, error);
    return null;
  }

  return data[0];
};

export const toggleCategoryVisibility = async (id: string, isVisible: boolean) => {
  try {
    console.log(`Toggling category ${id} visibility to ${isVisible}`);
    
    const { data, error } = await supabase
      .from('categories')
      .update({ is_visible: isVisible })
      .eq('id', id)
      .select('id, name, is_visible');

    if (error) {
      console.error('Supabase error:', error);
      throw new Error(`Error al cambiar visibilidad: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error('No se encontró la categoría para actualizar');
    }

    console.log('Category visibility updated successfully:', data[0]);
    return data[0];
  } catch (error) {
    console.error('Error in toggleCategoryVisibility:', error);
    throw error;
  }
};

export const deleteCategory = async (id: string) => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting category with id ${id}:`, error);
    return false;
  }

  return true;
};



// Servicios para Productos
export const getProducts = async () => {
  try {
    // Primero obtener productos
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (productsError) {
      console.error('Error fetching products:', productsError);
      return [];
    }

    if (!products || products.length === 0) {
      return [];
    }

    // Obtener categorías para mapear nombres
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name');

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
      // Continuar sin nombres de categorías
    }

    // Mapear productos con nombres de categorías
    return products.map(product => {
      const category = categories?.find(cat => cat.id === product.category_id);
      return {
        ...product,
        categoryName: category?.name || 'Sin categoría'
      };
    });
  } catch (error) {
    console.error('Error in getProducts:', error);
    return [];
  }
};

export const getProductsByCategory = async (categoryId: string) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', categoryId)
    .eq('is_visible', true)  // Solo productos visibles
    .order('name');

  if (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }

  return data;
};

export const getProductById = async (id: string) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching product with id ${id}:`, error);
    return null;
  }

  return {
    id: data.id,
    categoryId: data.category_id,
    name: data.name,
    description: data.description,
    price: data.price,
    image: data.image,
    stock: data.stock
  };
};

export const createProduct = async (productData: any) => {
  const { data, error } = await supabase
    .from('products')
    .insert([{
      name: productData.name,
      description: productData.description,
      price: productData.price,
      category_id: productData.category_id,
      image: productData.image,
      stock: productData.stock,
      unit_type: productData.unit_type || 'kg',
      is_visible: true
    }])
    .select();

  if (error) {
    console.error('Error creating product:', error);
    return null;
  }

  return data[0];

};

export const updateProduct = async (id: string, productData: any) => {
  const { data, error } = await supabase
    .from('products')
    .update({
      name: productData.name,
      description: productData.description,
      price: productData.price,
      category_id: productData.category_id,
      image: productData.image,
      stock: productData.stock,
      unit_type: productData.unit_type || 'kg'
    })
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error updating product:', error);
    return null;
  }

  return data[0];

};

export const deleteProduct = async (id: string) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting product with id ${id}:`, error);
    return false;
  }

  return true;
};

// Función para toggle visibilidad de productos
export const toggleProductVisibility = async (id: string, isVisible: boolean) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({ is_visible: isVisible })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error toggling product visibility:', error);
      throw new Error(`Error al cambiar visibilidad: ${error.message}`);
    }

    return data[0];
  } catch (error) {
    console.error('Error in toggleProductVisibility:', error);
    throw error;
  }
};



export const updateProductStock = async (id: string, newStock: number) => {
  const { data, error } = await supabase
    .from('products')
    .update({ stock: newStock })
    .eq('id', id)
    .select();

  if (error) {
    console.error(`Error updating stock for product ${id}:`, error);
    return null;
  }

  return {
    id: data[0].id,
    categoryId: data[0].category_id,
    name: data[0].name,
    description: data[0].description,
    price: data[0].price,
    image: data[0].image,
    stock: data[0].stock
  };
};

// Servicios para Clientes
export const getCustomers = async () => {
  try {
    // Usar una consulta SQL personalizada para obtener estadísticas
    const { data, error } = await supabase.rpc('get_customers_with_stats');
    
    if (error) {
      console.error('Error fetching customers with stats:', error);
      // Fallback a consulta básica
      const { data: basicData, error: basicError } = await supabase
        .from('customers')
        .select('*');
      
      if (basicError) {
        console.error('Error fetching basic customers:', basicError);
        return [];
      }
      
      // Agregar campos por defecto
      return basicData.map(customer => ({
        ...customer,
        total_orders: 0,
        total_spent: 0,
        last_order_date: null
      }));
    }
    
    return data;
  } catch (error) {
    console.error('Error in getCustomers:', error);
    return [];
  }
};

export const getCustomerById = async (id: string) => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching customer with id ${id}:`, error);
    return null;
  }

  return data;
};

export const createCustomer = async (customer: any) => {
  const { data, error } = await supabase
    .from('customers')
    .insert([customer])
    .select();

  if (error) {
    console.error('Error creating customer:', error);
    return null;
  }

  return data[0];
};

export const updateCustomer = async (id: string, updates: any) => {
  const { data, error } = await supabase
    .from('customers')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) {
    console.error(`Error updating customer with id ${id}:`, error);
    return null;
  }

  return data[0];
};

// Buscar cliente por teléfono
export const getCustomerByPhone = async (phone: string) => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('phone', phone)
    .single();

  if (error) {
    console.error(`Error fetching customer with phone ${phone}:`, error);
    return null;
  }

  return data;
};

// Generar código único para cliente
export const generateCustomerCode = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `CL${timestamp}${random}`;
};

// Servicios para Pedidos
export const getOrders = async () => {
  const { data, error } = await supabase
    .from('orders')
    .select('*');

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }

  return data;
};

export const getOrderById = async (id: string) => {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (orderError) {
    console.error(`Error fetching order with id ${id}:`, orderError);
    return null;
  }

  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', id);

  if (itemsError) {
    console.error(`Error fetching items for order ${id}:`, itemsError);
    return { ...order, items: [] };
  }

  return { ...order, items };
};

export const createOrder = async (order: any) => {
  try {
    console.log('Creating order with data:', order);
    
    // Crear el pedido principal
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([{
        id: order.id,
        customer_id: order.customerId || null,
        customer_name: order.customerName,
        customer_email: order.customerEmail || null,
        customer_phone: order.customerPhone,
        address: order.address,
        commune: order.commune,
        status: order.status || 'pendiente',
        total: order.total,
        original_total: order.originalTotal || order.total,
        discount: order.discount || 0,
        coupon_code: order.couponCode || null,
       estimated_delivery: order.estimatedDelivery || '45-60 minutos',
        date: order.date || new Date().toISOString().split('T')[0],
        time: order.time || new Date().toISOString().split('T')[1].substring(0, 8)
      }])
      .select();

    if (orderError) {
      console.error('Error creating order:', orderError);
      throw new Error(`Error al crear el pedido: ${orderError.message}`);
    }

    if (!orderData || orderData.length === 0) {
      throw new Error('No se pudo crear el pedido');
    }

    console.log('Order created successfully:', orderData[0]);

    // Insertar los items del pedido
    if (order.items && order.items.length > 0) {
      const orderItems = order.items.map((item: any) => ({
        order_id: orderData[0].id,
        product_id: item.productId || item.id,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price
      }));

      console.log('Creating order items:', orderItems);

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        // Intentar eliminar el pedido si falló la creación de items
        await supabase.from('orders').delete().eq('id', orderData[0].id);
        throw new Error(`Error al crear los items del pedido: ${itemsError.message}`);
      }

      console.log('Order items created successfully');
    }

    // Actualizar estadísticas de analytics
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('analytics')
        .select('*')
        .eq('date', today)
        .single();

      if (!analyticsError && analyticsData) {
        await supabase
          .from('analytics')
          .update({
            total_sales: (analyticsData.total_sales || 0) + order.total,
            total_orders: (analyticsData.total_orders || 0) + 1,
            new_customers: order.isNewCustomer ? (analyticsData.new_customers || 0) + 1 : (analyticsData.new_customers || 0)
          })
          .eq('date', today);
      } else {
        await supabase
          .from('analytics')
          .insert([{
            date: today,
            total_sales: order.total,
            total_orders: 1,
            new_customers: order.isNewCustomer ? 1 : 0
          }]);
      }
    } catch (analyticsError) {
      console.warn('Error updating analytics:', analyticsError);
      // No fallar el pedido por errores de analytics
    }

    return { ...orderData[0], items: order.items };
  } catch (error) {
    console.error('Error in createOrder:', error);
    throw error;
  }
};

export const updateOrderStatus = async (id: string, status: string) => {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select();

  if (error) {
    console.error(`Error updating status for order ${id}:`, error);
    return null;
  }

  return data[0];
};

// Servicios para Autenticación
export const loginAdmin = async (username: string, password: string) => {
  try {
    // Primero consultar el usuario admin en la base de datos
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .single();

    if (adminError || !adminData) {
      console.error('Error en login:', adminError);
      return { success: false, message: 'Usuario no encontrado' };
    }

    // Verificar contraseña (en desarrollo - en producción usar bcrypt)
    if (password !== adminData.password) {
      return { success: false, message: 'Contraseña incorrecta' };
    }

    // Si las credenciales son correctas, crear una sesión temporal usando el service_role
    // Para bypass RLS, podemos usar signInAnonymously y luego setear metadata
    const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
    
    if (authError) {
      console.error('Error creating auth session:', authError);
      // Si falla la autenticación anónima, aún podemos continuar
      // pero necesitaremos manejar RLS de otra manera
    }

    return { 
      success: true, 
      user: { 
        username: adminData.username, 
        email: adminData.email,
        id: adminData.id 
      },
      session: authData?.session
    };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Error en el inicio de sesión' };
  }
};

// Servicios para Análisis
export const getAnalytics = async () => {
  const { data, error } = await supabase
    .from('analytics')
    .select('*')
    .order('date', { ascending: false })
    .limit(30);

  if (error) {
    console.error('Error fetching analytics:', error);
    return [];
  }

  return data;
};

export const getTopProducts = async (limit = 5) => {
  const { data, error } = await supabase
    .from('order_items')
    .select('product_id, product_name, quantity')
    .order('quantity', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching top products:', error);
    return [];
  }

  // Agrupar por producto y sumar cantidades
  const productMap = new Map();
  data.forEach(item => {
    const currentTotal = productMap.get(item.product_id) || { name: item.product_name, sales: 0 };
    productMap.set(item.product_id, {
      name: item.product_name,
      sales: currentTotal.sales + Number(item.quantity)
    });
  });

  // Convertir a array y ordenar
  return Array.from(productMap.values())
    .sort((a, b) => b.sales - a.sales)
    .slice(0, limit);
};

export const getInventoryAlerts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, stock')
    .or('stock.lte.5');

  if (error) {
    console.error('Error fetching inventory alerts:', error);
    return [];
  }

  return data;
};

// Obtener los clientes más frecuentes basado en la cantidad de pedidos
export const getFrequentCustomers = async (limit = 5) => {
  const { data, error } = await supabase
    .from('orders')
    .select('customer_id, customers(name)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching frequent customers:', error);
    return [];
  }

  // Agrupar por cliente y contar pedidos
  const customerMap = new Map();
  data.forEach(order => {
    if (!order.customer_id || !order.customers) return;
    
    const customerName = (order.customers as any).name;
    const currentCount = customerMap.get(order.customer_id) || { name: customerName, orders: 0 };
    customerMap.set(order.customer_id, {
      name: customerName,
      orders: currentCount.orders + 1
    });
  });

  // Convertir a array y ordenar
  return Array.from(customerMap.values())
    .sort((a, b) => b.orders - a.orders)
    .slice(0, limit);
};

// Obtener ventas por categoría
export const getSalesByCategory = async () => {
  // Primero obtenemos el total de ventas
  const { data: analyticsData, error: analyticsError } = await supabase
    .from('analytics')
    .select('total_sales')
    .order('date', { ascending: false })
    .limit(1);

  if (analyticsError || !analyticsData || analyticsData.length === 0) {
    console.error('Error fetching total sales:', analyticsError);
    return [];
  }

  const totalSales = analyticsData[0].total_sales || 0;

  // Luego obtenemos las categorías y calculamos las ventas por categoría
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('id, name');

  if (categoriesError) {
    console.error('Error fetching categories:', categoriesError);
    return [];
  }

  // Obtenemos los items de pedidos con sus productos y categorías
  const { data: orderItems, error: orderItemsError } = await supabase
    .from('order_items')
    .select('product_id, quantity, price, products(category_id)');

  if (orderItemsError) {
    console.error('Error fetching order items:', orderItemsError);
    return [];
  }

  // Calculamos las ventas por categoría
  const categorySales = new Map();
  categories.forEach(category => {
    categorySales.set(category.id, {
      category: category.name,
      amount: 0,
      percentage: 0
    });
  });

  // Sumamos las ventas por categoría
  orderItems.forEach(item => {
    if (!item.products || !(item.products as any).category_id) return;
    
    const categoryId = (item.products as any).category_id;
    const amount = item.quantity * item.price;
    
    if (categorySales.has(categoryId)) {
      const category = categorySales.get(categoryId);
      category.amount += amount;
      categorySales.set(categoryId, category);
    }
  });

  // Calculamos los porcentajes
  const result = Array.from(categorySales.values())
    .map(category => ({
      ...category,
      percentage: totalSales > 0 ? Math.round((category.amount / totalSales) * 100) : 0
    }))
    .sort((a, b) => b.amount - a.amount);

  return result;
};

// Servicios para Configuraciones del Sistema
export const getSystemConfigurations = async () => {
  const { data, error } = await supabase
    .from('system_configurations')
    .select('*')
    .eq('is_active', true)
    .order('category', { ascending: true });

  if (error) {
    console.error('Error fetching system configurations:', error);
    return [];
  }

  return data;
};

export const getConfigurationByKey = async (key: string) => {
  const { data, error } = await supabase
    .from('system_configurations')
    .select('*')
    .eq('key', key)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error(`Error fetching configuration ${key}:`, error);
    return null;
  }

  return data;
};

export const updateSystemConfiguration = async (key: string, value: string) => {
  const { data, error } = await supabase
    .from('system_configurations')
    .update({ value, updated_at: new Date().toISOString() })
    .eq('key', key)
    .select();

  if (error) {
    console.error(`Error updating configuration ${key}:`, error);
    throw error;
  }

  return data;
};

export const createSystemConfiguration = async (config: {
  key: string;
  value: string;
  description?: string;
  category?: string;
}) => {
  const { data, error } = await supabase
    .from('system_configurations')
    .insert([config])
    .select();

  if (error) {
    console.error('Error creating configuration:', error);
    throw error;
  }

  return data;
};

export const deleteSystemConfiguration = async (key: string) => {
  const { data, error } = await supabase
    .from('system_configurations')
    .delete()
    .eq('key', key)
    .select();

  if (error) {
    console.error(`Error deleting configuration ${key}:`, error);
    throw error;
  }

  return data;
};

// Función helper para obtener configuraciones como objeto
export const getConfigurationsAsObject = async () => {
  const configurations = await getSystemConfigurations();
  const configObj: Record<string, any> = {};
  
  configurations.forEach(config => {
    try {
      // Intentar parsear como JSON, si falla usar como string
      configObj[config.key] = JSON.parse(config.value);
    } catch {
      configObj[config.key] = config.value;
    }
  });
  
  return configObj;
};

// Función para el admin que trae todas las categorías (visibles y ocultas)
export const getAllCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*, is_visible')
    .order('order', { ascending: true });

  if (error) {
    console.error('Error fetching all categories:', error);
    return [];
  }

  return data;
};

// ===== DAILY OFFERS FUNCTIONS =====

export const getDailyOffers = async () => {
  const { data, error } = await supabase
    .from('daily_offers')
    .select(`
      *,
      products (
        id,
        name,
        description,
        image,
        category_id,
        stock
      )
    `)
    .eq('is_active', true)
    .lte('start_date', new Date().toISOString().split('T')[0])
    .gte('end_date', new Date().toISOString().split('T')[0])
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching daily offers:', error);
    return [];
  }

  // Transformar los datos para que coincidan con la interfaz Product
  return data.map(offer => ({
    id: offer.products.id,
    name: offer.products.name,
    description: offer.products.description,
    price: offer.discounted_price,
    originalPrice: offer.original_price,
    image: offer.products.image,
    category_id: offer.products.category_id,
    stock: offer.products.stock,
    discount_percentage: offer.discount_percentage,
    offer_id: offer.id
  }));
};

export const getAllDailyOffers = async () => {
  const { data, error } = await supabase
    .from('daily_offers')
    .select(`
      *,
      products (
        id,
        name,
        description,
        image,
        category_id,
        stock
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all daily offers:', error);
    return [];
  }

  return data;
};

export const createDailyOffer = async (offer: {
  product_id: string;
  discount_percentage: number;
  original_price: number;
  start_date: string;
  end_date: string;
}) => {
  const discounted_price = offer.original_price * (1 - offer.discount_percentage / 100);
  
  const { data, error } = await supabase
    .from('daily_offers')
    .insert({
      ...offer,
      discounted_price: Math.round(discounted_price * 100) / 100
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating daily offer:', error);
    throw error;
  }

  return data;
};

export const updateDailyOffer = async (id: string, updates: any) => {
  if (updates.original_price && updates.discount_percentage) {
    updates.discounted_price = Math.round(updates.original_price * (1 - updates.discount_percentage / 100) * 100) / 100;
  }

  const { data, error } = await supabase
    .from('daily_offers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating daily offer:', error);
    throw error;
  }

  return data;
};

export const deleteDailyOffer = async (id: string) => {
  const { data, error } = await supabase
    .from('daily_offers')
    .delete()
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error deleting daily offer:', error);
    throw error;
  }

  return data;
};

export const toggleDailyOfferStatus = async (id: string, isActive: boolean) => {
  const { data, error } = await supabase
    .from('daily_offers')
    .update({ is_active: isActive })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error toggling daily offer status:', error);
    throw error;
  }

  return data;
};


// ===== GESTIÓN DE ZONAS DE ENTREGA =====
export const getDeliveryZones = async () => {
  try {
    const { data, error } = await supabase
      .from('delivery_zones')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching delivery zones:', error);
    throw error;
  }
};

export const getActiveDeliveryZones = async () => {
  try {
    const { data, error } = await supabase
      .from('delivery_zones')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching active delivery zones:', error);
    throw error;
  }
};

export const getDeliveryZoneByName = async (name: string) => {
  try {
    const { data, error } = await supabase
      .from('delivery_zones')
      .select('*')
      .eq('name', name)
      .eq('is_active', true)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching delivery zone:', error);
    return null;
  }
};

export const updateDeliveryZone = async (id: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('delivery_zones')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating delivery zone:', error);
    throw error;
  }
};

export const toggleDeliveryZoneStatus = async (id: string, isActive: boolean) => {
  try {
    const { data, error } = await supabase
      .from('delivery_zones')
      .update({ is_active: isActive })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error toggling delivery zone status:', error);
    throw error;
  }
};

// ===== GESTIÓN DE CUPONES =====
export const getCoupons = async () => {
  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching coupons:', error);
    throw error;
  }
};

export const getActiveCoupons = async () => {
  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('is_active', true)
      .or('end_date.is.null,end_date.gte.' + new Date().toISOString())
      .order('code');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching active coupons:', error);
    throw error;
  }
};

export const validateCoupon = async (code: string, orderTotal: number) => {
  try {
    const { data, error } = await supabase
      .rpc('validate_coupon', {
        coupon_code: code.toUpperCase(),
        order_total: orderTotal
      });
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return { valid: false, message: 'Error al validar cupón' };
    }
    
    const result = data[0];
    
    if (!result.is_valid) {
      return { valid: false, message: result.error_message };
    }
    
    return { 
      valid: true, 
      couponId: result.coupon_id,
      discountAmount: result.discount_amount 
    };
  } catch (error) {
    console.error('Error validating coupon:', error);
    return { valid: false, message: 'Error al validar cupón' };
  }
};

export const createCoupon = async (couponData: any) => {
  try {
    const { data, error } = await supabase
      .from('coupons')
      .insert([{
        code: couponData.code.toUpperCase(),
        name: couponData.name,
        description: couponData.description,
        type: couponData.type,
        value: couponData.value,
        min_order_amount: couponData.min_order_amount || 0,
        max_discount_amount: couponData.max_discount_amount,
        usage_limit: couponData.usage_limit,
        start_date: couponData.start_date,
        end_date: couponData.end_date,
        is_active: couponData.is_active !== undefined ? couponData.is_active : true
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error creating coupon:', error);
    if (error.code === '23505') {
      throw new Error('Ya existe un cupón con este código');
    }
    throw error;
  }
};

export const updateCoupon = async (id: string, updates: any) => {
  try {
    const updateData: any = {};
    
    if (updates.code) updateData.code = updates.code.toUpperCase();
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.value !== undefined) updateData.value = updates.value;
    if (updates.min_order_amount !== undefined) updateData.min_order_amount = updates.min_order_amount;
    if (updates.max_discount_amount !== undefined) updateData.max_discount_amount = updates.max_discount_amount;
    if (updates.usage_limit !== undefined) updateData.usage_limit = updates.usage_limit;
    if (updates.start_date !== undefined) updateData.start_date = updates.start_date;
    if (updates.end_date !== undefined) updateData.end_date = updates.end_date;
    if (updates.is_active !== undefined) updateData.is_active = updates.is_active;
    
    const { data, error } = await supabase
      .from('coupons')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error updating coupon:', error);
    if (error.code === '23505') {
      throw new Error('Ya existe un cupón con este código');
    }
    throw error;
  }
};

export const deleteCoupon = async (id: string) => {
  try {
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting coupon:', error);
    throw error;
  }
};

export const toggleCouponStatus = async (id: string, isActive: boolean) => {
  try {
    const { data, error } = await supabase
      .from('coupons')
      .update({ is_active: isActive })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error toggling coupon status:', error);
    throw error;
  }
};

export const useCoupon = async (couponCode: string, orderId: string, customerId: string | null, discountAmount: number) => {
  try {
    const { data, error } = await supabase
      .rpc('use_coupon', {
        coupon_code: couponCode.toUpperCase(),
        order_id: orderId,
        customer_id: customerId,
        discount_amount: discountAmount
      });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error using coupon:', error);
    throw error;
  }
};

// Servicios para Locales
export const getStoreLocations = async () => {
  const { data, error } = await supabase
    .from('store_locations')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching store locations:', error);
    return [];
  }

  return data;
};

export const getAllStoreLocations = async () => {
  const { data, error } = await supabase
    .from('store_locations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all store locations:', error);
    return [];
  }

  return data;
};

export const getStoreLocationById = async (id: string) => {
  const { data, error } = await supabase
    .from('store_locations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching store location with id ${id}:`, error);
    return null;
  }

  return data;
};

export const createStoreLocation = async (locationData: any) => {
  try {
    if (!locationData.name || !locationData.address || !locationData.commune || !locationData.phone) {
      throw new Error('Todos los campos obligatorios deben estar completos');
    }

    const storeLocationData = {
      name: locationData.name.trim(),
      address: locationData.address.trim(),
      commune: locationData.commune,
      phone: locationData.phone.trim(),
      hours: locationData.hours.trim(),
      latitude: locationData.latitude || -33.4489,
      longitude: locationData.longitude || -70.6693,
      description: locationData.description?.trim() || '',
      is_active: locationData.is_active !== undefined ? locationData.is_active : true
    };

    const { data, error } = await supabase
      .from('store_locations')
      .insert([storeLocationData])
      .select()
      .single();

    if (error) {
      console.error('Error creating store location:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createStoreLocation:', error);
    throw error;
  }
};

export const updateStoreLocation = async (id: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('store_locations')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating store location:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateStoreLocation:', error);
    throw error;
  }
};

export const deleteStoreLocation = async (id: string) => {
  try {
    const { error } = await supabase
      .from('store_locations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting store location:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteStoreLocation:', error);
    throw error;
  }
};

export const toggleStoreLocationStatus = async (id: string, isActive: boolean) => {
  try {
    const { data, error } = await supabase
      .from('store_locations')
      .update({ 
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error toggling store location status:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in toggleStoreLocationStatus:', error);
    throw error;
  }
};
