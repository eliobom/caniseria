import { supabase } from '../src/lib/supabase';
import { categories, products } from '../src/data/mockData';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrateData() {
  console.log('Iniciando migración de datos a Supabase...');

  try {
    // Leer el esquema SQL
    console.log('Creando esquema de base de datos...');
    const schemaPath = path.join(__dirname, 'supabase-schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Ejecutar el esquema SQL directamente
    // Nota: En Supabase, no podemos ejecutar SQL directamente desde el cliente
    // Necesitamos crear las tablas y funciones a través del panel de administración de Supabase
    console.log('IMPORTANTE: Debes ejecutar el esquema SQL manualmente en el panel de administración de Supabase.');
    console.log('Continuando con la migración de datos asumiendo que las tablas ya existen...');

    // Insertar usuario administrador por defecto
    console.log('Creando usuario administrador por defecto...');
    const { error: adminError } = await supabase
      .from('admin_users')
      .upsert([
        {
          username: 'admin',
          password: '$2a$10$XpzYEVSRfHwXRwBjPgZ9Gu.fP1JoQQmIwfJMXhvFY5vP8hOzWF0Hy', // premium123 (hashed)
          email: 'admin@example.com'
        }
      ], { onConflict: 'username' });

    if (adminError) {
      console.error('Error al crear usuario administrador:', adminError);
    } else {
      console.log('Usuario administrador creado exitosamente.');
    }

    // Insertar categorías
    console.log('Insertando categorías...');
    const { error: categoriesError } = await supabase
      .from('categories')
      .upsert(categories.map(category => ({
        id: category.id,
        name: category.name,
        description: category.description,
        image: category.image,
        order: category.order
      })), { onConflict: 'id' });

    if (categoriesError) {
      console.error('Error al insertar categorías:', categoriesError);
    } else {
      console.log('Categorías insertadas exitosamente.');
    }

    // Insertar productos
    console.log('Insertando productos...');
    const { error: productsError } = await supabase
      .from('products')
      .upsert(products.map(product => ({
        id: product.id,
        category_id: product.categoryId,
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        stock: product.stock
      })), { onConflict: 'id' });

    if (productsError) {
      console.error('Error al insertar productos:', productsError);
    } else {
      console.log('Productos insertados exitosamente.');
    }

    // Crear datos de ejemplo para análisis
    console.log('Creando datos de análisis de ejemplo...');
    const { error: analyticsError } = await supabase
      .from('analytics')
      .upsert([
        {
          date: new Date().toISOString().split('T')[0],
          total_sales: 0,
          total_orders: 0,
          new_customers: 0
        }
      ], { onConflict: 'date' });

    if (analyticsError) {
      console.error('Error al crear datos de análisis:', analyticsError);
    } else {
      console.log('Datos de análisis creados exitosamente.');
    }

    console.log('Migración de datos completada.');
  } catch (error) {
    console.error('Ocurrió un error durante la migración:', error);
  }
}

migrateData();
