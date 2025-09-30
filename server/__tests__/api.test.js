const request = require('supertest');
const { app, orders } = require('../index');
const { stores, inventoryByStore } = require('../src/data/stores');

describe('Store API', () => {
  beforeEach(() => {
    orders.splice(0, orders.length);
  });

  it('should report health status', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('should list stores without location filter', async () => {
    const response = await request(app).get('/api/stores');
    expect(response.status).toBe(200);
    expect(response.body.stores.length).toBe(stores.length);
  });

  it('should filter stores by query', async () => {
    const response = await request(app).get('/api/stores').query({ q: 'mega' });
    expect(response.status).toBe(200);
    expect(response.body.stores).toHaveLength(1);
    expect(response.body.stores[0].name).toMatch(/megamart/i);
  });

  it('should compute nearby stores based on coordinates', async () => {
    const response = await request(app)
      .get('/api/stores')
      .query({ lat: 40.7127, lng: -74.0063, radius: 2 });

    expect(response.status).toBe(200);
    expect(response.body.stores.length).toBeGreaterThanOrEqual(1);
    expect(response.body.stores[0]).toHaveProperty('distanceKm');
  });

  it('should fetch inventory for a store', async () => {
    const store = stores[0];
    const response = await request(app).get(`/api/stores/${store.id}/inventory`);
    expect(response.status).toBe(200);
    expect(response.body.store.id).toBe(store.id);
    expect(Array.isArray(response.body.inventory)).toBe(true);
  });

  it('should aggregate products across stores', async () => {
    const response = await request(app).get('/api/products');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.products)).toBe(true);
    const apples = response.body.products.find((product) => product.sku === 'APL-001');
    expect(apples).toBeTruthy();
    expect(apples.storeCount).toBeGreaterThan(1);
    expect(apples.stores.every((option) => option.storeId)).toBe(true);
  });

  it('rejects invalid orders', async () => {
    const response = await request(app).post('/api/orders').send({});
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid payload');
  });

  it('accepts a valid order', async () => {
  const store = stores[0];
  const item = inventoryByStore[store.id][0];

    const orderPayload = {
      storeId: store.id,
      items: [
        {
          sku: item.sku,
          quantity: 2,
        },
      ],
      customerDetails: {
        name: 'Alex Shopper',
        contact: 'alex@example.com',
      },
      customerLocation: {
        address: '55 Market Street, Springfield',
      },
    };

    const response = await request(app).post('/api/orders').send(orderPayload);
    expect(response.status).toBe(201);
    expect(response.body.order).toHaveProperty('id');
    expect(orders).toHaveLength(1);
    expect(orders[0].items[0].sku).toBe(item.sku);
  });

  it('accepts a multi-store order payload', async () => {
    const [firstStore, secondStore] = stores;
    const firstItem = inventoryByStore[firstStore.id][0];
    const secondItem = inventoryByStore[secondStore.id][0];

    const orderPayload = {
      storeOrders: [
        {
          storeId: firstStore.id,
          items: [
            {
              sku: firstItem.sku,
              quantity: 1,
            },
          ],
        },
        {
          storeId: secondStore.id,
          items: [
            {
              sku: secondItem.sku,
              quantity: 2,
            },
          ],
        },
      ],
      customerDetails: {
        name: 'Jordan MultiStore',
        contact: 'jordan@example.com',
      },
      customerLocation: {
        address: '123 Multi Store Way, Springfield',
      },
    };

    const response = await request(app).post('/api/orders').send(orderPayload);
    expect(response.status).toBe(201);
    expect(response.body.order.storeOrders).toHaveLength(2);
    expect(orders).toHaveLength(1);
    expect(orders[0].storeOrders[1].items[0].sku).toBe(secondItem.sku);
  });
});
