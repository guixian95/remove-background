export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  images?: string[]
}

// Product catalog - source of truth for all products
// IDs here must match the IDs passed to checkout
export const PRODUCTS: Product[] = [
  {
    id: 'free-plan',
    name: 'Free Plan',
    description: 'Perfect for getting started',
    priceInCents: 0,
  },
  {
    id: 'pro-plan',
    name: 'Pro Plan',
    description: 'For power users - 1000 images/month, priority support',
    priceInCents: 9999, // $99.99
  },
  {
    id: 'enterprise-plan',
    name: 'Enterprise Plan',
    description: 'Unlimited images, dedicated support, custom features',
    priceInCents: 29999, // $299.99
  },
  {
    id: 'remove-bg-one-time',
    name: 'Remove Background (One-Time)',
    description: 'Single-use background removal - 50 images',
    priceInCents: 1999, // $19.99
  },
]

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((product) => product.id === id)
}

export function formatPrice(priceInCents: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(priceInCents / 100)
}
