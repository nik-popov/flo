const { randomUUID } = require('crypto');
const { getStoreById, getInventoryByStoreId } = require('../data/stores');

const orders = [];

const ORDER_STATUS_SEQUENCE = [
  { code: 'placed', label: 'Order placed' },
  { code: 'confirmed', label: 'Confirmed' },
  { code: 'ready_for_pickup', label: 'Ready for pickup' },
];

const toStoreOrders = (payload = {}) => {
  if (Array.isArray(payload.storeOrders) && payload.storeOrders.length > 0) {
    return payload.storeOrders;
  }

  if (payload.storeId && Array.isArray(payload.items) && payload.items.length > 0) {
    return [
      {
        storeId: payload.storeId,
        items: payload.items,
      },
    ];
  }

  return [];
};

const enrichLineItems = (storeId, items = []) => {
  const inventory = getInventoryByStoreId(storeId) || [];

  return items.map((item) => {
    const catalogItem = inventory.find((inventoryItem) => inventoryItem.sku === item.sku) || {};
    const price = Number.isFinite(catalogItem.price) ? catalogItem.price : 0;
    const name = catalogItem.name;
    const unit = catalogItem.unit;
    const lineTotal = price * (item.quantity || 0);

    return {
      ...item,
      name,
      unit,
      price,
      lineTotal,
    };
  });
};

const enrichStoreOrders = (payload = {}) => {
  const baseOrders = toStoreOrders(payload);

  return baseOrders.map((storeOrder) => {
    const store = getStoreById(storeOrder.storeId) || {};
    const items = enrichLineItems(storeOrder.storeId, storeOrder.items);
    const subtotal = items.reduce((sum, item) => sum + (item.lineTotal || 0), 0);

    return {
      ...storeOrder,
      storeName: store.name,
      deliveryEta: store.deliveryEta,
      address: store.address,
      items,
      subtotal,
    };
  });
};

const buildSummary = (storeOrders = []) => {
  const itemCount = storeOrders.reduce(
    (total, store) => total + store.items.reduce((sum, item) => sum + (item.quantity || 0), 0),
    0,
  );
  const storeCount = storeOrders.length;
  const totalAmount = storeOrders.reduce((sum, store) => sum + (store.subtotal || 0), 0);

  return {
    itemCount,
    storeCount,
    total: Number(totalAmount.toFixed(2)),
  };
};

const createOrder = (payload = {}) => {
  const storeOrders = enrichStoreOrders(payload);
  const summary = buildSummary(storeOrders);
  const placedAt = new Date().toISOString();
  const statusFlow = ORDER_STATUS_SEQUENCE.map((step, index) => ({
    ...step,
    ...(index === 0 ? { timestamp: placedAt } : {}),
  }));
  const currentStatus = statusFlow[0] || null;

  const order = {
    id: randomUUID(),
    placedAt,
    statusFlow,
    currentStatus,
    ...payload,
    storeOrders,
    summary,
  };

  orders.push(order);

  return order;
};

const normalizeContact = (contact) =>
  typeof contact === 'string' ? contact.trim().toLowerCase() : '';

const getOrders = (filters = {}) => {
  const { contact } = filters;
  const normalizedContact = normalizeContact(contact);

  const results = orders.filter((order) => {
    if (!normalizedContact) return true;
    const orderContact = normalizeContact(order?.customerDetails?.contact);
    return orderContact === normalizedContact;
  });

  return results
    .slice()
    .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());
};

const getOrderById = (orderId) => orders.find((order) => order.id === orderId) || null;

const updateOrderStatus = (orderId, nextStatusCode) => {
  const order = getOrderById(orderId);
  if (!order) {
    return null;
  }

  const statusIndex = ORDER_STATUS_SEQUENCE.findIndex((status) => status.code === nextStatusCode);
  if (statusIndex === -1) {
    return null;
  }

  const existingFlowMap = new Map((order.statusFlow || []).map((step) => [step.code, step]));
  const nextStatusTimestamp = new Date().toISOString();

  order.statusFlow = ORDER_STATUS_SEQUENCE.map((step, index) => {
    const existing = existingFlowMap.get(step.code) || {};
    let timestamp = existing.timestamp || null;

    if (index === statusIndex) {
      timestamp = nextStatusTimestamp;
    } else if (index > statusIndex) {
      timestamp = null;
    }

    return {
      ...step,
      ...(timestamp ? { timestamp } : {}),
    };
  });

  order.currentStatus = order.statusFlow[statusIndex];

  return order;
};

const clearOrders = () => {
  orders.splice(0, orders.length);
};

module.exports = {
  orders,
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  clearOrders,
  ORDER_STATUS_SEQUENCE,
};
