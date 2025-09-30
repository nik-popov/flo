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
      brand: 'Orchard Fresh',
      price: 2.39,
      unit: 'lb',
      quantityAvailable: 140,
      imageUrl:
        'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=400&q=80',
    },
    {
      sku: 'MLK-002',
      name: 'Organic Whole Milk',
      description: '1 gallon organic whole milk.',
      category: 'Dairy',
      brand: 'Green Valley Dairy',
      price: 5.19,
      unit: 'gallon',
      quantityAvailable: 55,
      imageUrl:
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=400&q=80',
    },
    {
      sku: 'BRT-003',
      name: 'Sourdough Bread',
      description: 'Artisan sourdough loaf baked daily.',
      category: 'Bakery',
      brand: 'Sunrise Baking Co.',
      price: 4.5,
      unit: 'each',
      quantityAvailable: 36,
      imageUrl:
        'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?auto=format&fit=crop&w=400&q=80',
    },
    {
      sku: 'SNK-021',
      name: 'Trail Mix Variety Pack',
      description: 'Assorted nuts, dried fruit, and chocolate.',
      category: 'Snacks',
      brand: 'TrailMix Co.',
      price: 7.79,
      unit: 'pack',
      quantityAvailable: 90,
      imageUrl:
        'https://images.unsplash.com/photo-1589308078054-83216e1e4a62?auto=format&fit=crop&w=400&q=80',
    },
    {
      sku: 'CFE-020',
      name: 'Cold Brew Coffee Concentrate',
      description: 'Ready-to-mix cold brew concentrate.',
      category: 'Beverages',
      brand: 'BrewMaster Roasters',
      price: 12.59,
      unit: '32oz',
      quantityAvailable: 60,
      imageUrl:
        'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=400&q=80',
    },
    {
      sku: 'FZN-062',
      name: 'Frozen Berry Medley',
      description: 'Blueberries, raspberries, and blackberries flash frozen at peak ripeness.',
      category: 'Frozen',
      brand: 'Harvest Freezer Co.',
      price: 6.49,
      unit: '12oz',
      quantityAvailable: 70,
      imageUrl:
        'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80',
    },
    {
      sku: 'CHS-024',
      name: 'Aged Cheddar Cheese',
      description: '12-month aged farmhouse cheddar.',
      category: 'Dairy',
      brand: 'Heritage Creamery',
      price: 7.29,
      unit: '8oz',
      quantityAvailable: 48,
      imageUrl:
        'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=400&q=80',
    },
  ],
  'store-202': [
    {
      sku: 'APL-001',
      name: 'Honeycrisp Apples',
      description: 'Fresh locally sourced apples.',
      category: 'Produce',
      brand: 'Orchard Fresh',
      price: 2.58,
      unit: 'lb',
      quantityAvailable: 120,
      imageUrl:
        'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=400&q=80',
    },
    {
      sku: 'VEG-010',
      name: 'Mixed Salad Greens',
      description: 'A mix of spinach, arugula, and kale.',
      category: 'Produce',
      brand: 'Leafy Greens Collective',
      price: 4.09,
      unit: 'bag',
      quantityAvailable: 80,
      imageUrl:
        'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=400&q=80',
    },
    {
      sku: 'EGG-012',
      name: 'Free-Range Eggs',
      description: 'One dozen large brown eggs.',
      category: 'Dairy',
      brand: 'Happy Hens Farm',
      price: 4.85,
      unit: 'dozen',
      quantityAvailable: 100,
      imageUrl:
        'https://images.unsplash.com/photo-1517959105821-eaf2591984d8?auto=format&fit=crop&w=400&q=80',
    },
    {
      sku: 'SNK-021',
      name: 'Trail Mix Variety Pack',
      description: 'Assorted nuts, dried fruit, and chocolate.',
      category: 'Snacks',
      brand: 'TrailMix Co.',
      price: 8.39,
      unit: 'pack',
      quantityAvailable: 95,
      imageUrl:
        'https://images.unsplash.com/photo-1589308078054-83216e1e4a62?auto=format&fit=crop&w=400&q=80',
    },
    {
      sku: 'CFE-020',
      name: 'Cold Brew Coffee Concentrate',
      description: 'Ready-to-mix cold brew concentrate.',
      category: 'Beverages',
      brand: 'BrewMaster Roasters',
      price: 12.89,
      unit: '32oz',
      quantityAvailable: 52,
      imageUrl:
        'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=400&q=80',
    },
    {
      sku: 'DRK-090',
      name: 'Sparkling Water Variety Pack',
      description: '12-pack of naturally flavored sparkling water.',
      category: 'Beverages',
      brand: 'Cascade Fizz',
      price: 6.29,
      unit: '12pk',
      quantityAvailable: 130,
      imageUrl:
        'https://images.unsplash.com/photo-1527169402691-feff5539e52c?auto=format&fit=crop&w=400&q=80',
    },
    {
      sku: 'HHL-075',
      name: 'Bamboo Paper Towels',
      description: 'Sustainably sourced, extra-absorbent paper towels.',
      category: 'Household',
      brand: 'EcoShine Home',
      price: 5.99,
      unit: '6pk',
      quantityAvailable: 60,
      imageUrl:
        'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80',
    },
  ],
  'store-303': [
    {
      sku: 'APL-001',
      name: 'Honeycrisp Apples',
      description: 'Fresh locally sourced apples.',
      category: 'Produce',
      brand: 'Orchard Fresh',
      price: 2.52,
      unit: 'lb',
      quantityAvailable: 150,
      imageUrl:
        'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=400&q=80',
    },
    {
      sku: 'VEG-010',
      name: 'Mixed Salad Greens',
      description: 'A mix of spinach, arugula, and kale.',
      category: 'Produce',
      brand: 'Leafy Greens Collective',
      price: 3.89,
      unit: 'bag',
      quantityAvailable: 135,
      imageUrl:
        'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=400&q=80',
    },
    {
      sku: 'CFE-020',
      name: 'Cold Brew Coffee Concentrate',
      description: 'Ready-to-mix cold brew concentrate.',
      category: 'Beverages',
      brand: 'BrewMaster Roasters',
      price: 12.39,
      unit: '32oz',
      quantityAvailable: 58,
      imageUrl:
        'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=400&q=80',
    },
    {
      sku: 'CLN-022',
      name: 'Eco-Friendly Dish Soap',
      description: 'Biodegradable citrus-scented dish soap.',
      category: 'Household',
      brand: 'EcoShine Home',
      price: 3.89,
      unit: '16oz',
      quantityAvailable: 80,
      imageUrl:
        'https://images.unsplash.com/photo-1615485290382-7275d6b9a369?auto=format&fit=crop&w=400&q=80',
    },
    {
      sku: 'FZN-062',
      name: 'Frozen Berry Medley',
      description: 'Blueberries, raspberries, and blackberries flash frozen at peak ripeness.',
      category: 'Frozen',
      brand: 'Harvest Freezer Co.',
      price: 6.19,
      unit: '12oz',
      quantityAvailable: 90,
      imageUrl:
        'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80',
    },
    {
      sku: 'PRD-055',
      name: 'Plant Power Smoothie Packs',
      description: 'Ready-to-blend smoothies with spinach, mango, and chia.',
      category: 'Frozen',
      brand: 'VitalBlend',
      price: 8.49,
      unit: '4ct',
      quantityAvailable: 65,
      imageUrl:
        'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=400&q=80',
    },
    {
      sku: 'DRK-090',
      name: 'Sparkling Water Variety Pack',
      description: '12-pack of naturally flavored sparkling water.',
      category: 'Beverages',
      brand: 'Cascade Fizz',
      price: 5.99,
      unit: '12pk',
      quantityAvailable: 160,
      imageUrl:
        'https://images.unsplash.com/photo-1527169402691-feff5539e52c?auto=format&fit=crop&w=400&q=80',
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
