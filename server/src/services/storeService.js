const { getInventoryByStoreId } = require('../data/stores');

const EARTH_RADIUS_KM = 6371;

const toRadians = (degrees) => (degrees * Math.PI) / 180;

const haversineDistanceKm = (pointA, pointB) => {
  if (!pointA || !pointB) return null;

  const dLat = toRadians(pointB.lat - pointA.lat);
  const dLng = toRadians(pointB.lng - pointA.lng);

  const lat1 = toRadians(pointA.lat);
  const lat2 = toRadians(pointB.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
};

const matchesQuery = (store, query) => {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    store.name.toLowerCase().includes(q) ||
    (store.address && store.address.toLowerCase().includes(q))
  );
};

const getStoresNearby = (stores, location, options = {}) => {
  const { radius = 10, query } = options;
  const radiusKm = Number.isFinite(radius) ? radius : 10;

  return stores
    .map((store) => {
      const distanceKm = location ? haversineDistanceKm(location, store.location) : null;
      return {
        ...store,
        distanceKm,
      };
    })
    .filter((store) => {
      if (!matchesQuery(store, query)) return false;
      if (location && store.distanceKm != null) {
        return store.distanceKm <= radiusKm;
      }
      return true;
    })
    .sort((a, b) => {
      if (a.distanceKm == null) return 1;
      if (b.distanceKm == null) return -1;
      return a.distanceKm - b.distanceKm;
    });
};

const getInventoryForStore = (storeId, searchTerm) => {
  const inventory = getInventoryByStoreId(storeId);
  if (!searchTerm) return inventory;

  const q = searchTerm.toLowerCase();
  return inventory.filter((item) => {
    return (
      item.name.toLowerCase().includes(q) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      (item.category && item.category.toLowerCase().includes(q)) ||
      item.sku.toLowerCase().includes(q)
    );
  });
};

module.exports = {
  getStoresNearby,
  getInventoryForStore,
  haversineDistanceKm,
};
