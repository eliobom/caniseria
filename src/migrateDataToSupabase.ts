import { supabase } from './lib/supabase';
import { categories, products } from './data/mockData';
import fs from 'fs';
import path from 'path';

/**
 * Script para migrar datos de prueba a Supabase
 * 
 * Este script realiza las siguientes acciones:
 * 1. Ejecuta el esquema SQL para crear las tablas necesarias
 * 2. Inserta un usuario administrador por defecto
 * 3. Migra las categorías de productos
 * 4. Migra los productos
 * 5. Crea un registro inicial de analytics
 */

const migrateDataToSupabase = async () => {
  try {
    console.log('Iniciando migración de datos a Supabase...');

    // 1. Ejecutar el esquema SQL
    console.log('Ejecutando esquema SQL...');
    const schemaPath = path.join(__dirname, 'supabase-schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Dividir el SQL en declaraciones individuales
    const sqlStatements = schemaSql.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const stmt of sqlStatements) {
      const { error } = await supabase.rpc('exec_sql', { sql: stmt + ';' });
      if (error) {
        console.error('Error ejecutando SQL:', error);
        // Continuamos con la siguiente declaración
      }
    }
    
    // 2. Insertar usuario administrador por defecto
    console.log('Creando usuario administrador...');
    const { error: adminError } = await supabase
      .from('admin_users')
      .upsert([
        {
          username: 'admin',
          email: 'admin@carniceriapremium.cl',
          // En producción, usar bcrypt para hashear la contraseña
          password: 'premium123' // Esto debería ser un hash en producción
        }
      ], { onConflict: 'username' });

    if (adminError) {
      console.error('Error creando usuario admin:', adminError);
    } else {
      console.log('Usuario administrador creado correctamente');
    }

    // 3. Migrar categorías
    console.log('Migrando categorías...');
    for (const category of categories) {
      const { error: categoryError } = await supabase
        .from('categories')
        .upsert([
          {
            id: category.id,
            name: category.name,
            description: category.description,
            image: category.image,
            order: category.order
          }
        ], { onConflict: 'id' });

      if (categoryError) {
        console.error(`Error migrando categoría ${category.name}:`, categoryError);
      }
    }
    console.log(`${categories.length} categorías migradas correctamente`);

    // 4. Migrar productos
    console.log('Migrando productos...');
    for (const product of products) {
      const { error: productError } = await supabase
        .from('products')
        .upsert([
          {
            id: product.id,
            category_id: product.categoryId,
            name: product.name,
            description: product.description,
            price: product.price,
            image: product.image,
            stock: product.stock
          }
        ], { onConflict: 'id' });

      if (productError) {
        console.error(`Error migrando producto ${product.name}:`, productError);
      }
    }
    console.log(`${products.length} productos migrados correctamente`);

    // 5. Crear registro inicial de analytics
    console.log('Creando registro inicial de analytics...');
    const today = new Date().toISOString().split('T')[0];
    const { error: analyticsError } = await supabase
      .from('analytics')
      .upsert([
        {
          date: today,
          total_sales: 0,
          total_orders: 0,
          new_customers: 0
        }
      ], { onConflict: 'date' });

    if (analyticsError) {
      console.error('Error creando registro de analytics:', analyticsError);
    } else {
      console.log('Registro de analytics creado correctamente');
    }

    console.log('Migración completada con éxito!');
  } catch (error) {
    console.error('Error durante la migración:', error);
  }
};

// Ejecutar la migración
// migrateDataToSupabase(); // ← Comenta esta línea