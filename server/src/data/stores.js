const stores = [
  {
    id: 'store-101',
    name: 'Fresh Market Downtown',
  address: '123 Elm Street, Springfield, 10001',
    location: { lat: 40.71268, lng: -74.00622 },
    hours: '8:00 AM - 9:00 PM',
    deliveryEta: '45-60 min',
  },
  {
    id: 'store-202',
    name: 'Neighborhood Grocers',
  address: '456 Oak Avenue, Springfield, 10002',
    location: { lat: 40.72285, lng: -74.00111 },
    hours: '7:00 AM - 10:00 PM',
    deliveryEta: '30-45 min',
  },
  {
    id: 'store-303',
    name: 'MegaMart Springfield',
  address: '789 Pine Road, Springfield, 10003',
    location: { lat: 40.73542, lng: -73.99593 },
    hours: '24 hours',
    deliveryEta: '60-90 min',
  },
];

const inventoryByStore = {
  'store-101': [
    {
      sku: 'APL-001',
      name: 'Honeycrisp Apples',
      description: 'Fresh locally sourced apples.',
      category: 'Produce',
      price: 2.39,
      unit: 'lb',
      quantityAvailable: 140,
    },
    {
      sku: 'MLK-002',
      name: 'Organic Whole Milk',
      description: '1 gallon organic whole milk.',
      category: 'Dairy',
      price: 5.29,
      unit: 'gallon',
      quantityAvailable: 45,
    },
    {
      sku: 'BRT-003',
      name: 'Sourdough Bread',
      description: 'Artisan sourdough loaf baked daily.',
      category: 'Bakery',
      price: 4.5,
      unit: 'each',
      quantityAvailable: 30,
    },
    {
      sku: 'SNK-021',
      name: 'Trail Mix Variety Pack',
      description: 'Assorted nuts, dried fruit, and chocolate.',
      category: 'Snacks',
      price: 7.99,
      unit: 'pack',
      quantityAvailable: 85,
    },
  ],
  'store-202': [
    {
      sku: 'APL-001',
      name: 'Honeycrisp Apples',
      description: 'Fresh locally sourced apples.',
      category: 'Produce',
      price: 2.54,
      unit: 'lb',
      quantityAvailable: 100,
    },
    {
      sku: 'VEG-010',
      name: 'Mixed Salad Greens',
      description: 'A mix of spinach, arugula, and kale.',
      category: 'Produce',
      price: 4.19,
      unit: 'bag',
      quantityAvailable: 75,
    },
    {
      sku: 'EGG-012',
      name: 'Free-Range Eggs',
      description: 'One dozen large brown eggs.',
      category: 'Dairy',
      price: 4.75,
      unit: 'dozen',
      quantityAvailable: 90,
    },
    {
      sku: 'SNK-021',
      name: 'Trail Mix Variety Pack',
      description: 'Assorted nuts, dried fruit, and chocolate.',
      category: 'Snacks',
      price: 8.49,
      unit: 'pack',
      quantityAvailable: 95,
    },
  ],
  'store-303': [
    {
      sku: 'APL-001',
      name: 'Honeycrisp Apples',
      description: 'Fresh locally sourced apples.',
      category: 'Produce',
      price: 2.62,
      unit: 'lb',
      quantityAvailable: 110,
    },
    {
      sku: 'VEG-010',
      name: 'Mixed Salad Greens',
      description: 'A mix of spinach, arugula, and kale.',
      category: 'Produce',
      price: 3.95,
      unit: 'bag',
      quantityAvailable: 120,
    },
    {
      sku: 'CFE-020',
      name: 'Cold Brew Coffee Concentrate',
      description: 'Ready-to-mix cold brew concentrate.',
      category: 'Beverages',
      price: 12.99,
      unit: '32oz',
      quantityAvailable: 55,
    },
    {
      sku: 'CLN-022',
      name: 'Eco-Friendly Dish Soap',
      description: 'Biodegradable citrus-scented dish soap.',
      category: 'Household',
      price: 3.99,
      unit: '16oz',
      quantityAvailable: 75,
    },
  ],
};

const getStoreById = (storeId) => stores.find((store) => store.id === storeId);

const getInventoryByStoreId = (storeId) => inventoryByStore[storeId] || [];

module.exports = {
  stores,
  inventoryByStore,
  getStoreById,
  getInventoryByStoreId,
};
