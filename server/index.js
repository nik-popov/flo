const express = require('express');
const cors = require('cors');
const { randomUUID } = require('crypto');

const { stores, getStoreById } = require('./src/data/stores');
const { getStoresNearby, getInventoryForStore } = require('./src/services/storeService');
const { getProductsCatalog } = require('./src/services/productService');
const { validateOrderPayload } = require('./src/services/validation');

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
  const { lat, lng, radius = 10, q, category, sort, store: storeQuery } = req.query;

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

const orders = [];

app.post('/api/orders', (req, res) => {
  const { isValid, errors } = validateOrderPayload(req.body);

  if (!isValid) {
    return res.status(400).json({ error: 'Invalid payload', details: errors });
  }

  const order = {
    id: randomUUID(),
    placedAt: new Date().toISOString(),
    ...req.body,
  };

  orders.push(order);

  return res.status(201).json({ order });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

module.exports = { app, orders };
