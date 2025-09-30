const { getStoreById, getInventoryByStoreId } = require('../data/stores');

const validateOrderPayload = (payload = {}) => {
  const errors = [];

  const hasStoreOrders = Array.isArray(payload.storeOrders) && payload.storeOrders.length > 0

  if (hasStoreOrders) {
    payload.storeOrders.forEach((storeOrder, orderIndex) => {
      if (!storeOrder || typeof storeOrder !== 'object') {
        errors.push(`storeOrders[${orderIndex}] must be an object`)
        return
      }

      const { storeId, items } = storeOrder
      if (!storeId) {
        errors.push(`storeOrders[${orderIndex}].storeId is required`)
      } else if (!getStoreById(storeId)) {
        errors.push(`Unknown storeId: ${storeId}`)
      }

      if (!Array.isArray(items) || items.length === 0) {
        errors.push(`storeOrders[${orderIndex}] must include at least one item`)
        return
      }

      const inventory = getInventoryByStoreId(storeId || '')
      items.forEach((item, itemIndex) => {
        if (!item || typeof item !== 'object') {
          errors.push(`storeOrders[${orderIndex}].items[${itemIndex}] must be an object`)
          return
        }
        if (!item.sku) {
          errors.push(`storeOrders[${orderIndex}].items[${itemIndex}] is missing sku`)
        }
        if (typeof item.quantity !== 'number' || item.quantity <= 0) {
          errors.push(
            `storeOrders[${orderIndex}].items[${itemIndex}] must have a quantity greater than 0`
          )
        }

        const catalogItem = inventory.find((invItem) => invItem.sku === item.sku)
        if (!catalogItem) {
          errors.push(`Item ${item.sku} is not sold at store ${storeId}`)
        } else if (item.quantity > catalogItem.quantityAvailable) {
          errors.push(
            `Item ${item.sku} exceeds available quantity (${catalogItem.quantityAvailable})`
          )
        }
      })
    })
  } else {
    if (!payload.storeId) {
      errors.push('storeId is required')
    } else if (!getStoreById(payload.storeId)) {
      errors.push(`Unknown storeId: ${payload.storeId}`)
    }

    if (!Array.isArray(payload.items) || payload.items.length === 0) {
      errors.push('At least one item is required')
    } else {
      const inventory = getInventoryByStoreId(payload.storeId || '')
      payload.items.forEach((item, index) => {
        if (!item || typeof item !== 'object') {
          errors.push(`Item at index ${index} must be an object`)
          return
        }
        if (!item.sku) {
          errors.push(`Item at index ${index} is missing sku`)
        }
        if (typeof item.quantity !== 'number' || item.quantity <= 0) {
          errors.push(`Item at index ${index} must have a quantity greater than 0`)
        }

        const catalogItem = inventory.find((invItem) => invItem.sku === item.sku)
        if (!catalogItem) {
          errors.push(`Item ${item.sku} is not sold at store ${payload.storeId}`)
        } else if (item.quantity > catalogItem.quantityAvailable) {
          errors.push(
            `Item ${item.sku} exceeds available quantity (${catalogItem.quantityAvailable})`
          )
        }
      })
    }
  }

  if (payload.customerDetails) {
    const { name, contact } = payload.customerDetails;
    if (!name) {
      errors.push('customerDetails.name is required');
    }
    if (!contact) {
      errors.push('customerDetails.contact is required');
    }
  } else {
    errors.push('customerDetails is required');
  }

  const location = payload.customerLocation;
  if (location) {
    const hasCoordinates =
      typeof location.lat === 'number' && typeof location.lng === 'number';
    const hasAddress = typeof location.address === 'string' && location.address.trim().length > 0;

    if (!hasCoordinates && !hasAddress) {
      errors.push('customerLocation must include coordinates or address');
    }
  } else {
    errors.push('customerLocation is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validateOrderPayload,
};
