export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  order: number;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
}

export const categories: Category[] = [
  {
    id: 'vacuno',
    name: 'Vacuno',
    description: 'Cortes premium de res, perfectos para cualquier ocasión',
    image: 'https://images.pexels.com/photos/3997609/pexels-photo-3997609.jpeg?auto=compress&cs=tinysrgb&w=500',
    order: 1
  },
  {
    id: 'premium',
    name: 'Cortes Premium',
    description: 'Selección exclusiva de los mejores cortes',
    image: 'https://images.pexels.com/photos/1539684/pexels-photo-1539684.jpeg?auto=compress&cs=tinysrgb&w=500',
    order: 2
  },
  {
    id: 'parrilla',
    name: 'Cortes de Parrilla',
    description: 'Ideales para asados y parrilladas familiares',
    image: 'https://images.pexels.com/photos/1199960/pexels-photo-1199960.jpeg?auto=compress&cs=tinysrgb&w=500',
    order: 3
  },
  {
    id: 'pollo',
    name: 'Pollo',
    description: 'Pollo fresco y de corral, múltiples cortes disponibles',
    image: 'https://images.pexels.com/photos/2233729/pexels-photo-2233729.jpeg?auto=compress&cs=tinysrgb&w=500',
    order: 4
  },
  {
    id: 'cerdo',
    name: 'Cerdo',
    description: 'Cortes selectos de cerdo, tiernos y sabrosos',
    image: 'https://images.pexels.com/photos/4079520/pexels-photo-4079520.jpeg?auto=compress&cs=tinysrgb&w=500',
    order: 5
  },
  {
    id: 'cazuela',
    name: 'Cazuela',
    description: 'Carnes especiales para preparar deliciosas cazuelas',
    image: 'https://images.pexels.com/photos/5737472/pexels-photo-5737472.jpeg?auto=compress&cs=tinysrgb&w=500',
    order: 6
  },
  {
    id: 'ovino',
    name: 'Ovino',
    description: 'Cordero y oveja de la mejor calidad',
    image: 'https://images.pexels.com/photos/1458668/pexels-photo-1458668.jpeg?auto=compress&cs=tinysrgb&w=500',
    order: 7
  },
  {
    id: 'conejo',
    name: 'Conejo',
    description: 'Carne blanca, baja en grasa y alta en proteínas',
    image: 'https://images.pexels.com/photos/7626508/pexels-photo-7626508.jpeg?auto=compress&cs=tinysrgb&w=500',
    order: 8
  },
  {
    id: 'embutidos',
    name: 'Longanizas/Chorizos/Prietas',
    description: 'Embutidos artesanales de la casa',
    image: 'https://images.pexels.com/photos/5696528/pexels-photo-5696528.jpeg?auto=compress&cs=tinysrgb&w=500',
    order: 9
  }
];

export const products: Product[] = [
  // Vacuno
  {
    id: 'lomo-liso',
    categoryId: 'vacuno',
    name: 'Lomo Liso',
    description: 'Ideal para bistec, medallones, carpaccio. Corte tierno y magro.',
    price: 15990,
    image: 'https://images.pexels.com/photos/1539684/pexels-photo-1539684.jpeg?auto=compress&cs=tinysrgb&w=400',
    stock: 25
  },
  {
    id: 'asiento',
    categoryId: 'vacuno',
    name: 'Asiento',
    description: 'Perfecto para guisos, estofados y preparaciones largas.',
    price: 7990,
    image: 'https://images.pexels.com/photos/3997609/pexels-photo-3997609.jpeg?auto=compress&cs=tinysrgb&w=400',
    stock: 30
  },
  {
    id: 'plateada',
    categoryId: 'vacuno',
    name: 'Plateada',
    description: 'Excelente para cazuelas, guisos y preparaciones al horno.',
    price: 9990,
    image: 'https://images.pexels.com/photos/1539684/pexels-photo-1539684.jpeg?auto=compress&cs=tinysrgb&w=400',
    stock: 20
  },
  
  // Premium
  {
    id: 'filete',
    categoryId: 'premium',
    name: 'Filete',
    description: 'El corte más tierno y exclusivo, perfecto para ocasiones especiales.',
    price: 24990,
    image: 'https://images.pexels.com/photos/1539684/pexels-photo-1539684.jpeg?auto=compress&cs=tinysrgb&w=400',
    stock: 15
  },
  {
    id: 'lomo-vetado',
    categoryId: 'premium',
    name: 'Lomo Vetado',
    description: 'Jugoso y marmoleado, ideal para parrilla y plancha.',
    price: 19990,
    image: 'https://images.pexels.com/photos/1539684/pexels-photo-1539684.jpeg?auto=compress&cs=tinysrgb&w=400',
    stock: 18
  },
  
  // Parrilla
  {
    id: 'entraña',
    categoryId: 'parrilla',
    name: 'Entraña',
    description: 'Clásico de la parrilla, sabor intenso y textura única.',
    price: 12990,
    image: 'https://images.pexels.com/photos/1199960/pexels-photo-1199960.jpeg?auto=compress&cs=tinysrgb&w=400',
    stock: 22
  },
  {
    id: 'costillas',
    categoryId: 'parrilla',
    name: 'Costillas de Vacuno',
    description: 'Perfectas para asados largos, sabor incomparable.',
    price: 8990,
    image: 'https://images.pexels.com/photos/1199960/pexels-photo-1199960.jpeg?auto=compress&cs=tinysrgb&w=400',
    stock: 25
  },
  
  // Pollo
  {
    id: 'pollo-entero',
    categoryId: 'pollo',
    name: 'Pollo Entero',
    description: 'Pollo fresco de corral, ideal para preparaciones familiares.',
    price: 4990,
    image: 'https://images.pexels.com/photos/2233729/pexels-photo-2233729.jpeg?auto=compress&cs=tinysrgb&w=400',
    stock: 40
  },
  {
    id: 'pechuga',
    categoryId: 'pollo',
    name: 'Pechuga de Pollo',
    description: 'Corte magro y versátil, perfecto para dietas saludables.',
    price: 6990,
    image: 'https://images.pexels.com/photos/2233729/pexels-photo-2233729.jpeg?auto=compress&cs=tinysrgb&w=400',
    stock: 35
  },
  
  // Cerdo
  {
    id: 'lomo-cerdo',
    categoryId: 'cerdo',
    name: 'Lomo de Cerdo',
    description: 'Tierno y jugoso, ideal para preparaciones al horno.',
    price: 8990,
    image: 'https://images.pexels.com/photos/4079520/pexels-photo-4079520.jpeg?auto=compress&cs=tinysrgb&w=400',
    stock: 20
  },
  {
    id: 'costillas-cerdo',
    categoryId: 'cerdo',
    name: 'Costillas de Cerdo',
    description: 'Perfectas para barbacoa y preparaciones ahumadas.',
    price: 7990,
    image: 'https://images.pexels.com/photos/4079520/pexels-photo-4079520.jpeg?auto=compress&cs=tinysrgb&w=400',
    stock: 18
  },
  
  // Embutidos
  {
    id: 'longaniza',
    categoryId: 'embutidos',
    name: 'Longaniza Casera',
    description: 'Longaniza artesanal con especias tradicionales.',
    price: 5990,
    image: 'https://images.pexels.com/photos/5696528/pexels-photo-5696528.jpeg?auto=compress&cs=tinysrgb&w=400',
    stock: 30
  },
  {
    id: 'chorizo',
    categoryId: 'embutidos',
    name: 'Chorizo Parrillero',
    description: 'Chorizo especial para parrilla, sabor intenso.',
    price: 6990,
    image: 'https://images.pexels.com/photos/5696528/pexels-photo-5696528.jpeg?auto=compress&cs=tinysrgb&w=400',
    stock: 25
  }
];