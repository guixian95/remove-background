'use client'

import { useCallback, useState } from 'react'
import { CreditCard, Landmark } from 'lucide-react'
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { startCheckoutSession } from '../app/actions/stripe'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

type PaymentMethod = 'stripe' | 'alipay'

export default function Checkout({ productId }: { productId: string }) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('stripe')
  const [alipayError, setAlipayError] = useState<string | null>(null)
  const [isStartingAlipay, setIsStartingAlipay] = useState(false)

  const startCheckoutSessionForProduct = useCallback(
    () => startCheckoutSession(productId),
    [productId],
  )

  const handleAlipayCheckout = useCallback(async () => {
    try {
      setAlipayError(null)
      setIsStartingAlipay(true)

      const response = await fetch('/api/alipay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      })

      const payload = (await response.json()) as { error?: string; url?: string }

      if (!response.ok || !payload.url) {
        throw new Error(payload.error || 'Failed to start Alipay checkout')
      }

      window.location.assign(payload.url)
    } catch (error) {
      setAlipayError(
        error instanceof Error
          ? error.message
          : 'Failed to start Alipay checkout',
      )
      setIsStartingAlipay(false)
    }
  }, [productId])

  return (
    <div id="checkout" className="space-y-6">
      <div className="grid gap-3 md:grid-cols-2">
        <button
          type="button"
          className={cn(
            'flex items-center justify-between rounded-xl border px-4 py-4 text-left transition-colors',
            paymentMethod === 'stripe'
              ? 'border-primary bg-primary/5'
              : 'border-border bg-background hover:border-primary/40',
          )}
          onClick={() => setPaymentMethod('stripe')}
        >
          <span>
            <span className="block text-sm font-semibold">Stripe</span>
            <span className="block text-sm text-muted-foreground">
              Default embedded card checkout
            </span>
          </span>
          <CreditCard className="size-5 text-muted-foreground" />
        </button>

        <button
          type="button"
          className={cn(
            'flex items-center justify-between rounded-xl border px-4 py-4 text-left transition-colors',
            paymentMethod === 'alipay'
              ? 'border-primary bg-primary/5'
              : 'border-border bg-background hover:border-primary/40',
          )}
          onClick={() => setPaymentMethod('alipay')}
        >
          <span>
            <span className="block text-sm font-semibold">Alipay</span>
            <span className="block text-sm text-muted-foreground">
              Redirect to the Alipay sandbox cashier
            </span>
          </span>
          <Landmark className="size-5 text-muted-foreground" />
        </button>
      </div>

      {paymentMethod === 'stripe' ? (
        <div className="rounded-xl border bg-background p-3">
          <EmbeddedCheckoutProvider
            stripe={stripePromise}
            options={{ clientSecret: startCheckoutSessionForProduct }}
          >
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      ) : (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Pay with Alipay</h2>
            <p className="text-sm text-muted-foreground">
              We will create a sandbox order and send you to Alipay to finish
              the payment.
            </p>
            <Button onClick={handleAlipayCheckout} disabled={isStartingAlipay}>
              {isStartingAlipay ? 'Redirecting to Alipay...' : 'Alipay payment'}
            </Button>
            {alipayError ? (
              <p className="text-sm text-destructive">{alipayError}</p>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}
