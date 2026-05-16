const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const db = {};

// Configuración inicial de Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME || 'ProyectoSoftware',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: false,
  }
);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// DEFINICIÓN DE MODELOS (Inmediata para evitar undefined)
db.User = sequelize.define('User', {
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('ADMIN', 'OWNER'), defaultValue: 'OWNER' }
});

db.Category = sequelize.define('Category', {
  name: { type: DataTypes.STRING, allowNull: false, unique: true }
});

db.Store = sequelize.define('Store', {
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  image: { type: DataTypes.STRING },
  location: { type: DataTypes.STRING },
  map_url: { type: DataTypes.TEXT },
  phone: { type: DataTypes.STRING },
  hours: { type: DataTypes.STRING },
  facebook: { type: DataTypes.STRING },
  instagram: { type: DataTypes.STRING },
  status: { type: DataTypes.ENUM('active', 'suspended', 'pending'), defaultValue: 'active' },
});

db.Product = sequelize.define('Product', {
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  image: { type: DataTypes.STRING },
  stock: { type: DataTypes.INTEGER, defaultValue: 10 },
  status: { type: DataTypes.BOOLEAN, defaultValue: true }
});

db.Sale = sequelize.define('Sale', {
  customer_email: { type: DataTypes.STRING, allowNull: false },
  total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  payment_method: { type: DataTypes.STRING }
});

db.SaleItem = sequelize.define('SaleItem', {
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
});

// Relaciones
db.User.hasMany(db.Store, { foreignKey: 'owner_id' });
db.Store.belongsTo(db.User, { foreignKey: 'owner_id' });
db.Category.hasMany(db.Store, { foreignKey: 'category_id' });
db.Store.belongsTo(db.Category, { foreignKey: 'category_id' });
db.Store.hasMany(db.Product, { foreignKey: 'store_id' });
db.Product.belongsTo(db.Store, { foreignKey: 'store_id' });
db.Sale.hasMany(db.SaleItem, { foreignKey: 'sale_id' });
db.SaleItem.belongsTo(db.Sale, { foreignKey: 'sale_id' });
db.Product.hasMany(db.SaleItem, { foreignKey: 'product_id' });
db.SaleItem.belongsTo(db.Product, { foreignKey: 'product_id' });

db.init = async () => {
  try {
    // Intentar conectar y sincronizar
    await sequelize.authenticate();
    // CAMBIO: Usar alter: true en lugar de force: true para no borrar los datos cada vez
    await sequelize.sync({ alter: true });
    
    // Solo sembrar datos si la tabla está vacía
    const count = await db.Store.count();
    if (count === 0) {
      await seedFinalData(db);
    }
    console.log('✅ Base de datos real conectada y sincronizada.');
  } catch (error) {
    console.warn('⚠️ No se pudo conectar a MySQL. Usando modo MOCK.');
    console.error('Detalle del error:', error.message);
    setupMockModels(db);
  }
};

function setupMockModels(db) {
  const mockCategories = [
    { id: 1, name: 'Tecnología' },
    { id: 2, name: 'Comida' },
    { id: 3, name: 'Moda' },
    { id: 4, name: 'Hogar' },
    { id: 5, name: 'Deportes' },
    { id: 6, name: 'Salud' }
  ];

  const mockStores = [
    { id: 1, name: 'GigaTech Pro', category_id: 1, status: 'active', image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800', description: 'Tecnología de punta.', location: 'Av. Reforma 123, CDMX', Category: mockCategories[0] },
    { id: 2, name: 'Sushi Zen Master', category_id: 2, status: 'active', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800', description: 'Sushi tradicional.', location: 'Polanco 45, CDMX', Category: mockCategories[1] },
    { id: 3, name: 'Urban Wear Elite', category_id: 3, status: 'active', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800', description: 'Moda urbana.', location: 'Santa Fe Local 12, CDMX', Category: mockCategories[2] }
  ];

  const mockProducts = [
    { id: 1, name: 'MacBook Air M2', price: 1299.00, store_id: 1, stock: 10, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500' },
    { id: 2, name: 'iPhone 15 Pro', price: 999.00, store_id: 1, stock: 15, image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500' },
    { id: 3, name: 'Sashimi Premium', price: 18.00, store_id: 2, stock: 20, image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=500' }
  ];

  // Sobrescribir métodos para que devuelvan datos mock
  db.Store.findAll = async () => mockStores;
  db.Store.findByPk = async (id) => mockStores.find(s => s.id == id);
  db.Store.count = async () => mockStores.length;
  db.Store.create = async (data) => ({ ...data, id: mockStores.length + 1 });
  db.Store.update = async () => [1];
  db.Store.destroy = async () => 1;

  db.Category.findAll = async () => mockCategories;

  db.Product.findAll = async ({ where }) => where?.store_id ? mockProducts.filter(p => p.store_id == where.store_id) : mockProducts;
  db.Product.findByPk = async (id) => mockProducts.find(p => p.id == id);
  db.Product.count = async () => mockProducts.length;
  db.Product.create = async (data) => ({ ...data, id: mockProducts.length + 1 });
  db.Product.update = async () => [1];
  db.Product.destroy = async () => 1;

  db.Sale.count = async () => 0;
  db.Sale.sum = async () => 0;
  db.Sale.create = async (data) => ({ ...data, id: 1 });

  db.SaleItem.sum = async () => 0;
  db.SaleItem.create = async (data) => ({ ...data, id: 1 });

  db.sequelize.transaction = async () => ({ commit: async () => {}, rollback: async () => {} });
  db.Sequelize.Op = { gte: 'gte' };
}

async function seedFinalData(db) {
  const bcrypt = require('bcryptjs');
  const hashed = await bcrypt.hash('admin123', 10);
  await db.User.create({ email: 'admin@multishop.com', password: hashed, role: 'ADMIN' });
  const categories = ['Tecnología', 'Comida', 'Moda', 'Hogar', 'Deportes', 'Salud'];
  const createdCats = {};
  for (const name of categories) {
    const cat = await db.Category.create({ name });
    createdCats[name] = cat.id;
  }
  await db.Store.create({
    name: 'GigaTech Pro',
    description: 'Los mejores productos de Tecnología.',
    image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800',
    location: 'Av. Reforma 123, CDMX',
    category_id: createdCats['Tecnología'],
    status: 'active'
  });
  console.log('✅ Semilla completada.');
}

module.exports = db;
