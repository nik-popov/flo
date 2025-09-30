import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import App from './App.jsx'

const createFetchResponse = (body) =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(body),
  })

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
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
    const providerButton = screen.getByRole('button', { name: /add from sample store/i })
    fireEvent.click(providerButton)

    const secondProviderButton = screen.getByRole('button', { name: /add from uptown market/i })
    fireEvent.click(secondProviderButton)

    const cartToggle = await screen.findByRole('button', { name: /cart \(2\) · \$5\.28/i })
    expect(cartToggle).toBeInTheDocument()

    const cartDialog = await screen.findByRole('dialog', { name: /your cart/i })
    expect(cartDialog).toBeInTheDocument()

    const quantityInputs = await screen.findAllByRole('spinbutton', { name: /qty/i })
    expect(quantityInputs).toHaveLength(2)

    expect(screen.getByText(/Total: \$5\.28/)).toBeInTheDocument()
  expect(screen.getAllByText(/Sample Store/)).not.toHaveLength(0)
  expect(screen.getAllByText(/Uptown Market/)).not.toHaveLength(0)
    expect(screen.getByText(/Cart includes items from Sample Store, Uptown Market./i)).toBeInTheDocument()
  })
})
