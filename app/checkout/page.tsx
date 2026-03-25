import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Checkout from '@/components/checkout'
import { PRODUCTS } from '@/lib/products'
import { syncAlipayPayment } from '@/app/actions/payment'

export const metadata = {
  title: 'Checkout',
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    product?: string
    provider?: string
    out_trade_no?: string
    trade_no?: string
    total_amount?: string
    sign?: string
  }>
}) {
  const params = await searchParams
  const { product, provider, out_trade_no, trade_no, total_amount } = params
  
  // Check if user is authenticated
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/pricing')
  }

  // Validate product
  if (!product || !PRODUCTS.find((p) => p.id === product)) {
    redirect('/pricing')
  }

  // Handle Alipay return - update payment status
  let alipayReturn = undefined
  if (provider === 'alipay' && out_trade_no && trade_no) {
    try {
      await syncAlipayPayment({
        checkoutReference: out_trade_no,
        providerTransactionId: trade_no,
        totalAmount: total_amount,
        tradeStatus: 'TRADE_SUCCESS',
      })
      alipayReturn = { outTradeNo: out_trade_no, success: true }
    } catch (error) {
      console.error('Failed to sync Alipay payment:', error)
      alipayReturn = { outTradeNo: out_trade_no, success: false }
    }
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Complete Your Purchase</h1>
          <p className="text-muted-foreground">
            Choose Stripe or Alipay to complete your purchase securely
          </p>
        </div>

        <Suspense fallback={<div className="text-center py-12">Loading checkout...</div>}>
          <Checkout 
            productId={product} 
            alipayReturn={alipayReturn}
          />
        </Suspense>
      </div>
    </div>
  )
}
