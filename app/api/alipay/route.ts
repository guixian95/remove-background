import { NextResponse } from 'next/server'

import { recordPayment } from '@/app/actions/payment'
import {
  alipay,
  buildAlipayReturnUrl,
  formatAlipayAmount,
} from '@/lib/alipay'
import { getProduct } from '@/lib/products'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

function createOutTradeNo(productId: string, userId: string) {
  const compactUserId = userId.replace(/-/g, '').slice(0, 12)
  const compactProductId = productId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20)
  const randomSuffix = Math.random().toString(36).slice(2, 8).toUpperCase()

  return `ALI${Date.now()}${compactUserId}${compactProductId}${randomSuffix}`
}

export async function POST(request: Request) {
  try {
    const { productId } = (await request.json()) as { productId?: string }
    const product = productId ? getProduct(productId) : undefined

    if (!product) {
      return NextResponse.json({ error: 'Invalid product' }, { status: 400 })
    }

    if (product.priceInCents <= 0) {
      return NextResponse.json(
        { error: 'Alipay is only available for paid products' },
        { status: 400 },
      )
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const outTradeNo = createOutTradeNo(product.id, user.id)
    const returnUrl = buildAlipayReturnUrl({
      product: product.id,
      provider: 'alipay',
      outTradeNo,
    })

    const checkoutUrl = alipay.pageExecute('alipay.trade.page.pay', 'GET', {
      returnUrl,
      notifyUrl: process.env.ALIPAY_NOTIFY_URL,
      bizContent: {
        outTradeNo,
        productCode: 'FAST_INSTANT_TRADE_PAY',
        subject: product.name,
        body: product.description,
        totalAmount: formatAlipayAmount(product.priceInCents),
      },
    })

    await recordPayment({
      stripeCheckoutSessionId: outTradeNo,
      amountCents: product.priceInCents,
      currency: 'cny',
      productName: product.name,
      status: 'pending',
    })

    return NextResponse.json({ outTradeNo, url: checkoutUrl })
  } catch (error) {
    console.error('[alipay] Failed to create order:', error)

    return NextResponse.json(
      { error: 'Failed to create Alipay order' },
      { status: 500 },
    )
  }
}
