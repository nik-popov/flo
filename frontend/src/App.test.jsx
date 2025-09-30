import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import App from './App.jsx'

const createFetchResponse = (body, overrides = {}) => {
  const baseResponse = {
    ok: true,
    headers: {
      get: (headerName) =>
        headerName && headerName.toLowerCase() === 'content-type' ? 'application/json' : null,
    },
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(typeof body === 'string' ? body : JSON.stringify(body)),
  }

  return Promise.resolve({
    ...baseResponse,
    ...overrides,
    headers: overrides.headers || baseResponse.headers,
  })
}

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('loads stores and aggregated products with provider options', async () => {
    fetch
      .mockImplementationOnce(() =>
        createFetchResponse({
          stores: [
            {
              id: 'store-101',
              name: 'Sample Store',
              address: '123 Elm Street',
              hours: '8-5',
              distanceKm: 1.2,
              deliveryEta: '45-60 min',
            },
            {
              id: 'store-202',
              name: 'Uptown Market',
              address: '88 Pine Avenue',
              hours: '9-6',
              distanceKm: 2.5,
              deliveryEta: '30-45 min',
            },
          ],
        }),
      )
      .mockImplementationOnce(() =>
        createFetchResponse({
          products: [
            {
              sku: 'APL-001',
              name: 'Honeycrisp Apples',
              description: 'Fresh apples',
              category: 'Produce',
              brand: 'Orchard Fresh',
              storeCount: 2,
              lowestPrice: 2.49,
              highestPrice: 2.79,
              stores: [
                {
                  storeId: 'store-101',
                  storeName: 'Sample Store',
                  price: 2.49,
                  quantityAvailable: 20,
                  deliveryEta: '45-60 min',
                },
                {
                  storeId: 'store-202',
                  storeName: 'Uptown Market',
                  price: 2.79,
                  quantityAvailable: 35,
                  deliveryEta: '30-45 min',
                },
              ],
            },
          ],
        }),
      )

    render(<App />)

    const locationInput = await screen.findByLabelText(/search by city, zip, or store name/i)
    expect(locationInput).toHaveValue('10001')

    expect(await screen.findByText(/Honeycrisp Apples/i)).toBeInTheDocument()
    expect(screen.getByText(/2 provider/i)).toBeInTheDocument()
    const providerButton = screen.getByRole('button', {
      name: /add honeycrisp apples from sample store to cart/i,
    })
    fireEvent.click(providerButton)

    const secondProviderButton = screen.getByRole('button', {
      name: /add honeycrisp apples from uptown market to cart/i,
    })
    fireEvent.click(secondProviderButton)

    const cartToggle = await screen.findByRole('button', { name: /cart \(2\) · \$5\.28/i })
    expect(cartToggle).toBeInTheDocument()

    const cartDialog = await screen.findByRole('dialog', { name: /your cart/i })
    expect(cartDialog).toBeInTheDocument()

    const quantityInputs = await screen.findAllByRole('spinbutton', { name: /qty/i })
    expect(quantityInputs).toHaveLength(2)

  expect(screen.getByText(/Items in your cart/i)).toBeInTheDocument()
  expect(screen.getByText(/2 items · \$5\.28/i)).toBeInTheDocument()
  expect(screen.getByText(/Order total/i)).toBeInTheDocument()
  expect(screen.getByText(/\$5\.28/, { selector: '.cart-total-amount' })).toBeInTheDocument()
    expect(screen.getAllByText(/Sample Store/)).not.toHaveLength(0)
    expect(screen.getAllByText(/Uptown Market/)).not.toHaveLength(0)
    expect(screen.getByText(/Cart includes items from Sample Store, Uptown Market./i)).toBeInTheDocument()
  })

  it('filters offers by selected provider', async () => {
    fetch
      .mockImplementationOnce(() =>
        createFetchResponse({
          stores: [
            {
              id: 'store-101',
              name: 'Sample Store',
              address: '123 Elm Street',
              hours: '8-5',
              distanceKm: 1.2,
              deliveryEta: '45-60 min',
            },
            {
              id: 'store-202',
              name: 'Uptown Market',
              address: '88 Pine Avenue',
              hours: '9-6',
              distanceKm: 2.5,
              deliveryEta: '30-45 min',
            },
          ],
        }),
      )
      .mockImplementationOnce(() =>
        createFetchResponse({
          products: [
            {
              sku: 'APL-001',
              name: 'Honeycrisp Apples',
              description: 'Fresh apples',
              category: 'Produce',
              brand: 'Orchard Fresh',
              storeCount: 2,
              lowestPrice: 2.49,
              highestPrice: 2.79,
              stores: [
                {
                  storeId: 'store-101',
                  storeName: 'Sample Store',
                  price: 2.49,
                  quantityAvailable: 20,
                  deliveryEta: '45-60 min',
                },
                {
                  storeId: 'store-202',
                  storeName: 'Uptown Market',
                  price: 2.79,
                  quantityAvailable: 35,
                  deliveryEta: '30-45 min',
                },
              ],
            },
          ],
        }),
      )

    render(<App />)

    const providerSelect = await screen.findByLabelText(/show offers from/i)
    fireEvent.change(providerSelect, { target: { value: 'store-202' } })

    await waitFor(() => {
      expect(
        screen.queryByRole('button', {
          name: /add honeycrisp apples from sample store to cart/i,
        }),
      ).toBeNull()
    })

    expect(
      screen.getByRole('button', {
        name: /add honeycrisp apples from uptown market to cart/i,
      }),
    ).toBeInTheDocument()
    expect(screen.getByText(/1 provider/i)).toBeInTheDocument()

    fireEvent.change(providerSelect, { target: { value: 'all' } })

    await waitFor(() => {
      expect(
        screen.getByRole('button', {
          name: /add honeycrisp apples from sample store to cart/i,
        }),
      ).toBeInTheDocument()
    })
  })

  it('filters products by selected brand', async () => {
    fetch
      .mockImplementationOnce(() =>
        createFetchResponse({
          stores: [
            {
              id: 'store-101',
              name: 'Sample Store',
              address: '123 Elm Street',
              hours: '8-5',
              distanceKm: 1.2,
              deliveryEta: '45-60 min',
            },
          ],
        }),
      )
      .mockImplementationOnce(() =>
        createFetchResponse({
          products: [
            {
              sku: 'APL-001',
              name: 'Honeycrisp Apples',
              description: 'Fresh apples',
              category: 'Produce',
              brand: 'Orchard Fresh',
              storeCount: 1,
              lowestPrice: 2.49,
              highestPrice: 2.49,
              stores: [
                {
                  storeId: 'store-101',
                  storeName: 'Sample Store',
                  price: 2.49,
                  quantityAvailable: 20,
                  deliveryEta: '45-60 min',
                },
              ],
            },
            {
              sku: 'SNK-021',
              name: 'Trail Mix Variety Pack',
              description: 'Trail mix',
              category: 'Snacks',
              brand: 'TrailMix Co.',
              storeCount: 1,
              lowestPrice: 7.99,
              highestPrice: 7.99,
              stores: [
                {
                  storeId: 'store-101',
                  storeName: 'Sample Store',
                  price: 7.99,
                  quantityAvailable: 15,
                  deliveryEta: '45-60 min',
                },
              ],
            },
          ],
        }),
      )

    render(<App />)

    const brandSelect = await screen.findByLabelText(/show items from/i)
    expect(brandSelect).toBeInTheDocument()

    fireEvent.change(brandSelect, { target: { value: 'TrailMix Co.' } })

    await waitFor(() => {
      expect(screen.queryByText(/Honeycrisp Apples/i)).not.toBeInTheDocument()
    })

    expect(screen.getByText(/Trail Mix Variety Pack/i)).toBeInTheDocument()

    fireEvent.change(brandSelect, { target: { value: 'all' } })

    await waitFor(() => {
      expect(screen.getByText(/Honeycrisp Apples/i)).toBeInTheDocument()
      expect(screen.getByText(/Trail Mix Variety Pack/i)).toBeInTheDocument()
    })
  })

  it('submits the cart and displays order confirmation details', async () => {
    fetch
      .mockImplementationOnce(() =>
        createFetchResponse({
          stores: [
            {
              id: 'store-101',
              name: 'Sample Store',
              address: '123 Elm Street',
              hours: '8-5',
              distanceKm: 1.2,
              deliveryEta: '45-60 min',
            },
          ],
        }),
      )
      .mockImplementationOnce(() =>
        createFetchResponse({
          products: [
            {
              sku: 'APL-001',
              name: 'Honeycrisp Apples',
              description: 'Fresh apples',
              category: 'Produce',
              brand: 'Orchard Fresh',
              storeCount: 1,
              lowestPrice: 2.49,
              highestPrice: 2.49,
              stores: [
                {
                  storeId: 'store-101',
                  storeName: 'Sample Store',
                  price: 2.49,
                  quantityAvailable: 20,
                  deliveryEta: '45-60 min',
                },
              ],
            },
          ],
        }),
      )
      .mockImplementationOnce(() =>
        createFetchResponse({
          order: {
            id: 'order-12345678',
            summary: {
              itemCount: 1,
              storeCount: 1,
              total: 2.49,
            },
            currentStatus: {
              code: 'placed',
              label: 'Order placed',
            },
            statusFlow: [
              { code: 'placed', label: 'Order placed' },
              { code: 'confirmed', label: 'Confirmed' },
              { code: 'ready_for_pickup', label: 'Ready for pickup' },
            ],
            storeOrders: [
              {
                storeId: 'store-101',
                storeName: 'Sample Store',
                subtotal: 2.49,
                items: [
                  {
                    sku: 'APL-001',
                    quantity: 1,
                    price: 2.49,
                    lineTotal: 2.49,
                  },
                ],
              },
            ],
          },
        }),
      )
      .mockImplementationOnce(() =>
        createFetchResponse({
          orders: [
            {
              id: 'order-12345678',
              placedAt: '2025-09-30T12:00:00.000Z',
              summary: {
                itemCount: 1,
                storeCount: 1,
                total: 2.49,
              },
              currentStatus: {
                code: 'placed',
                label: 'Order placed',
              },
              statusFlow: [
                { code: 'placed', label: 'Order placed', timestamp: '2025-09-30T12:00:00.000Z' },
                { code: 'confirmed', label: 'Confirmed' },
                { code: 'ready_for_pickup', label: 'Ready for pickup' },
              ],
              storeOrders: [
                {
                  storeId: 'store-101',
                  storeName: 'Sample Store',
                  deliveryEta: '45-60 min',
                  subtotal: 2.49,
                  items: [
                    {
                      sku: 'APL-001',
                      quantity: 1,
                      name: 'Honeycrisp Apples',
                      lineTotal: 2.49,
                    },
                  ],
                },
              ],
            },
          ],
        }),
      )

    render(<App />)

    const addToCartButton = await screen.findByRole('button', {
      name: /add honeycrisp apples from sample store to cart/i,
    })
    fireEvent.click(addToCartButton)

    const nameInput = await screen.findByLabelText(/your name/i)
    fireEvent.change(nameInput, { target: { value: 'Alex Shopper' } })

  const contactInput = screen.getByLabelText(/contact \(email or phone\)/i)
    fireEvent.change(contactInput, { target: { value: 'alex@example.com' } })

    const placeOrderButton = screen.getByRole('button', { name: /place order/i })
    fireEvent.click(placeOrderButton)

    const statusBanner = await screen.findByText(/Order placed!/i)
    expect(statusBanner).toHaveTextContent(/\$2\.49/i)
    expect(statusBanner).toHaveTextContent(/confirmation #ORDER-12/i)
  expect(statusBanner).toHaveTextContent(/Status: Order placed\./i)

  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(4))
    const orderCall = fetch.mock.calls[2]
    expect(orderCall[0]).toBe('/api/orders')
    expect(orderCall[1].method).toBe('POST')

    const parsedBody = JSON.parse(orderCall[1].body)
    expect(parsedBody.storeOrders).toEqual([
      {
        storeId: 'store-101',
        items: [
          {
            sku: 'APL-001',
            quantity: 1,
          },
        ],
      },
    ])
    expect(parsedBody.customerDetails).toEqual({
      name: 'Alex Shopper',
      contact: 'alex@example.com',
    })

    const historyCall = fetch.mock.calls[3]
    expect(historyCall[0]).toBe('/api/orders?contact=alex%40example.com')
    expect(historyCall[1]?.method ?? 'GET').toBe('GET')

    expect(await screen.findByText(/Showing updates for/i)).toHaveTextContent(
      /alex@example.com/i,
    )
  expect(await screen.findByText(/Order ORDER-12/i)).toBeInTheDocument()
    expect(
      await screen.findByRole('button', { name: /Advance to Confirmed/i }),
    ).toBeInTheDocument()
  })
})
