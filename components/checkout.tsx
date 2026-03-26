'use client'

import { useCallback, useEffect, useState } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'

type PaymentStatus = 'idle' | 'checking' | 'success' | 'failed'

interface AlipayReturn {
  outTradeNo: string
  success?: boolean
}

export default function Checkout({ 
  productId,
  alipayReturn 
}: { 
  productId: string
  alipayReturn?: AlipayReturn
}) {
  const [alipayError, setAlipayError] = useState<string | null>(null)
  const [isStartingAlipay, setIsStartingAlipay] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle')

  // Check payment status when returning from Alipay
  useEffect(() => {
    if (alipayReturn?.outTradeNo) {
      if (alipayReturn.success) {
        setPaymentStatus('success')
      } else {
        setPaymentStatus('failed')
      }
    }
  }, [alipayReturn])

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
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Pay with Alipay</h2>
          
          {paymentStatus === 'checking' && (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <span>Checking payment status...</span>
            </div>
          )}
          
          {paymentStatus === 'success' && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Payment successful!</span>
            </div>
          )}
          
          {paymentStatus === 'failed' && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <XCircle className="h-5 w-5" />
              <span className="font-medium">Payment failed. Please try again.</span>
            </div>
          )}
          
          {paymentStatus === 'idle' && (
            <>
              <p className="text-sm text-muted-foreground">
                Click the button below to proceed with Alipay payment.
              </p>
              <Button onClick={handleAlipayCheckout} disabled={isStartingAlipay}>
                {isStartingAlipay ? 'Redirecting to Alipay...' : 'Pay with Alipay'}
              </Button>
              {alipayError && (
                <p className="text-sm text-destructive">{alipayError}</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
