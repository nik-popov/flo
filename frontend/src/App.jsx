import { useCallback, useEffect, useMemo, useState } from 'react'
import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import './App.css'

const API_BASE_URL =
  (typeof window !== 'undefined' && window.__FLO_CONFIG?.apiBaseUrl) ||
  import.meta.env.VITE_API_BASE_URL ||
  ''

const fetchJson = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  const contentType = response.headers?.get?.('content-type') ?? ''
  const isJson = contentType.includes('application/json')

  if (!response.ok) {
    let errorPayload

    if (isJson) {
      try {
        errorPayload = await response.json()
      } catch (parseError) {
        console.warn('Unable to parse error response as JSON', parseError)
      }
    } else {
      try {
        errorPayload = await response.text()
      } catch (textError) {
        console.warn('Unable to read error response as text', textError)
      }
    }

    let message = `Request failed with status ${response.status}`
    let details

    if (errorPayload && typeof errorPayload === 'object') {
      if (typeof errorPayload.error === 'string') {
        message = errorPayload.error
      } else if (typeof errorPayload.message === 'string') {
        message = errorPayload.message
      }
      if (Array.isArray(errorPayload.details) && errorPayload.details.length) {
        details = errorPayload.details
      }
    } else if (typeof errorPayload === 'string' && errorPayload.trim()) {
      message = errorPayload.trim()
    }

    const error = new Error(message)
    error.status = response.status
    if (details) {
      error.details = details
    }
    throw error
  }

  if (isJson) {
    return response.json()
  }

  return response.text()
}

const FALLBACK_STORES = [
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
]

const FALLBACK_INVENTORY = {
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
}

const CUSTOMER_PROFILE = {
  member: {
    name: 'Alex Shopper',
    membershipId: 'FL-2048-XS',
    tier: 'Gold member',
    memberSince: 'March 12, 2022',
  },
  pointsBank: {
    balance: 18450,
    pending: 320,
    availableToRedeem: 12500,
    institution: 'Flo Points Bank',
    accountReference: 'Points vault ••••5123',
    autoRedeem: true,
    lastDeposit: 'Sep 20, 2025 · +580 pts',
  },
  contact: {
    email: 'alex@example.com',
    phone: '+1 (917) 555-0144',
    preferredContact: 'Email',
    supportPin: '9034',
    address: '123 Elm Street, Springfield, NY 10001',
  },
  paymentMethods: [
    {
      type: 'Card',
      label: 'Visa ending in 4242',
      status: 'Primary payment method',
      updated: 'Aug 11, 2025',
    },
    {
      type: 'Bank account',
      label: 'Community Credit Union • Checking ••••3181',
      status: 'Backup deposit account',
      updated: 'Jul 28, 2025',
    },
  ],
}

const toRadians = (degrees) => (degrees * Math.PI) / 180

const haversineDistanceKm = (pointA, pointB) => {
  if (!pointA || !pointB) return null

  const dLat = toRadians(pointB.lat - pointA.lat)
  const dLng = toRadians(pointB.lng - pointA.lng)

  const lat1 = toRadians(pointA.lat)
  const lat2 = toRadians(pointB.lat)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return 6371 * c
}

const parseDeliveryEtaMinutes = (etaText) => {
  if (typeof etaText !== 'string') return null
  const match = etaText.match(/(\d+)/)
  if (!match) return null
  const minutes = Number(match[1])
  return Number.isFinite(minutes) ? minutes : null
}

const formatCurrencyValue = (value) =>
  typeof value === 'number' && Number.isFinite(value) ? value.toFixed(2) : null

const formatDateTime = (value) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

const aggregateProducts = (stores, inventoryLookup) => {
  const catalog = new Map()

  stores.forEach((store) => {
    const inventory = inventoryLookup[store.id] ?? []
    inventory.forEach((item) => {
      if (!catalog.has(item.sku)) {
        catalog.set(item.sku, {
          sku: item.sku,
          name: item.name,
          description: item.description,
          category: item.category,
          brand: item.brand || null,
          unit: item.unit,
          imageUrl: item.imageUrl || null,
          stores: [],
        })
      }

      const entry = catalog.get(item.sku)
      if (!entry.brand && item.brand) {
        entry.brand = item.brand
      }
      if (!entry.imageUrl && item.imageUrl) {
        entry.imageUrl = item.imageUrl
      }
      entry.stores.push({
        storeId: store.id,
        storeName: store.name,
        price: item.price,
        quantityAvailable: item.quantityAvailable,
        deliveryEta: store.deliveryEta,
        address: store.address,
      })
    })
  })

  return Array.from(catalog.values()).map((product) => {
    const prices = product.stores.map((option) => option.price)
    return {
      ...product,
      storeCount: product.stores.length,
      lowestPrice: Math.min(...prices),
      highestPrice: Math.max(...prices),
    }
  })
}

const ProductCatalog = ({
  products,
  loading,
  error,
  onAddToCart,
  productFilter,
  onProductFilterChange,
  categories,
  activeCategory,
  onCategoryChange,
  brands = ['all'],
  activeBrand = 'all',
  onBrandChange = () => {},
  priceMin,
  priceMax,
  onPriceMinChange,
  onPriceMaxChange,
  maxDeliveryMinutes,
  onMaxDeliveryMinutesChange,
  storesLoading,
  storesError,
  manualLocationInput,
  onManualLocationChange,
  onManualSearch,
  onClearFilters,
  storeOptions = [],
  selectedStoreId = 'all',
  onSelectedStoreChange = () => {},
}) => {
  return (
    <div className="inventory inventory--with-sidebar">
      <aside className="inventory-sidebar">
        <div className="inventory-sidebar__card">
          <form className="filter-section" onSubmit={onManualSearch}>
            <h3 className="filter-heading">Location</h3>
            <label className="filter-label" htmlFor="filter-location">
              Search by city, zip, or store name
            </label>
            <div className="filter-input-row">
              <input
                id="filter-location"
                type="search"
                placeholder="e.g. 10001 or Downtown"
                value={manualLocationInput}
                onChange={(event) => onManualLocationChange(event.target.value)}
              />
              <button type="submit">Search</button>
            </div>
            {storesLoading && <span className="muted filter-status">Loading providers…</span>}
            {storesError && <p className="inline-alert">{storesError}</p>}
          </form>

          {storeOptions.length > 1 && (
            <div className="filter-section">
              <h3 className="filter-heading">Providers</h3>
              <label className="filter-label" htmlFor="filter-store">
                Show offers from
              </label>
              <select
                id="filter-store"
                value={selectedStoreId}
                onChange={(event) => onSelectedStoreChange(event.target.value)}
              >
                {storeOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.id === 'all' ? 'All providers' : option.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="filter-section">
            <h3 className="filter-heading">Products</h3>
            <label className="filter-label" htmlFor="filter-products">
              Keyword search
            </label>
            <input
              id="filter-products"
              type="search"
              placeholder="Search by product name or SKU"
              value={productFilter}
              onChange={(event) => onProductFilterChange(event.target.value)}
            />
          </div>

          {categories.length > 1 && (
            <div className="filter-section">
              <h4 className="filter-subheading">Category</h4>
              <div
                className="filter-chip-group"
                role="group"
                aria-label="Filter products by category"
              >
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={`filter-chip ${activeCategory === category ? 'active' : ''}`}
                    aria-pressed={activeCategory === category}
                    onClick={() => onCategoryChange(category)}
                  >
                    {category === 'all' ? 'All items' : category}
                  </button>
                ))}
              </div>
            </div>
          )}

          {brands.length > 1 && (
            <div className="filter-section">
              <h4 className="filter-subheading">Brand</h4>
              <p className="filter-hint">Quickly focus on specific product lines.</p>
              <div
                className="filter-chip-group"
                role="group"
                aria-label="Filter products by brand"
              >
                {brands.map((brand) => (
                  <button
                    key={brand}
                    type="button"
                    className={`filter-chip ${activeBrand === brand ? 'active' : ''}`}
                    aria-pressed={activeBrand === brand}
                    onClick={() => onBrandChange(brand)}
                  >
                    {brand === 'all' ? 'All brands' : brand}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="filter-section">
            <h4 className="filter-subheading">Price range ($)</h4>
            <div className="filter-field-group">
              <label htmlFor="filter-price-min">
                <span className="filter-label">Min</span>
                <input
                  id="filter-price-min"
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={priceMin}
                  onChange={(event) => onPriceMinChange(event.target.value)}
                />
              </label>
              <label htmlFor="filter-price-max">
                <span className="filter-label">Max</span>
                <input
                  id="filter-price-max"
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={priceMax}
                  onChange={(event) => onPriceMaxChange(event.target.value)}
                />
              </label>
            </div>
          </div>

          <div className="filter-section">
            <h4 className="filter-subheading">Delivery ETA (minutes)</h4>
            <label htmlFor="filter-delivery-max">
              <span className="filter-label">Maximum delivery time</span>
              <input
                id="filter-delivery-max"
                type="number"
                min="0"
                step="5"
                placeholder="Any"
                value={maxDeliveryMinutes}
                onChange={(event) => onMaxDeliveryMinutesChange(event.target.value)}
              />
            </label>
          </div>

          <div className="filter-actions">
            <button type="button" className="button-ghost" onClick={onClearFilters}>
              Clear filters
            </button>
          </div>
        </div>
      </aside>
      <div className="inventory-content">
        <div className="inventory-content__card">
          {error && <p className="inline-alert">{error}</p>}
          {loading ? (
            <p className="muted">Loading catalog…</p>
          ) : !products.length ? (
            <p className="muted">No items match your filters.</p>
          ) : (
            <ul className="inventory-list">
              {products.map((product) => {
                const storeOptions = [...(product.stores ?? [])].sort(
                  (a, b) => (a.price ?? Infinity) - (b.price ?? Infinity),
                )
                const [primaryOption, ...otherOptions] = storeOptions
                const priceCeiling = storeOptions.length
                  ? storeOptions[storeOptions.length - 1].price
                  : null
                const bestPrice = formatCurrencyValue(primaryOption?.price)
                const ceilingPrice = formatCurrencyValue(priceCeiling)
                const productInitial =
                  typeof product.name === 'string' && product.name.length
                    ? product.name.charAt(0).toUpperCase()
                    : '?'
                const imageAlt = product.name ? `${product.name} thumbnail` : 'Product thumbnail'
                const placeholderLabel = product.name
                  ? `No image available for ${product.name}`
                  : 'No image available'
                const isSingleProvider = product.storeCount === 1

                const summaryClassName = ['product-card__summary']
                if (isSingleProvider) {
                  summaryClassName.push('product-card__summary--solo')
                } else {
                  summaryClassName.push('product-card__summary--full', 'product-card__summary--compact')
                }

                const summaryClassNameString = summaryClassName.filter(Boolean).join(' ')

                const renderSummary = () => (
                  <div className={summaryClassNameString}>
                    <span className="product-card__summary-label">Best price</span>
                    <span className="product-card__summary-price">
                      {bestPrice ? (
                        <>
                          ${bestPrice}
                          {product.unit ? (
                            <span className="product-card__summary-unit"> / {product.unit}</span>
                          ) : null}
                        </>
                      ) : (
                        'Price unavailable'
                      )}
                    </span>
                    {bestPrice && ceilingPrice && ceilingPrice !== bestPrice && (
                      <span className="product-card__summary-meta">Up to ${ceilingPrice}</span>
                    )}
                    <span className="product-card__summary-meta">
                      {product.storeCount} offer{product.storeCount === 1 ? '' : 's'}
                    </span>
                  </div>
                )

                const summaryElement = primaryOption ? renderSummary() : null
                const headerClassNames = ['product-card__header']
                if (!isSingleProvider) {
                  headerClassNames.push('product-card__header--multi')
                }
                const headerClassNameString = headerClassNames.join(' ')

                return (
                  <li
                    key={product.sku}
                    className={`inventory-item product-card ${isSingleProvider ? 'product-card--solo' : ''}`.trim()}
                  >
                    <div className={headerClassNameString}>
                      <div className="product-card__lead">
                        <div className="product-card__media">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={imageAlt} loading="lazy" />
                          ) : (
                            <div
                              className="product-card__placeholder"
                              role="img"
                              aria-label={placeholderLabel}
                            >
                              <span>{productInitial}</span>
                            </div>
                          )}
                        </div>
                        <div className="product-card__details">
                          <h3>{product.name}</h3>
                          <p className="muted">{product.description}</p>
                          <div className="inventory-meta">
                            <span className="badge badge--subtle">{product.category}</span>
                            {product.brand && (
                              <span className="badge badge--outline">{product.brand}</span>
                            )}
                            <span className="inventory-meta__item">
                              <span className="inventory-meta__label">SKU</span>
                              <span className="inventory-meta__value">{product.sku}</span>
                            </span>
                            <span className="inventory-meta__item">
                              <span className="inventory-meta__label">Providers</span>
                              <span className="inventory-meta__value">
                                {product.storeCount}{' '}
                                {product.storeCount === 1 ? 'provider' : 'providers'}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                      {summaryElement}
                    </div>

                    {primaryOption && (
                      <div className="product-card__spotlight">
                        <div className="provider-option provider-option--primary">
                          <div className="provider-info">
                            <div className="provider-option__header">
                              <strong>{primaryOption.storeName}</strong>
                              <span className="provider-badge">Best value</span>
                            </div>
                            <p className="provider-price">
                              {bestPrice ? `$${bestPrice}` : 'Price unavailable'}
                              {primaryOption.quantityAvailable != null && (
                                <span className="provider-availability">
                                  {' '}
                                  · {primaryOption.quantityAvailable} available
                                </span>
                              )}
                            </p>
                            {primaryOption.deliveryEta && (
                              <span className="provider-eta">ETA {primaryOption.deliveryEta}</span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => onAddToCart(product, primaryOption)}
                            aria-label={`Add ${product.name} from ${primaryOption.storeName} to cart`}
                          >
                            Add to cart
                          </button>
                        </div>
                      </div>
                    )}

                    {otherOptions.length > 0 && (
                      <div className="product-card__providers">
                        <p className="price-summary">
                          Compare {otherOptions.length} more offer{otherOptions.length === 1 ? '' : 's'}
                        </p>
                        <ul className="provider-options">
                          {otherOptions.map((store) => {
                            const formattedPrice = formatCurrencyValue(store.price)
                            return (
                              <li key={store.storeId} className="provider-option">
                                <div className="provider-info">
                                  <div className="provider-option__header">
                                    <strong>{store.storeName}</strong>
                                  </div>
                                  <p className="provider-price">
                                    {formattedPrice ? `$${formattedPrice}` : 'Price unavailable'}
                                    {store.quantityAvailable != null && (
                                      <span className="provider-availability">
                                        {' '}
                                        · {store.quantityAvailable} available
                                      </span>
                                    )}
                                  </p>
                                  {store.deliveryEta && (
                                    <span className="provider-eta">ETA {store.deliveryEta}</span>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => onAddToCart(product, store)}
                                  aria-label={`Add ${product.name} from ${store.storeName} to cart`}
                                >
                                  Add to cart
                                </button>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

const CartToggle = ({ count, total, onToggle, isOpen }) => {
  const label = count ? `Cart (${count}) · $${total.toFixed(2)}` : 'Cart'
  return (
    <button
      type="button"
      className={`cart-toggle ${count ? 'cart-toggle--active' : 'cart-toggle--empty'}`}
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-controls="cart-drawer"
    >
      {label}
    </button>
  )
}

const CartDrawer = ({ open, onClose, children }) => {
  if (!open) return null
  return (
    <>
      <div className="cart-drawer__overlay" onClick={onClose} aria-hidden="true" />
      <aside
        id="cart-drawer"
        className="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-heading"
      >
        <header className="cart-drawer__header">
          <h2 id="cart-heading">Your cart</h2>
          <button type="button" className="link cart-drawer__close" onClick={onClose}>
            Close
          </button>
        </header>
        <div className="cart-drawer__content">{children}</div>
      </aside>
    </>
  )
}

const Cart = ({ items, onUpdateQuantity, onRemove, total }) => {
  if (!items.length) {
    return (
      <div className="cart cart--empty">
        <p className="muted">Add items from the catalog to create an order.</p>
      </div>
    )
  }

  const formattedTotal = formatCurrencyValue(total)
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)

  const storeGroups = []
  const storeMap = new Map()

  items.forEach((item) => {
    if (!storeMap.has(item.storeId)) {
      const group = {
        storeId: item.storeId,
        storeName: item.storeName,
        deliveryEta: item.deliveryEta,
        address: item.storeAddress,
        items: [],
        subtotal: 0,
      }
      storeMap.set(item.storeId, group)
      storeGroups.push(group)
    }

    const group = storeMap.get(item.storeId)
    group.items.push(item)
    group.subtotal += (item.price ?? 0) * item.quantity
    if (!group.deliveryEta && item.deliveryEta) {
      group.deliveryEta = item.deliveryEta
    }
    if (!group.address && item.storeAddress) {
      group.address = item.storeAddress
    }
  })

  return (
    <div className="cart cart--panel">
      <header className="cart__header">
        <h2>Items in your cart</h2>
        <span className="cart__count">
          {totalQuantity} item{totalQuantity === 1 ? '' : 's'}
        </span>
      </header>
      <ul className="cart-list">
        {storeGroups.map((store) => {
          const storeTotal = formatCurrencyValue(store.subtotal)
          return (
            <li key={store.storeId} className="cart-store">
              <article className="cart-store__card">
                <div className="cart-store__header">
                  <div className="cart-store__title">
                    <h3>{store.storeName}</h3>
                    <span className="cart-store__meta">
                      {store.items.length} item{store.items.length === 1 ? '' : 's'}
                      {storeTotal ? ` · $${storeTotal}` : ''}
                    </span>
                  </div>
                  {(store.deliveryEta || store.address) && (
                    <div className="cart-store__summary">
                      {store.deliveryEta ? (
                        <span className="cart-store__eta">ETA {store.deliveryEta}</span>
                      ) : null}
                      {store.address ? <span className="cart-store__address">{store.address}</span> : null}
                    </div>
                  )}
                </div>
                <ul className="cart-store__items">
                  {store.items.map((item) => {
                    const formattedPrice = formatCurrencyValue(item.price)
                    const lineSubtotal = (item.price ?? 0) * item.quantity
                    const formattedSubtotal = formatCurrencyValue(lineSubtotal)

                    return (
                      <li key={`${item.sku}-${item.storeId}`} className="cart-item">
                        <div className="cart-line">
                          <div className="cart-line__details">
                            <div className="cart-line__title">
                              <strong>{item.name}</strong>
                              <span className="cart-line__price">
                                {formattedPrice ? (
                                  <>
                                    ${formattedPrice}
                                    {item.unit ? <span className="cart-line__unit"> / {item.unit}</span> : null}
                                  </>
                                ) : (
                                  'Price unavailable'
                                )}
                              </span>
                            </div>
                            <div className="cart-line__meta">
                              <span className="badge badge--subtle">SKU {item.sku}</span>
                              {typeof item.quantityAvailable === 'number' ? (
                                <span className="cart-line__stock">{item.quantityAvailable} available</span>
                              ) : null}
                            </div>
                          </div>
                          <div className="cart-line__actions">
                            <div className="cart-line__qty">
                              <label htmlFor={`quantity-${item.sku}-${item.storeId}`}>Qty</label>
                              <input
                                id={`quantity-${item.sku}-${item.storeId}`}
                                type="number"
                                min="1"
                                max={item.quantityAvailable}
                                value={item.quantity}
                                onChange={(event) =>
                                  onUpdateQuantity(item.sku, item.storeId, Number(event.target.value))
                                }
                              />
                            </div>
                            {formattedSubtotal ? (
                              <span className="cart-line__subtotal">Subtotal ${formattedSubtotal}</span>
                            ) : null}
                            <button
                              type="button"
                              className="link cart-line__remove"
                              onClick={() => onRemove(item.sku, item.storeId)}
                              aria-label={`Remove ${item.name} from ${store.storeName}`}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </article>
            </li>
          )
        })}
      </ul>
      <footer className="cart-footer">
        <span className="cart-total-label">Order total</span>
        <span className="cart-total-amount">
          {formattedTotal ? `$${formattedTotal}` : '—'}
        </span>
      </footer>
    </div>
  )
}

const StatusBanner = ({ status }) => {
  if (!status) return null
  return <div className={`status-banner status-banner--${status.type}`}>{status.message}</div>
}

const CheckoutForm = ({
  customerName,
  customerContact,
  onCustomerNameChange,
  onCustomerContactChange,
  onSubmit,
  submitting,
}) => (
  <form className="checkout" onSubmit={onSubmit}>
    <div className="form-row">
      <label htmlFor="customer-name">Your name</label>
      <input
        id="customer-name"
        type="text"
        value={customerName}
        onChange={(event) => onCustomerNameChange(event.target.value)}
        placeholder="Alex Shopper"
        required
      />
    </div>
    <div className="form-row">
      <label htmlFor="customer-contact">Contact (email or phone)</label>
      <input
        id="customer-contact"
        type="text"
        value={customerContact}
        onChange={(event) => onCustomerContactChange(event.target.value)}
        placeholder="alex@example.com"
        required
      />
    </div>
    <button type="submit" disabled={submitting}>
      {submitting ? 'Placing order…' : 'Place order'}
    </button>
  </form>
)

const OrderStatusTimeline = ({ statusFlow = [], currentStatus }) => {
  if (!Array.isArray(statusFlow) || !statusFlow.length) {
    return <p className="muted">Status updates will appear here.</p>
  }

  const currentCode = currentStatus?.code

  return (
    <ol className="status-timeline">
      {statusFlow.map((step) => {
        const isActive = step.code === currentCode
        const isCompleted = Boolean(step.timestamp) && !isActive
        const className = [
          'status-step',
          isActive ? 'status-step--active' : '',
          isCompleted ? 'status-step--completed' : '',
        ]
          .filter(Boolean)
          .join(' ')

        return (
          <li key={step.code} className={className}>
            <span className="status-step__marker" aria-hidden="true" />
            <div className="status-step__content">
              <span className="status-step__label">{step.label}</span>
              {step.timestamp ? (
                <span className="status-step__timestamp">{formatDateTime(step.timestamp)}</span>
              ) : (
                <span className="status-step__timestamp muted">Pending</span>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

const OrderHistoryPanel = ({
  contactInput,
  onContactInputChange,
  onSubmitLookup,
  trackedContact,
  orders,
  loading,
  error,
  selectedOrder,
  onSelectOrder,
  onRefresh,
  onAdvanceStatus,
  advancingOrderId,
}) => {
  const hasOrders = Array.isArray(orders) && orders.length > 0
  const nextStatus = selectedOrder?.statusFlow?.find((step) => !step.timestamp) ?? null

  return (
    <section className="order-tracker">
      <header className="order-tracker__header">
        <div>
          <h2>Order history</h2>
          <p className="muted">Track the latest updates from recently placed orders.</p>
        </div>
        <div className="order-tracker__header-actions">
          <button
            type="button"
            className="button-ghost"
            onClick={onRefresh}
            disabled={!trackedContact || loading}
          >
            Refresh
          </button>
        </div>
      </header>

      <form className="order-tracker__lookup" onSubmit={onSubmitLookup}>
        <label className="filter-label" htmlFor="order-tracker-contact">
          Track by contact
        </label>
        <div className="order-tracker__lookup-row">
          <input
            id="order-tracker-contact"
            type="search"
            placeholder="Email or phone used at checkout"
            value={contactInput}
            onChange={(event) => onContactInputChange(event.target.value)}
          />
          <button type="submit" className="secondary" disabled={!contactInput.trim() || loading}>
            Track orders
          </button>
        </div>
        {trackedContact ? (
          <span className="order-tracker__status-info">
            Showing updates for <strong>{trackedContact}</strong>
          </span>
        ) : null}
      </form>

      {error ? <p className="inline-alert">{error}</p> : null}
      {loading ? <p className="muted">Loading order history…</p> : null}

      {hasOrders ? (
        <div className="order-history">
          <ul className="order-history__list">
            {orders.map((order) => {
              const summary = order.summary || {}
              const currentLabel = order.currentStatus?.label || 'In progress'
              const placedDisplay = formatDateTime(order.placedAt)
              const totalDisplay = formatCurrencyValue(summary.total) ?? '0.00'
              const isActive = selectedOrder?.id === order.id

              return (
                <li key={order.id}>
                  <button
                    type="button"
                    className={`order-card-trigger${isActive ? ' order-card-trigger--active' : ''}`}
                    onClick={() => onSelectOrder(order.id)}
                  >
                    <div className="order-card-trigger__top">
                      <span className="order-card-trigger__headline">
                        {summary.itemCount || 0} item{summary.itemCount === 1 ? '' : 's'} ·{' '}
                        {summary.storeCount || 0} provider{summary.storeCount === 1 ? '' : 's'}
                      </span>
                      <span className="order-card-trigger__total">${totalDisplay}</span>
                    </div>
                    <div className="order-card-trigger__meta">
                      <span className="badge badge--subtle">{currentLabel}</span>
                      {placedDisplay ? <span>{placedDisplay}</span> : null}
                      <span className="muted">#{order.id.slice(0, 8).toUpperCase()}</span>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>

          {selectedOrder ? (
            <div className="order-detail" aria-live="polite">
              <div className="order-detail__header">
                <div className="order-detail__meta">
                  <h3>Order {selectedOrder.id.slice(0, 8).toUpperCase()}</h3>
                  <span>
                    Placed {formatDateTime(selectedOrder.placedAt) || '—'} ·{' '}
                    {selectedOrder.summary?.itemCount || 0} item
                    {selectedOrder.summary?.itemCount === 1 ? '' : 's'} across{' '}
                    {selectedOrder.summary?.storeCount || 0}{' '}
                    {selectedOrder.summary?.storeCount === 1 ? 'provider' : 'providers'}
                  </span>
                </div>
                <div className="order-detail__actions">
                  <span className="badge badge--accent">
                    {selectedOrder.currentStatus?.label || 'In progress'}
                  </span>
                  {nextStatus?.code ? (
                    <button
                      type="button"
                      className="secondary"
                      onClick={() => onAdvanceStatus(selectedOrder.id, nextStatus.code)}
                      disabled={advancingOrderId === selectedOrder.id}
                    >
                      {advancingOrderId === selectedOrder.id
                        ? 'Updating…'
                        : `Advance to ${nextStatus.label}`}
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="order-detail__timeline">
                <OrderStatusTimeline
                  statusFlow={selectedOrder.statusFlow}
                  currentStatus={selectedOrder.currentStatus}
                />
              </div>

              <div className="order-detail__stores">
                {selectedOrder.storeOrders?.map((storeOrder) => (
                  <div key={storeOrder.storeId} className="order-detail__store">
                    <div className="order-detail__store-header">
                      <strong>{storeOrder.storeName || 'Provider'}</strong>
                      <span className="muted">{storeOrder.deliveryEta || 'ETA unavailable'}</span>
                    </div>
                    <ul className="order-detail__items">
                      {storeOrder.items?.map((item) => (
                        <li key={`${storeOrder.storeId}-${item.sku}`}>
                          <span>
                            {item.quantity}× {item.name || item.sku}
                          </span>
                          <span>${formatCurrencyValue(item.lineTotal) ?? '0.00'}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="order-detail__subtotal">
                      <span>Subtotal</span>
                      <span>${formatCurrencyValue(storeOrder.subtotal) ?? '0.00'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : !loading && trackedContact ? (
        <p className="muted">No orders found yet. We’ll post updates here once things change.</p>
      ) : !loading ? (
        <p className="muted">
          Enter the contact details used during checkout to follow your order status.
        </p>
      ) : null}
    </section>
  )
}

const CatalogPage = ({ catalogProps }) => (
  <div className="page-content">
    <section className="products-view">
      <header className="products-view__header">
        <h2>Browse products</h2>
        <p className="muted">
          Compare pricing and availability across providers, then add the best option to your cart.
        </p>
      </header>
      <ProductCatalog {...catalogProps} />
    </section>
  </div>
)

const OrdersPage = ({ orderHistoryProps }) => (
  <div className="page-content">
    <OrderHistoryPanel {...orderHistoryProps} />
  </div>
)

const CartPage = ({ cartProviderNote, cartProps, checkoutFormProps }) => (
  <div className="page-content">
    <section className="inventory-content__card cart-page">
      <p className="muted cart-drawer__note">{cartProviderNote}</p>
      <Cart {...cartProps} />
      <CheckoutForm {...checkoutFormProps} />
    </section>
  </div>
)

const ProfilePage = () => {
  const { member, pointsBank, contact, paymentMethods } = CUSTOMER_PROFILE
  const formatPoints = (value) => value.toLocaleString()

  return (
    <div className="page-content profile-page">
      <section className="inventory-content__card profile-summary">
        <header className="profile-summary__header">
          <h2>Account overview</h2>
          <p className="muted">
            Review membership details, reward balances, and the accounts linked to your Flo profile.
          </p>
        </header>
        <dl className="profile-summary__grid">
          <div>
            <dt>Member name</dt>
            <dd>{member.name}</dd>
          </div>
          <div>
            <dt>Membership tier</dt>
            <dd>{member.tier}</dd>
          </div>
          <div>
            <dt>Member ID</dt>
            <dd>{member.membershipId}</dd>
          </div>
          <div>
            <dt>Member since</dt>
            <dd>{member.memberSince}</dd>
          </div>
        </dl>
      </section>

      <section className="profile-grid">
        <article className="inventory-content__card profile-card">
          <header>
            <h3>Points &amp; rewards</h3>
            <p className="muted">
              Points bank keeps store loyalty credits ready to auto-apply at checkout.
            </p>
          </header>
          <ul className="profile-list">
            <li>
              <span>Points balance</span>
              <strong>{formatPoints(pointsBank.balance)} pts</strong>
            </li>
            <li>
              <span>Pending points</span>
              <span>{formatPoints(pointsBank.pending)} pts clearing in 24h</span>
            </li>
            <li>
              <span>Available to redeem</span>
              <span>{formatPoints(pointsBank.availableToRedeem)} pts</span>
            </li>
            <li>
              <span>Points bank</span>
              <span>{pointsBank.institution}</span>
            </li>
            <li>
              <span>Account reference</span>
              <span>{pointsBank.accountReference}</span>
            </li>
            <li>
              <span>Auto redeem</span>
              <span>{pointsBank.autoRedeem ? 'Enabled for delivery credits' : 'Disabled'}</span>
            </li>
            <li>
              <span>Last deposit</span>
              <span>{pointsBank.lastDeposit}</span>
            </li>
          </ul>
        </article>

        <article className="inventory-content__card profile-card">
          <header>
            <h3>Contact information</h3>
            <p className="muted">Update how couriers and support reach you.</p>
          </header>
          <ul className="profile-list">
            <li>
              <span>Email</span>
              <span>{contact.email}</span>
            </li>
            <li>
              <span>Phone</span>
              <span>{contact.phone}</span>
            </li>
            <li>
              <span>Preferred contact</span>
              <span>{contact.preferredContact}</span>
            </li>
            <li>
              <span>Support PIN</span>
              <span>{contact.supportPin}</span>
            </li>
            <li className="profile-list__address">
              <span>Default address</span>
              <span>{contact.address}</span>
            </li>
          </ul>
        </article>

        <article className="inventory-content__card profile-card">
          <header>
            <h3>Payment &amp; banking</h3>
            <p className="muted">Manage cards and settlement accounts tied to your orders.</p>
          </header>
          <ul className="profile-list">
            {paymentMethods.map((method) => (
              <li key={`${method.type}-${method.label}`}>
                <span>{method.label}</span>
                <span>
                  {method.status}
                  <br />
                  <small className="muted">Updated {method.updated}</small>
                </span>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  )
}

const DemoPage = ({ catalogProps, orderHistoryProps }) => (
  <div className="content-grid">
    <section className="products-view">
      <header className="products-view__header">
        <h2>Browse products</h2>
        <p className="muted">
          Compare pricing and availability across providers, then add the best option to your cart.
        </p>
      </header>
      <ProductCatalog {...catalogProps} />
    </section>
    <OrderHistoryPanel {...orderHistoryProps} />
  </div>
)

const MarketplaceNavigation = () => {
  const navItems = [
    { to: '/catalog', label: 'Catalog' },
    { to: '/orders', label: 'Orders' },
    { to: '/profile', label: 'Profile' },
    { to: '/cart', label: 'Cart' },
  ]

  return (
    <nav className="app-nav" aria-label="Marketplace navigation">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/catalog'}
          className={({ isActive }) =>
            `app-nav__link ${isActive ? 'app-nav__link--active' : ''}`.trim()
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

function App() {
  const location = useLocation()
  const DEFAULT_ZIP = '10001'
  const DEFAULT_RADIUS = 10
  const DEFAULT_DELIVERY_TIME = '30-60 min'

  const [coords, setCoords] = useState(null)
  const [manualLocationInput, setManualLocationInput] = useState(DEFAULT_ZIP)
  const [activeManualQuery, setActiveManualQuery] = useState('')
  const [stores, setStores] = useState([])
  const [storesLoading, setStoresLoading] = useState(false)
  const [storesError, setStoresError] = useState('')
  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [productsError, setProductsError] = useState('')
  const [productFilter, setProductFilter] = useState('')
  const [productCategory, setProductCategory] = useState('all')
  const [productBrand, setProductBrand] = useState('all')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [maxDeliveryMinutes, setMaxDeliveryMinutes] = useState('')
  const [selectedStoreId, setSelectedStoreId] = useState('all')
  const [cart, setCart] = useState([])
  const [customerName, setCustomerName] = useState('')
  const [customerContact, setCustomerContact] = useState('')
  const [orderStatus, setOrderStatus] = useState(null)
  const [orderSubmitting, setOrderSubmitting] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [orderHistory, setOrderHistory] = useState([])
  const [orderHistoryLoading, setOrderHistoryLoading] = useState(false)
  const [orderHistoryError, setOrderHistoryError] = useState('')
  const [orderLookupContact, setOrderLookupContact] = useState('')
  const [trackedContact, setTrackedContact] = useState('')
  const [selectedOrderId, setSelectedOrderId] = useState('')
  const [orderUpdatingId, setOrderUpdatingId] = useState('')

  useEffect(() => {
    if (location.pathname === '/cart' && cartOpen) {
      setCartOpen(false)
    }
  }, [location.pathname, cartOpen])

  const loadOrderHistory = useCallback(
    async (contactValue) => {
      const trimmedContact = typeof contactValue === 'string' ? contactValue.trim() : ''
      if (!trimmedContact) {
        setTrackedContact('')
        setOrderHistory([])
        setSelectedOrderId('')
        setOrderHistoryError('')
        setOrderHistoryLoading(false)
        return
      }

      setTrackedContact(trimmedContact)
      setOrderHistoryLoading(true)
      setOrderHistoryError('')

      try {
        const data = await fetchJson(`/api/orders?contact=${encodeURIComponent(trimmedContact)}`)
        const ordersResponse = Array.isArray(data.orders) ? data.orders : []
        setOrderHistory(ordersResponse)
        if (ordersResponse.length > 0) {
          setSelectedOrderId((previous) => {
            if (previous && ordersResponse.some((order) => order.id === previous)) {
              return previous
            }
            return ordersResponse[0].id
          })
        } else {
          setSelectedOrderId('')
        }
      } catch (error) {
        setOrderHistoryError(error.message)
      } finally {
        setOrderHistoryLoading(false)
      }
    },
    [],
  )

  const handleTrackOrdersSubmit = useCallback(
    (event) => {
      event.preventDefault()
      loadOrderHistory(orderLookupContact)
    },
    [orderLookupContact, loadOrderHistory],
  )

  const handleRefreshOrderHistory = useCallback(() => {
    if (trackedContact) {
      loadOrderHistory(trackedContact)
    }
  }, [trackedContact, loadOrderHistory])

  const handleSelectOrder = useCallback((orderId) => {
    setSelectedOrderId(orderId)
  }, [])

  const handleAdvanceOrderStatus = useCallback(
    async (orderId, statusCode) => {
      if (!orderId || !statusCode) return
      setOrderHistoryError('')
      setOrderUpdatingId(orderId)
      try {
        await fetchJson(`/api/orders/${orderId}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status: statusCode }),
        })
        if (trackedContact) {
          await loadOrderHistory(trackedContact)
        }
      } catch (error) {
        setOrderHistoryError(error.message)
      } finally {
        setOrderUpdatingId('')
      }
    },
    [loadOrderHistory, trackedContact],
  )

  useEffect(() => {
    if (!orderLookupContact && customerContact) {
      setOrderLookupContact(customerContact)
    }
  }, [customerContact, orderLookupContact])

  const filterFallbackStores = useCallback(() => {
    const location = coords ? { lat: coords.lat, lng: coords.lng } : null
    const enrichedStores = FALLBACK_STORES.map((store) => ({
      ...store,
      distanceKm: location ? haversineDistanceKm(location, store.location) : null,
    }))

    return enrichedStores
      .filter((store) => {
        if (coords && typeof store.distanceKm === 'number' && store.distanceKm > DEFAULT_RADIUS) {
          return false
        }
        if (!activeManualQuery) return true
        const q = activeManualQuery.toLowerCase()
        return (
          store.name.toLowerCase().includes(q) ||
          (store.address && store.address.toLowerCase().includes(q))
        )
      })
      .sort((a, b) => {
        if (a.distanceKm == null) return 1
        if (b.distanceKm == null) return -1
        return a.distanceKm - b.distanceKm
      })
  }, [coords, activeManualQuery])

  const fetchStores = useCallback(async () => {
    setStoresLoading(true)
    setStoresError('')
    try {
      const params = new URLSearchParams()
      if (coords) {
        params.set('lat', coords.lat)
        params.set('lng', coords.lng)
        params.set('radius', DEFAULT_RADIUS)
      }
      if (activeManualQuery) {
        params.set('q', activeManualQuery)
      }
      const queryString = params.toString() ? `?${params.toString()}` : ''
      const data = await fetchJson(`/api/stores${queryString}`)
      setStores((data.stores ?? []).map((store) => ({
        ...store,
        deliveryEta: store.deliveryEta || DEFAULT_DELIVERY_TIME,
      })))
    } catch (error) {
      console.warn('Falling back to preset stores:', error)
      const fallbackStores = filterFallbackStores()
      setStores(fallbackStores)
      setStoresError('Unable to reach live data. Showing preset stores instead.')
    } finally {
      setStoresLoading(false)
    }
  }, [coords, activeManualQuery, filterFallbackStores, DEFAULT_DELIVERY_TIME])

  const fetchProducts = useCallback(async () => {
    setProductsLoading(true)
    setProductsError('')
    try {
      const params = new URLSearchParams()
      if (coords) {
        params.set('lat', coords.lat)
        params.set('lng', coords.lng)
        params.set('radius', DEFAULT_RADIUS)
      }
      if (activeManualQuery) {
        params.set('store', activeManualQuery)
      }
      const queryString = params.toString() ? `?${params.toString()}` : ''
      const data = await fetchJson(`/api/products${queryString}`)
      setProducts(data.products ?? [])
    } catch (error) {
      console.warn('Falling back to preset catalog:', error)
      const fallbackStores = filterFallbackStores()
      const fallbackCatalog = aggregateProducts(fallbackStores, FALLBACK_INVENTORY)
      setProducts(fallbackCatalog)
      setProductsError('Unable to reach live catalog. Showing preset products instead.')
    } finally {
      setProductsLoading(false)
    }
  }, [coords, activeManualQuery, filterFallbackStores])

  useEffect(() => {
    fetchStores()
    fetchProducts()
  }, [fetchStores, fetchProducts])

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0),
    [cart],
  )

  const cartItemCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  )

  const cartProviders = useMemo(() => {
    const providerMap = new Map()
    cart.forEach((item) => {
      if (!providerMap.has(item.storeId)) {
        providerMap.set(item.storeId, item.storeName)
      }
    })
    return Array.from(providerMap.entries()).map(([storeId, name]) => ({ storeId, name }))
  }, [cart])

  const productCategories = useMemo(() => {
    const unique = new Set()
    products.forEach((product) => {
      if (product.category) {
        unique.add(product.category)
      }
    })
    const categories = Array.from(unique).sort()
    return ['all', ...categories]
  }, [products])

  const productBrands = useMemo(() => {
    const unique = new Set()
    products.forEach((product) => {
      if (product.brand) {
        unique.add(product.brand)
      }
    })
    const brands = Array.from(unique).sort((a, b) => a.localeCompare(b))
    return ['all', ...brands]
  }, [products])

  useEffect(() => {
    if (!productBrands.includes(productBrand)) {
      setProductBrand('all')
    }
  }, [productBrands, productBrand])

  const visibleStores = useMemo(() => {
    if (maxDeliveryMinutes === '') return stores
    const maxMinutes = Number(maxDeliveryMinutes)
    if (!Number.isFinite(maxMinutes)) return stores
    return stores.filter((store) => {
      const etaMinutes = parseDeliveryEtaMinutes(store.deliveryEta)
      if (etaMinutes == null) return true
      return etaMinutes <= maxMinutes
    })
  }, [stores, maxDeliveryMinutes])

  const visibleStoreIds = useMemo(
    () => new Set(visibleStores.map((store) => store.id)),
    [visibleStores],
  )

  const storeFilterOptions = useMemo(() => {
    const uniqueStores = new Map()
    visibleStores.forEach((store) => {
      if (!store || !store.id) return
      if (!uniqueStores.has(store.id)) {
        uniqueStores.set(store.id, store.name || store.id)
      }
    })
    const options = Array.from(uniqueStores.entries()).map(([id, name]) => ({ id, name }))
    return [{ id: 'all', name: 'All providers' }, ...options]
  }, [visibleStores])

  useEffect(() => {
    if (selectedStoreId === 'all') return
    const storeStillVisible = visibleStores.some((store) => store.id === selectedStoreId)
    if (!storeStillVisible) {
      setSelectedStoreId('all')
    }
  }, [selectedStoreId, visibleStores])

  const filteredProducts = useMemo(() => {
    let result = products

    if (productCategory !== 'all') {
      result = result.filter((product) => product.category === productCategory)
    }

    if (productBrand !== 'all') {
      const brandQuery = productBrand.toLowerCase()
      result = result.filter((product) => {
        if (!product.brand) return false
        return product.brand.toLowerCase() === brandQuery
      })
    }

    const min = priceMin === '' ? null : Number(priceMin)
    const max = priceMax === '' ? null : Number(priceMax)
    const hasPriceFilter = (min != null && !Number.isNaN(min)) || (max != null && !Number.isNaN(max))
    const restrictToVisibleStores = maxDeliveryMinutes !== ''
    const restrictToSelectedStore = selectedStoreId !== 'all'

    if (hasPriceFilter || restrictToVisibleStores || restrictToSelectedStore) {
      result = result
        .map((product) => {
          let storeOptions = product.stores ?? []
          if (restrictToVisibleStores) {
            storeOptions = storeOptions.filter((store) => visibleStoreIds.has(store.storeId))
          }
          if (restrictToSelectedStore) {
            storeOptions = storeOptions.filter((store) => store.storeId === selectedStoreId)
          }
          if (hasPriceFilter) {
            storeOptions = storeOptions.filter((store) => {
              if (min != null && !Number.isNaN(min) && store.price < min) return false
              if (max != null && !Number.isNaN(max) && store.price > max) return false
              return true
            })
          }

          if (!storeOptions.length) return null
          const prices = storeOptions.map((option) => option.price)
          return {
            ...product,
            stores: storeOptions,
            storeCount: storeOptions.length,
            lowestPrice: Math.min(...prices),
            highestPrice: Math.max(...prices),
          }
        })
        .filter(Boolean)
    }

    const query = productFilter.trim().toLowerCase()
    if (!query) return result

    return result.filter((product) =>
      [product.name, product.description, product.category, product.brand, product.sku]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query)),
    )
  }, [
    products,
    productCategory,
    productBrand,
    productFilter,
    priceMin,
    priceMax,
    maxDeliveryMinutes,
    visibleStoreIds,
    selectedStoreId,
  ])

  const handleClearFilters = () => {
    setProductFilter('')
    setProductCategory('all')
    setProductBrand('all')
    setPriceMin('')
    setPriceMax('')
    setMaxDeliveryMinutes('')
    setSelectedStoreId('all')
  }

  const handleManualSearch = (event) => {
    event.preventDefault()
    const query = manualLocationInput.trim()
    setCoords(null)
    setActiveManualQuery(query)
  }

  const addToCart = (product, provider) => {
    if (!provider) return

    setOrderStatus(null)

    setCart((previous) => {
      const existingIndex = previous.findIndex(
        (item) => item.sku === product.sku && item.storeId === provider.storeId,
      )

      if (existingIndex >= 0) {
        const next = [...previous]
        const existing = next[existingIndex]
        const maxAvailable =
          typeof provider.quantityAvailable === 'number' ? provider.quantityAvailable : Infinity
        const nextQuantity = Math.min(existing.quantity + 1, maxAvailable)
        next[existingIndex] = { ...existing, quantity: nextQuantity }
        return next
      }

      return [
        ...previous,
        {
          sku: product.sku,
          name: product.name,
          storeId: provider.storeId,
          storeName: provider.storeName,
          price: provider.price,
          quantity: 1,
          quantityAvailable: provider.quantityAvailable,
          unit: product.unit,
          deliveryEta: provider.deliveryEta,
          storeAddress: provider.address,
        },
      ]
    })

    setCartOpen(true)
  }

  const updateCartQuantity = (sku, storeId, quantity) => {
    if (Number.isNaN(quantity)) return
    setCart((previous) => {
      const next = previous
        .map((item) => {
          if (item.sku !== sku || item.storeId !== storeId) return item
          const maxAvailable =
            typeof item.quantityAvailable === 'number' ? item.quantityAvailable : Infinity
          const clamped = Math.min(Math.max(quantity, 1), maxAvailable)
          return { ...item, quantity: clamped }
        })
        .filter((item) => item.quantity > 0)
      if (!next.length) {
        setCartOpen(false)
      }
      return next
    })
  }

  const removeCartItem = (sku, storeId) => {
    setCart((previous) => {
      const next = previous.filter((item) => item.sku !== sku || item.storeId !== storeId)
      if (!next.length) {
        setCartOpen(false)
      }
      return next
    })
    setOrderStatus(null)
  }

  const handleSubmitOrder = async (event) => {
    event.preventDefault()
    setOrderStatus(null)

    if (!cart.length) {
      setOrderStatus({ type: 'error', message: 'Your cart is empty.' })
      return
    }

    if (!customerName.trim() || !customerContact.trim()) {
      setOrderStatus({ type: 'error', message: 'Provide your name and contact details.' })
      return
    }

    const customerLocation = coords
      ? { lat: coords.lat, lng: coords.lng }
      : activeManualQuery
        ? { address: activeManualQuery }
        : manualLocationInput
          ? { address: manualLocationInput.trim() }
          : null

    if (!customerLocation) {
      setOrderStatus({ type: 'error', message: 'Share a location or address to place an order.' })
      return
    }

    const storeGroups = cart.reduce((groups, item) => {
      if (!groups.has(item.storeId)) {
        groups.set(item.storeId, [])
      }
      groups.get(item.storeId).push({ sku: item.sku, quantity: item.quantity })
      return groups
    }, new Map())

    const storeOrders = Array.from(storeGroups.entries()).map(([storeId, items]) => ({
      storeId,
      items,
    }))

    const payload = {
      storeOrders,
      customerDetails: {
        name: customerName.trim(),
        contact: customerContact.trim(),
      },
      customerLocation,
    }

    try {
      setOrderSubmitting(true)
      const response = await fetchJson('/api/orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      const order = response.order ?? null
      const summary = order?.summary ?? null
      const summaryParts = []

      if (summary) {
        if (typeof summary.itemCount === 'number' && summary.itemCount > 0) {
          summaryParts.push(`${summary.itemCount} item${summary.itemCount === 1 ? '' : 's'}`)
        }
        if (typeof summary.storeCount === 'number' && summary.storeCount > 0) {
          summaryParts.push(
            `across ${summary.storeCount} provider${summary.storeCount === 1 ? '' : 's'}`,
          )
        }
        const formattedTotal = formatCurrencyValue(summary.total)
        if (formattedTotal) {
          summaryParts.push(`$${formattedTotal}`)
        }
      }

      let successMessage = 'Order placed!'
      if (summaryParts.length) {
        successMessage += ` ${summaryParts.join(' · ')}.`
      }

      if (order?.id) {
        successMessage += ` Confirmation #${order.id.slice(0, 8).toUpperCase()}.`
      }

      const contactForHistory = payload.customerDetails.contact
      if (order?.id) {
        setSelectedOrderId(order.id)
      }
      if (contactForHistory) {
        setOrderLookupContact(contactForHistory)
        loadOrderHistory(contactForHistory)
      }

      const statusFlowLabels = Array.isArray(order?.statusFlow)
        ? order.statusFlow
            .map((step) => {
              if (step && typeof step === 'object' && typeof step.label === 'string') {
                return step.label
              }
              if (typeof step === 'string') {
                return step
              }
              return null
            })
            .filter(Boolean)
        : []

      const currentStatusLabel =
        typeof order?.currentStatus?.label === 'string'
          ? order.currentStatus.label
          : statusFlowLabels[0] || null

      if (currentStatusLabel) {
        successMessage += ` Status: ${currentStatusLabel}.`
      }

      setOrderStatus({
        type: 'success',
        message: successMessage.trim(),
      })
      setCart([])
      setCartOpen(false)
    } catch (error) {
      const detailMessage =
        Array.isArray(error.details) && error.details.length
          ? `: ${error.details.join('; ')}`
          : ''
      setOrderStatus({ type: 'error', message: `${error.message}${detailMessage}` })
    } finally {
      setOrderSubmitting(false)
    }
  }

  const cartProviderNote = cartProviders.length
    ? `Cart includes items from ${cartProviders.map((provider) => provider.name).join(', ')}.`
    : 'Add items from the catalog to begin checkout.'

  const { member, pointsBank, contact } = CUSTOMER_PROFILE
  const heroTitle = useMemo(() => {
    const fullName = typeof member?.name === 'string' ? member.name.trim() : ''
    if (!fullName) return 'Flo fulfillment'
    const [firstName] = fullName.split(' ')
    return firstName || fullName
  }, [member])

  const greetingLine = useMemo(() => {
    const salutations = ['Hi', 'Hello', 'Welcome back']
    const fullName = typeof member?.name === 'string' ? member.name.trim() : ''
    const [firstName] = fullName.split(' ')
    const nameToken = firstName || fullName || 'there'
    const index = nameToken.length % salutations.length
    const prefix = salutations[index]
    if (prefix === 'Welcome back') {
      return `${prefix}`
    }
    return `${prefix}`
  }, [member])

  const heroStats = useMemo(
    () => [
      {
        key: 'membership-tier',
        label: 'Membership tier',
        value: member?.tier ?? '—',
        meta: member?.memberSince ? `Member since ${member.memberSince}` : null,
      },
      {
        key: 'points-balance',
        label: 'Points balance',
        value:
          typeof pointsBank?.balance === 'number'
            ? `${pointsBank.balance.toLocaleString()} pts`
            : '—',
        meta:
          typeof pointsBank?.availableToRedeem === 'number'
            ? `${pointsBank.availableToRedeem.toLocaleString()} pts ready to redeem`
            : pointsBank?.institution ?? null,
      },
      {
        key: 'primary-contact',
        label: 'Primary contact',
        value: contact?.email ?? '—',
        meta: contact?.preferredContact ? `Preferred: ${contact.preferredContact}` : null,
      },
    ],
    [member, pointsBank, contact],
  )
  const selectedOrder = useMemo(
    () => orderHistory.find((order) => order.id === selectedOrderId) || null,
    [orderHistory, selectedOrderId],
  )

  const catalogProps = {
    products: filteredProducts,
    loading: productsLoading,
    onAddToCart: addToCart,
    error: productsError,
    productFilter,
    onProductFilterChange: setProductFilter,
    categories: productCategories,
    activeCategory: productCategory,
    onCategoryChange: setProductCategory,
    brands: productBrands,
    activeBrand: productBrand,
    onBrandChange: setProductBrand,
    priceMin,
    priceMax,
    onPriceMinChange: setPriceMin,
    onPriceMaxChange: setPriceMax,
    maxDeliveryMinutes,
    onMaxDeliveryMinutesChange: setMaxDeliveryMinutes,
    storesLoading,
    storesError,
    manualLocationInput,
    onManualLocationChange: setManualLocationInput,
    onManualSearch: handleManualSearch,
    onClearFilters: handleClearFilters,
    storeOptions: storeFilterOptions,
    selectedStoreId,
    onSelectedStoreChange: setSelectedStoreId,
  }

  const orderHistoryProps = {
    contactInput: orderLookupContact,
    onContactInputChange: setOrderLookupContact,
    onSubmitLookup: handleTrackOrdersSubmit,
    trackedContact,
    orders: orderHistory,
    loading: orderHistoryLoading,
    error: orderHistoryError,
    selectedOrder,
    onSelectOrder: handleSelectOrder,
    onRefresh: handleRefreshOrderHistory,
    onAdvanceStatus: handleAdvanceOrderStatus,
    advancingOrderId: orderUpdatingId,
  }

  const cartProps = {
    items: cart,
    onUpdateQuantity: updateCartQuantity,
    onRemove: removeCartItem,
    total: cartTotal,
  }

  const checkoutFormProps = {
    customerName,
    customerContact,
    onCustomerNameChange: setCustomerName,
    onCustomerContactChange: setCustomerContact,
    onSubmit: handleSubmitOrder,
    submitting: orderSubmitting,
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__content">
          <div className="app-header__badge">
            <span className="badge badge--accent">Early access</span>
          </div>
          <div className="app-header__title">
            <h1>{greetingLine} {heroTitle}!</h1>
          </div>
          <p className="muted">
            Browse nearby providers, compare pricing, and assemble the perfect cart in minutes.
          </p>
        </div>
        <div className="app-header__meta">
          <div className="app-header__stats">
            {heroStats.map((stat) => (
              <div key={stat.key} className="stat-card" aria-live="polite">
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
                {stat.meta ? <div className="stat-card__meta">{stat.meta}</div> : null}
              </div>
            ))}
          </div>
        </div>
        <div className="app-header__nav">
          <MarketplaceNavigation />
        </div>
      </header>

      <StatusBanner status={orderStatus} />

      <main className="app-main">
        <Routes>
        <Route path="/" element={<Navigate to="/catalog" replace />} />
        <Route path="/catalog" element={<CatalogPage catalogProps={catalogProps} />} />
        <Route path="/orders" element={<OrdersPage orderHistoryProps={orderHistoryProps} />} />
        <Route
          path="/cart"
          element={
            <CartPage
              cartProviderNote={cartProviderNote}
              cartProps={cartProps}
              checkoutFormProps={checkoutFormProps}
            />
          }
        />
        <Route path="/profile" element={<ProfilePage />} />
        <Route
          path="/demo"
          element={<DemoPage catalogProps={catalogProps} orderHistoryProps={orderHistoryProps} />}
        />
        <Route path="*" element={<Navigate to="/catalog" replace />} />
        </Routes>
      </main>

      <CartToggle
        count={cartItemCount}
        total={cartTotal}
        onToggle={() => setCartOpen((prev) => !prev)}
        isOpen={cartOpen}
      />

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)}>
        <p className="muted cart-drawer__note">{cartProviderNote}</p>
        <Cart {...cartProps} />
        <CheckoutForm {...checkoutFormProps} />
      </CartDrawer>
    </div>
  )
}

export default App
