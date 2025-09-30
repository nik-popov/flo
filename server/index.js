const express = require('express');
const cors = require('cors');

const { stores, getStoreById } = require('./src/data/stores');
const { getStoresNearby, getInventoryForStore } = require('./src/services/storeService');
const { getProductsCatalog } = require('./src/services/productService');
const { validateOrderPayload } = require('./src/services/validation');
const {
  createOrder,
  orders,
  getOrders,
  getOrderById,
  updateOrderStatus,
  ORDER_STATUS_SEQUENCE,
} = require('./src/services/orderService');

const PORT = process.env.PORT || 4000;

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/stores', (req, res) => {
  const { lat, lng, radius = 10, q } = req.query;
  const location =
    lat && lng
      ? {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
        }
      : null;

  const options = {
    radius: Number(radius),
    query: q,
  };

  const nearbyStores = getStoresNearby(stores, location, options);
  res.json({ stores: nearbyStores });
});

app.get('/api/products', (req, res) => {
  const { lat, lng, radius = 10, q, category, brand, sort, store: storeQuery } = req.query;

  const location =
    lat && lng
      ? {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
        }
      : null;

  const catalog = getProductsCatalog(stores, location, {
    radius: Number(radius),
    storeQuery,
    productQuery: q,
    category,
    brand,
    sortBy: sort,
  });

  res.json(catalog);
});

app.get('/api/stores/:storeId/inventory', (req, res) => {
  const { storeId } = req.params;
  const store = getStoreById(storeId);

  if (!store) {
    return res.status(404).json({ error: 'Store not found' });
  }

  const inventory = getInventoryForStore(storeId);
  return res.json({ store, inventory });
});

app.post('/api/orders', (req, res) => {
  const { isValid, errors } = validateOrderPayload(req.body);

  if (!isValid) {
    return res.status(400).json({ error: 'Invalid payload', details: errors });
  }

  const order = createOrder(req.body);
  return res.status(201).json({ order });
});

app.get('/api/orders', (req, res) => {
  const { contact } = req.query;
  const filters = {};
  if (typeof contact === 'string' && contact.trim()) {
    filters.contact = contact;
  }

  const results = getOrders(filters);
  return res.json({ orders: results });
});

app.get('/api/orders/:orderId', (req, res) => {
  const { orderId } = req.params;
  const order = getOrderById(orderId);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  return res.json({ order });
});

app.patch('/api/orders/:orderId/status', (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body || {};

  const order = getOrderById(orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  if (typeof status !== 'string' || !status.trim()) {
    return res.status(400).json({ error: 'Status code required' });
  }

  const normalizedStatus = status.trim();
  const isValidStatus = ORDER_STATUS_SEQUENCE.some((step) => step.code === normalizedStatus);
  if (!isValidStatus) {
    return res
      .status(400)
      .json({ error: 'Invalid status code', allowed: ORDER_STATUS_SEQUENCE.map((step) => step.code) });
  }

  const updatedOrder = updateOrderStatus(orderId, normalizedStatus);
  return res.json({ order: updatedOrder });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

module.exports = { app, orders };
