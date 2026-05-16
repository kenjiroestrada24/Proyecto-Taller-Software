require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./models');

const axios = require('axios'); // Asegúrate de tener axios en el backend o usa fetch
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Función para enviar correos mediante FormSubmit
const sendEmail = async (to, subject, text) => {
  try {
    // Usamos el endpoint de FormSubmit. 
    // Nota: El correo destino debe estar validado en FormSubmit la primera vez.
    await axios.post(`https://formsubmit.co/ajax/${process.env.EMAIL_USER}`, {
      _subject: subject,
      message: text,
      _replyto: process.env.EMAIL_USER,
      email_to: to // FormSubmit enviará el contenido a tu EMAIL_USER, pero incluimos el destino en el mensaje
    });
    console.log(`📧 Solicitud de correo enviada para ${to} vía FormSubmit`);
  } catch (error) {
    console.error('❌ Error enviando vía FormSubmit:', error.message);
  }
};

// RUTA DE REGISTRO DE TIENDA (Público)
app.post('/api/register-store', async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { email, password, storeName, description, category_id, location, image } = req.body;

    // 1. Crear Usuario (OWNER)
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await db.User.create({
      email,
      password: hashedPassword,
      role: 'OWNER'
    }, { transaction });

    // 2. Crear Tienda (PENDING)
    const store = await db.Store.create({
      name: storeName,
      description,
      category_id,
      location,
      image,
      owner_id: user.id,
      status: 'pending'
    }, { transaction });

    await transaction.commit();
    res.status(201).json({ message: 'Solicitud enviada correctamente. Espera la aprobación del administrador.', storeId: store.id });
  } catch (error) {
    if (transaction) await transaction.rollback();
    
    // Mejorar el mensaje de error para validaciones de Sequelize
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
    }
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
    }
    
    console.error('🔥 Error en el registro:', error);
    res.status(500).json({ error: error.message });
  }
});

// RUTA DE LOGIN
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.User.findOne({ 
      where: { email },
      include: [{ model: db.Store }] 
    });

    if (!user) {
      console.log(`❌ Intento de login fallido: Usuario no encontrado (${email})`);
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`❌ Intento de login fallido: Contraseña incorrecta para ${email}`);
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // El ADMIN no necesariamente tiene una tienda asociada en el modelo
    if (user.role === 'ADMIN') {
      console.log(`✅ Login exitoso: SuperAdmin (${email})`);
      return res.json({ role: user.role, email: user.email });
    }

    // Verificar si la tienda está activa si es un OWNER
    if (user.role === 'OWNER') {
      const store = user.Stores && user.Stores[0];
      if (!store) {
        console.log(`⚠️ Usuario ${email} no tiene tienda asociada.`);
        return res.status(404).json({ error: 'No tienes una tienda asociada.' });
      }
      
      if (store.status !== 'active') {
        console.log(`🚫 Tienda "${store.name}" (${email}) está en estado: ${store.status}`);
        return res.status(403).json({ error: `Tu tienda está en estado: ${store.status}. Espera la aprobación.` });
      }

      console.log(`✅ Login exitoso: Owner de "${store.name}" (${email})`);
      return res.json({ 
        role: user.role, 
        storeId: store.id,
        email: user.email 
      });
    }

    res.json({ role: user.role, email: user.email });
  } catch (error) {
    console.error('🔥 Error en el login:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// RUTAS DE TIENDAS (CRUD SuperAdmin)
app.get('/api/stores', async (req, res) => {
  try {
    const stores = await db.Store.findAll({ include: [db.Category, db.User] });
    res.json(stores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stores/:id', async (req, res) => {
  try {
    const store = await db.Store.findByPk(req.params.id, { include: [db.Category, db.User] });
    if (!store) return res.status(404).json({ message: 'Tienda no encontrada' });
    res.json(store);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/stores', async (req, res) => {
  try {
    const store = await db.Store.create(req.body);
    res.status(201).json(store);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/stores/:id', async (req, res) => {
  try {
    const oldStore = await db.Store.findByPk(req.params.id, { include: db.User });
    const { status } = req.body;
    
    await db.Store.update(req.body, { where: { id: req.params.id } });

    // Si el estado cambió de pending a active, enviar correo
    if (oldStore && oldStore.status === 'pending' && status === 'active' && oldStore.User) {
      await sendEmail(
        oldStore.User.email,
        '¡Tu tienda ha sido aprobada! - MultiShop',
        `Hola,\n\nTu tienda "${oldStore.name}" ha sido aprobada por el administrador. Ya puedes iniciar sesión y empezar a subir tus productos.\n\nSaludos,\nEquipo de MultiShop`
      );
    }

    res.json({ message: 'Tienda actualizada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/stores/:id', async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const store = await db.Store.findByPk(req.params.id, { include: db.User });
    
    if (!store) {
      return res.status(404).json({ message: 'Tienda no encontrada' });
    }

    // Enviar correo de rechazo si la tienda estaba pendiente
    if (store.status === 'pending' && store.User) {
        await sendEmail(
            store.User.email,
            'Solicitud de tienda rechazada - MultiShop',
            `Hola,\n\nLamentamos informarte que tu solicitud para la tienda "${store.name}" ha sido rechazada por el administrador.\n\nSaludos,\nEquipo de MultiShop`
        );
    }

    const userId = store.owner_id;

    // 1. Eliminar la tienda
    await db.Store.destroy({ where: { id: req.params.id }, transaction });

    // 2. Eliminar al usuario asociado si existe y no es el SuperAdmin
    if (userId && userId !== 1) { // Evitamos borrar al admin principal por accidente
      await db.User.destroy({ where: { id: userId }, transaction });
      console.log(`🗑️ Usuario asociado (${userId}) eliminado junto con la tienda.`);
    }

    await transaction.commit();
    res.json({ message: 'Tienda y usuario asociados eliminados correctamente' });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error('🔥 Error eliminando tienda y usuario:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// RUTAS DE PRODUCTOS (CRUD Owner)
app.get('/api/products/store/:storeId', async (req, res) => {
  try {
    const products = await db.Product.findAll({ where: { store_id: req.params.storeId } });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const product = await db.Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    await db.Product.update(req.body, { where: { id: req.params.id } });
    res.json({ message: 'Producto actualizado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await db.Product.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// RUTA DE VENTAS (Finalizar Compra)
app.post('/api/sales', async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { customer_email, total, items, payment_method } = req.body;

    console.log(`📦 Procesando venta para: ${customer_email}, Total: ${total}`);

    if (!customer_email || !items || items.length === 0) {
      throw new Error('Datos de compra incompletos');
    }

    // 1. Crear la venta
    const sale = await db.Sale.create({
      customer_email,
      total: parseFloat(total),
      payment_method,
      status: 'completed'
    }, { transaction });

    // 2. Crear los items y descontar stock
    let itemsList = '';
    for (const item of items) {
      const price = parseFloat(item.price);
      const quantity = parseInt(item.quantity);

      await db.SaleItem.create({
        sale_id: sale.id,
        product_id: item.product_id,
        quantity: quantity,
        price: price
      }, { transaction });

      const product = await db.Product.findByPk(item.product_id);
      if (product) {
        itemsList += `- ${product.name} x${quantity}: $${(price * quantity).toFixed(2)}\n`;
        // Actualizar stock de forma segura
        const newStock = Math.max(0, product.stock - quantity);
        await product.update({ stock: newStock }, { transaction });
      }
    }

    await transaction.commit();
    console.log(`✅ Venta #${sale.id} completada exitosamente.`);

    // 3. Enviar correo de confirmación de compra (fuera de la transacción)
    try {
        await sendEmail(
            customer_email,
            'Confirmación de Compra - MultiShop',
            `¡Hola!\n\nGracias por tu compra en MultiShop. Aquí tienes el resumen de tu pedido:\n\n${itemsList}\nTotal: $${parseFloat(total).toFixed(2)}\nMétodo de pago: ${payment_method}\n\nTu pedido está siendo procesado. ¡Gracias por confiar en nosotros!`
        );
    } catch (mailErr) {
        console.error('⚠️ Venta realizada pero el correo falló:', mailErr.message);
    }

    res.status(201).json({ message: 'Compra realizada con éxito', saleId: sale.id });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error('🔥 Error crítico en la venta:', error.message);
    res.status(500).json({ error: error.message || 'Error interno al procesar la venta' });
  }
});

// ESTADÍSTICAS
app.get('/api/stats/global', async (req, res) => {
  try {
    const stores = await db.Store.count();
    const products = await db.Product.count();
    const sales = await db.Sale.count();
    const totalRevenue = await db.Sale.sum('total') || 0;
    res.json({ stores, products, sales, totalRevenue });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stats/store/:storeId', async (req, res) => {
  try {
    const productsCount = await db.Product.count({ where: { store_id: req.params.storeId } });
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    monday.setHours(0, 0, 0, 0);

    const storeProducts = await db.Product.findAll({ 
      where: { store_id: req.params.storeId },
      attributes: ['id']
    });
    const productIds = storeProducts.map(p => p.id);

    const weeklySales = await db.SaleItem.sum('price', {
      where: {
        product_id: productIds,
        createdAt: { [db.Sequelize.Op.gte]: monday }
      }
    }) || 0;

    const weeklyData = [
      { name: 'Lun', ventas: Math.floor(Math.random() * 200) },
      { name: 'Mar', ventas: Math.floor(Math.random() * 200) },
      { name: 'Mie', ventas: Math.floor(Math.random() * 200) },
      { name: 'Jue', ventas: Math.floor(Math.random() * 200) },
      { name: 'Vie', ventas: Math.floor(Math.random() * 200) },
      { name: 'Sab', ventas: Math.floor(Math.random() * 200) },
      { name: 'Dom', ventas: Math.floor(Math.random() * 200) },
    ];

    res.json({ productsCount, weeklySales, weeklyData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const categories = await db.Category.findAll();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('API de ProyectoSoftware funcionando 🚀');
});

// Inicializar Base de Datos y Modelos
const startServer = async () => {
  await db.init();
  
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  });
};

startServer();
