import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

const fetchJson = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!response.ok) {
    const message = `Request failed with status ${response.status}`
    throw new Error(message)
  }

  return response.json()
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
          unit: item.unit,
          stores: [],
        })
      }

      const entry = catalog.get(item.sku)
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

const StoreList = ({ stores, selectedId, loading, error, onSelect, filters }) => {
  if (loading) {
    return <div className="panel-body">Loading nearby stores…</div>
  }

  if (!stores.length) {
    return (
      <div className="panel-body">
        <p className="muted">No stores matched your filters yet. Try widening your search.</p>
      </div>
    )
  }

  return (
    <div className="store-list-wrapper">
      {filters && <div className="store-list-filters">{filters}</div>}
      {error && <p className="inline-alert">{error}</p>}
      <ul className="store-list">
        {stores.map((store) => (
          <li key={store.id}>
            <button
              type="button"
              className={`store-card ${selectedId === store.id ? 'selected' : ''}`}
              onClick={() => onSelect(store)}
            >
              <div className="store-card__header">
                <h3>{store.name}</h3>
                {typeof store.distanceKm === 'number' && (
                  <span className="badge">{store.distanceKm.toFixed(1)} km</span>
                )}
              </div>
              <p className="store-address">{store.address}</p>
              <p className="store-hours">Hours: {store.hours}</p>
              {store.deliveryEta && <p className="store-delivery">Delivery: {store.deliveryEta}</p>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

const FilterBar = ({
  manualLocationInput,
  onManualLocationChange,
  onManualSearch,
  onUseMyLocation,
  locationStatus,
  radius,
  onRadiusChange,
  filtersExpanded,
  onToggleFilters,
  headerZip,
  headerDeliveryEta,
  detailsId = 'location-filters',
}) => {
  return (
    <section className="filter-bar" aria-label="Location and provider filters">
      <div className="filter-summary">
        <button
          type="button"
          className="filter-toggle"
          onClick={onToggleFilters}
          aria-expanded={filtersExpanded}
          aria-controls={detailsId}
        >
          {filtersExpanded ? 'Hide filters' : 'Show filters'}
        </button>

        <form className="filter-search" onSubmit={onManualSearch}>
          <label className="sr-only" htmlFor="filter-search-input">
            Search by city, zip, or store name
          </label>
          <input
            id="filter-search-input"
            type="search"
            placeholder="Search by city, zip, or store"
            value={manualLocationInput}
            onChange={(event) => onManualLocationChange(event.target.value)}
          />
          <button type="submit" className="sr-only">
            Apply search
          </button>
        </form>

        <div className="filter-badges" role="status" aria-live="polite">
          <span className="badge">ZIP: {headerZip}</span>
          <span className="badge">Radius: {radius} km</span>
          <span className="badge">Est. Delivery: {headerDeliveryEta}</span>
        </div>

        {locationStatus && !filtersExpanded && (
          <span className="muted status-text status-inline">{locationStatus}</span>
        )}

        <button type="button" className="button-ghost" onClick={onUseMyLocation}>
          Use my location
        </button>
      </div>

      {filtersExpanded && (
        <div className="filter-details" id={detailsId}>
          <div className="filter-detail-row">
            <label htmlFor="radius-slider">Radius: {radius} km</label>
            <input
              id="radius-slider"
              type="range"
              min="1"
              max="25"
              step="1"
              value={radius}
              onChange={(event) => onRadiusChange(Number(event.target.value))}
            />
          </div>
          {locationStatus && <span className="muted status-text">{locationStatus}</span>}
        </div>
      )}
    </section>
  )
}

const ProductFilterControls = ({
  filter,
  onFilterChange,
  categories,
  activeCategory,
  onCategoryChange,
  inputId,
  showSearch = true,
  showCategories = true,
  layout = 'stacked',
}) => {
  const hasCategories = showCategories && categories.length > 1
  return (
    <div className={`product-filters product-filters--${layout}`}>
      {showSearch && (
        <div className="product-filters__search">
          <label className="sr-only" htmlFor={inputId}>
            Search products
          </label>
          <input
            id={inputId}
            type="search"
            placeholder="Search products"
            value={filter}
            onChange={(event) => onFilterChange(event.target.value)}
          />
        </div>
      )}
      {hasCategories && (
        <div className="category-filters">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={`filter-chip ${activeCategory === category ? 'active' : ''}`}
              onClick={() => onCategoryChange(category)}
            >
              {category === 'all' ? 'All items' : category}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const SidebarFilters = ({
  productFilter,
  onProductFilterChange,
  categories,
  activeCategory,
  onCategoryChange,
  priceMin,
  priceMax,
  onPriceMinChange,
  onPriceMaxChange,
  maxDeliveryMinutes,
  onMaxDeliveryMinutesChange,
}) => {
  return (
    <div className="sidebar-filters">
      <ProductFilterControls
        filter={productFilter}
        onFilterChange={onProductFilterChange}
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={onCategoryChange}
        inputId="product-filter-sidebar"
        layout="sidebar"
      />

      <div className="sidebar-filters__group">
        <h3>Price range</h3>
        <div className="price-filter">
          <label htmlFor="price-min">Min ($)</label>
          <input
            id="price-min"
            type="number"
            min="0"
            step="0.01"
            value={priceMin}
            onChange={(event) => onPriceMinChange(event.target.value)}
            placeholder="0.00"
          />
          <label htmlFor="price-max">Max ($)</label>
          <input
            id="price-max"
            type="number"
            min="0"
            step="0.01"
            value={priceMax}
            onChange={(event) => onPriceMaxChange(event.target.value)}
            placeholder=""
          />
        </div>
      </div>

      <div className="sidebar-filters__group">
        <h3>Delivery</h3>
        <label htmlFor="delivery-max">Max ETA (minutes)</label>
        <input
          id="delivery-max"
          type="number"
          min="0"
          step="5"
          value={maxDeliveryMinutes}
          onChange={(event) => onMaxDeliveryMinutesChange(event.target.value)}
          placeholder="Any"
        />
      </div>
    </div>
  )
}

const ProductCatalog = ({
  products,
  filter,
  onFilterChange,
  loading,
  categories,
  activeCategory,
  onCategoryChange,
  onAddToCart,
  error,
}) => {
  return (
    <div className="inventory">
      <div className="inventory-header">
        <h2>Product catalog</h2>
        <ProductFilterControls
          filter={filter}
          onFilterChange={onFilterChange}
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={onCategoryChange}
          showCategories={false}
          layout="inline"
          inputId="product-filter-main"
        />
      </div>
      <ProductFilterControls
        filter={filter}
        onFilterChange={onFilterChange}
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={onCategoryChange}
        showSearch={false}
        layout="chips"
        inputId="product-filter-main"
      />
      {error && <p className="inline-alert">{error}</p>}
      {loading ? (
        <p className="muted">Loading catalog…</p>
      ) : !products.length ? (
        <p className="muted">No items match your filters.</p>
      ) : (
        <ul className="inventory-list">
          {products.map((product) => (
            <li key={product.sku} className="inventory-item product-card">
              <div className="product-card__details">
                <h3>{product.name}</h3>
                <p className="muted">{product.description}</p>
                <div className="inventory-meta">
                  <span className="badge badge--subtle">{product.category}</span>
                  <span className="muted">SKU: {product.sku}</span>
                  <span className="muted">
                    {product.storeCount} provider{product.storeCount === 1 ? '' : 's'}
                  </span>
                </div>
              </div>
              <div className="product-card__providers">
                <p className="muted price-summary">
                  ${product.lowestPrice.toFixed(2)} – ${product.highestPrice.toFixed(2)}
                </p>
                <ul className="provider-options">
                  {product.stores.map((store) => (
                    <li key={store.storeId} className="provider-option">
                      <div className="provider-info">
                        <strong>{store.storeName}</strong>
                        <span className="muted">
                          ${store.price.toFixed(2)} · {store.quantityAvailable} available
                        </span>
                        {store.deliveryEta && (
                          <span className="provider-eta">ETA {store.deliveryEta}</span>
                        )}
                      </div>
                      <button type="button" onClick={() => onAddToCart(product, store)}>
                        Add from {store.storeName}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      )}
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
      <div className="cart empty">
        <p className="muted">Add items from the catalog to create an order.</p>
      </div>
    )
  }

  return (
    <div className="cart">
      <ul className="cart-list">
        {items.map((item) => (
          <li key={`${item.sku}-${item.storeId}`} className="cart-item">
            <div className="cart-info">
              <strong>{item.name}</strong>
              <span className="muted">{item.storeName}</span>
              <span className="muted">
                ${item.price.toFixed(2)} · {item.quantityAvailable} in stock
              </span>
            </div>
            <div className="cart-actions">
              <label className="muted" htmlFor={`quantity-${item.sku}-${item.storeId}`}>
                Qty
              </label>
              <input
                id={`quantity-${item.sku}-${item.storeId}`}
                type="number"
                min="1"
                max={item.quantityAvailable}
                value={item.quantity}
                onChange={(event) => onUpdateQuantity(item.sku, item.storeId, Number(event.target.value))}
              />
              <span className="price-subtotal">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
              <button type="button" className="link" onClick={() => onRemove(item.sku, item.storeId)}>
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="cart-total">Total: ${total.toFixed(2)}</div>
    </div>
  )
}

const StatusBanner = ({ status }) => {
  if (!status) return null
  return <div className={`status-banner status-banner--${status.type}`}>{status.message}</div>
}

function App() {
  const DEFAULT_ZIP = '10001'
  const DEFAULT_RADIUS = 10
  const DEFAULT_DELIVERY_TIME = '30-60 min'

  const [coords, setCoords] = useState(null)
  const [locationStatus, setLocationStatus] = useState('')
  const [manualLocationInput, setManualLocationInput] = useState(DEFAULT_ZIP)
  const [activeManualQuery, setActiveManualQuery] = useState('')
  const [radius, setRadius] = useState(DEFAULT_RADIUS)
  const [stores, setStores] = useState([])
  const [storesLoading, setStoresLoading] = useState(false)
  const [storesError, setStoresError] = useState('')
  const [selectedStore, setSelectedStore] = useState(null)
  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [productsError, setProductsError] = useState('')
  const [productFilter, setProductFilter] = useState('')
  const [productCategory, setProductCategory] = useState('all')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [maxDeliveryMinutes, setMaxDeliveryMinutes] = useState('')
  const [cart, setCart] = useState([])
  const [customerName, setCustomerName] = useState('')
  const [customerContact, setCustomerContact] = useState('')
  const [orderStatus, setOrderStatus] = useState(null)
  const [orderSubmitting, setOrderSubmitting] = useState(false)
  const [filtersExpanded, setFiltersExpanded] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)

  const filterFallbackStores = useCallback(() => {
    const location = coords ? { lat: coords.lat, lng: coords.lng } : null
    const enrichedStores = FALLBACK_STORES.map((store) => ({
      ...store,
      distanceKm: location ? haversineDistanceKm(location, store.location) : null,
    }))

    return enrichedStores
      .filter((store) => {
        if (coords && typeof store.distanceKm === 'number' && store.distanceKm > radius) {
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
  }, [coords, radius, activeManualQuery])

  const fetchStores = useCallback(async () => {
    setStoresLoading(true)
    setStoresError('')
    try {
      const params = new URLSearchParams()
      if (coords) {
        params.set('lat', coords.lat)
        params.set('lng', coords.lng)
        params.set('radius', radius)
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
  }, [coords, radius, activeManualQuery, filterFallbackStores, DEFAULT_DELIVERY_TIME])

  const fetchProducts = useCallback(async () => {
    setProductsLoading(true)
    setProductsError('')
    try {
      const params = new URLSearchParams()
      if (coords) {
        params.set('lat', coords.lat)
        params.set('lng', coords.lng)
        params.set('radius', radius)
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
  }, [coords, radius, activeManualQuery, filterFallbackStores])

  useEffect(() => {
    fetchStores()
    fetchProducts()
  }, [fetchStores, fetchProducts])

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

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
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

  const filteredProducts = useMemo(() => {
    let result = products
    if (productCategory !== 'all') {
      result = result.filter((product) => product.category === productCategory)
    }

    const min = priceMin === '' ? null : Number(priceMin)
    const max = priceMax === '' ? null : Number(priceMax)
    const hasPriceFilter = (min != null && !Number.isNaN(min)) || (max != null && !Number.isNaN(max))
    const restrictToVisibleStores = maxDeliveryMinutes !== ''

    if (hasPriceFilter || restrictToVisibleStores) {
      result = result
        .map((product) => {
          let storeOptions = product.stores
          if (restrictToVisibleStores) {
            storeOptions = storeOptions.filter((store) => visibleStoreIds.has(store.storeId))
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

    if (!productFilter) return result
    const q = productFilter.toLowerCase()
    return result.filter((product) =>
      [product.name, product.description, product.category, product.sku]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(q)),
    )
  }, [
    products,
    productCategory,
    productFilter,
    priceMin,
    priceMax,
    maxDeliveryMinutes,
    visibleStoreIds,
  ])

  const handleUseMyLocation = () => {
    if (!('geolocation' in navigator)) {
      setLocationStatus('Geolocation is not supported by this browser.')
      return
    }

    setLocationStatus('Fetching your location…')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ lat: position.coords.latitude, lng: position.coords.longitude })
        setActiveManualQuery('')
        setLocationStatus('Location detected!')
        setFiltersExpanded(false)
      },
      (error) => {
        setLocationStatus(error.message || 'Unable to retrieve your location.')
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  const handleManualSearch = (event) => {
    event.preventDefault()
    const query = manualLocationInput.trim()
    setCoords(null)
    setActiveManualQuery(query)
    setLocationStatus(query ? `Searching near "${query}"…` : 'Showing all stores')
    setFiltersExpanded(false)
  }

  const handleSelectStore = (store) => {
    setOrderStatus(null)
    setSelectedStore(store)
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
        const nextQuantity = Math.min(existing.quantity + 1, provider.quantityAvailable)
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
        },
      ]
    })

    setSelectedStore((current) => {
      if (current && current.id === provider.storeId) {
        return current
      }
      return (
        stores.find((store) => store.id === provider.storeId) ?? {
          id: provider.storeId,
          name: provider.storeName,
          deliveryEta: provider.deliveryEta,
          address: provider.address,
        }
      )
    })
    setCartOpen(true)
  }

  const updateCartQuantity = (sku, storeId, quantity) => {
    if (Number.isNaN(quantity)) return
    setCart((previous) => {
      const next = previous
        .map((item) => {
          if (item.sku !== sku || item.storeId !== storeId) return item
          const clamped = Math.min(Math.max(quantity, 1), item.quantityAvailable)
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
      setOrderStatus({
        type: 'success',
        message: `Order placed! Confirmation #${response.order.id.slice(0, 8).toUpperCase()}`,
      })
      setCart([])
      setCartOpen(false)
    } catch (error) {
      setOrderStatus({ type: 'error', message: error.message })
    } finally {
      setOrderSubmitting(false)
    }
  }

  const headerZip = manualLocationInput || DEFAULT_ZIP
  const headerDeliveryEta = selectedStore?.deliveryEta || DEFAULT_DELIVERY_TIME
  const cartProviderNote = cartProviders.length
    ? `Cart includes items from ${cartProviders.map((provider) => provider.name).join(', ')}.`
    : 'Add items from the catalog to begin checkout.'

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>Flo fulfillment</h1>
          <p className="muted">
            Compare products across nearby providers, pick the best option, and place your order in one place.
          </p>
        </div>
        <span className="badge badge--accent">Prototype</span>
      </header>

      <FilterBar
        manualLocationInput={manualLocationInput}
        onManualLocationChange={setManualLocationInput}
        onManualSearch={handleManualSearch}
        onUseMyLocation={handleUseMyLocation}
        locationStatus={locationStatus}
        radius={radius}
        onRadiusChange={setRadius}
        filtersExpanded={filtersExpanded}
        onToggleFilters={() => setFiltersExpanded((prev) => !prev)}
        headerZip={headerZip}
        headerDeliveryEta={headerDeliveryEta}
      />

      <StatusBanner status={orderStatus} />

      <div className="content-grid">
        <aside className="panel panel--stores" aria-label="Filters and providers">
          <header className="panel-header">
            <h2>Filters & Providers</h2>
            <p className="muted">
              Refine by product details or delivery, then choose a store to learn more.
            </p>
          </header>
          <div className="panel-body panel-body--stores">
            <StoreList
              stores={visibleStores}
              selectedId={selectedStore?.id ?? null}
              loading={storesLoading}
              error={storesError}
              onSelect={handleSelectStore}
              filters={
                <SidebarFilters
                  productFilter={productFilter}
                  onProductFilterChange={setProductFilter}
                  categories={productCategories}
                  activeCategory={productCategory}
                  onCategoryChange={setProductCategory}
                  priceMin={priceMin}
                  priceMax={priceMax}
                  onPriceMinChange={setPriceMin}
                  onPriceMaxChange={setPriceMax}
                  maxDeliveryMinutes={maxDeliveryMinutes}
                  onMaxDeliveryMinutesChange={setMaxDeliveryMinutes}
                />
              }
            />
          </div>
        </aside>

        <section className="panel panel--products">
          <header className="panel-header">
            <h2>Browse products</h2>
            <p className="muted">
              Compare pricing and availability across providers, then add the best option to your cart.
            </p>
          </header>

          <div className="panel-body inventory-body">
            <ProductCatalog
              products={filteredProducts}
              filter={productFilter}
              onFilterChange={setProductFilter}
              loading={productsLoading}
              categories={productCategories}
              activeCategory={productCategory}
              onCategoryChange={setProductCategory}
              onAddToCart={addToCart}
              error={productsError}
            />
          </div>
        </section>
      </div>

      <CartToggle
        count={cartItemCount}
        total={cartTotal}
        onToggle={() => setCartOpen((prev) => !prev)}
        isOpen={cartOpen}
      />

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)}>
        <p className="muted cart-drawer__note">{cartProviderNote}</p>
        <Cart
          items={cart}
          onUpdateQuantity={updateCartQuantity}
          onRemove={removeCartItem}
          total={cartTotal}
        />
        <form className="checkout" onSubmit={handleSubmitOrder}>
          <div className="form-row">
            <label htmlFor="customer-name">Your name</label>
            <input
              id="customer-name"
              type="text"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
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
              onChange={(event) => setCustomerContact(event.target.value)}
              placeholder="alex@example.com"
              required
            />
          </div>
          <button type="submit" disabled={orderSubmitting}>
            {orderSubmitting ? 'Placing order…' : 'Place order'}
          </button>
        </form>
      </CartDrawer>
    </div>
  )
}

export default App
