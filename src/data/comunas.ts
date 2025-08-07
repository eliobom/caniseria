export interface ComunaData {
  id: string;
  name: string;
  deliveryPrice: number;
  estimatedTime: string;
  isActive: boolean;
  zone: 'centro' | 'norte' | 'sur' | 'oriente' | 'poniente';
}

export const comunasData: ComunaData[] = [
  {
    id: '1',
    name: 'Las Condes',
    deliveryPrice: 2500,
    estimatedTime: '30-45 minutos',
    isActive: true,
    zone: 'oriente'
  },
  {
    id: '2',
    name: 'Providencia',
    deliveryPrice: 2000,
    estimatedTime: '30-45 minutos',
    isActive: true,
    zone: 'centro'
  },
  {
    id: '3',
    name: 'Santiago',
    deliveryPrice: 1500,
    estimatedTime: '25-40 minutos',
    isActive: true,
    zone: 'centro'
  },
  {
    id: '4',
    name: 'Ñuñoa',
    deliveryPrice: 2000,
    estimatedTime: '35-50 minutos',
    isActive: true,
    zone: 'centro'
  },
  {
    id: '5',
    name: 'Maipú',
    deliveryPrice: 3500,
    estimatedTime: '50-70 minutos',
    isActive: true,
    zone: 'poniente'
  },
  {
    id: '6',
    name: 'La Florida',
    deliveryPrice: 4000,
    estimatedTime: '60-80 minutos',
    isActive: true,
    zone: 'sur'
  }
  // ... agregar todas las comunas con sus respectivos precios
];

export const santiagoCommunas = comunasData.map(c => c.name);