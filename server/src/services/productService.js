const { getInventoryByStoreId } = require('../data/stores');
const { getStoresNearby } = require('./storeService');

const matchesProductQuery = (item, query) => {
  if (!query) return true;
  const q = query.toLowerCase();
  return [item.name, item.description, item.category, item.sku]
    .filter(Boolean)
    .some((value) => value.toLowerCase().includes(q));
};

const matchesCategory = (item, category) => {
  if (!category || category === 'all') return true;
  return item.category && item.category.toLowerCase() === category.toLowerCase();
};

const matchesBrand = (item, brand) => {
  if (!brand || brand === 'all') return true;
  if (!item.brand) return false;
  return item.brand.toLowerCase() === brand.toLowerCase();
};

const upsertProduct = (catalogMap, store, item) => {
  if (!catalogMap.has(item.sku)) {
    catalogMap.set(item.sku, {
      sku: item.sku,
      name: item.name,
      description: item.description,
      category: item.category,
      unit: item.unit,
      brand: item.brand || null,
      imageUrl: item.imageUrl || null,
      stores: [],
    });
  }

  const product = catalogMap.get(item.sku);
  if (!product.brand && item.brand) {
    product.brand = item.brand;
  }
  if (!product.imageUrl && item.imageUrl) {
    product.imageUrl = item.imageUrl;
  }
  product.stores.push({
    storeId: store.id,
    storeName: store.name,
    price: item.price,
    quantityAvailable: item.quantityAvailable,
    deliveryEta: store.deliveryEta,
    address: store.address,
  });
};

const finalizeCatalog = (catalogMap) => {
  return Array.from(catalogMap.values()).map((product) => {
    const prices = product.stores.map((provider) => provider.price);
    return {
      ...product,
      storeCount: product.stores.length,
      lowestPrice: Math.min(...prices),
      highestPrice: Math.max(...prices),
    };
  });
};

const sortProducts = (products, sortBy = 'name') => {
  switch (sortBy) {
    case 'price':
      return products.sort((a, b) => a.lowestPrice - b.lowestPrice);
    case 'availability':
      return products.sort((a, b) => b.storeCount - a.storeCount);
    case 'name':
    default:
      return products.sort((a, b) => a.name.localeCompare(b.name));
  }
};

const getProductsCatalog = (allStores, location, options = {}) => {
  const { radius = 10, storeQuery, productQuery, category, brand, sortBy = 'name' } = options;

  const nearbyStores = getStoresNearby(allStores, location, {
    radius,
    query: storeQuery,
  });

  const catalogMap = new Map();

  nearbyStores.forEach((store) => {
    const inventory = getInventoryByStoreId(store.id);
    inventory
      .filter((item) => matchesProductQuery(item, productQuery))
      .filter((item) => matchesCategory(item, category))
      .filter((item) => matchesBrand(item, brand))
      .forEach((item) => upsertProduct(catalogMap, store, item));
  });

  const catalog = finalizeCatalog(catalogMap);
  const sorted = sortProducts(catalog, sortBy);
  const categories = Array.from(
    new Set(sorted.map((product) => product.category).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b));
  const brands = Array.from(new Set(sorted.map((product) => product.brand).filter(Boolean))).sort(
    (a, b) => a.localeCompare(b),
  );

  return {
    products: sorted,
    categories,
    brands,
    availableStores: nearbyStores,
  };
};

module.exports = {
  getProductsCatalog,
};
