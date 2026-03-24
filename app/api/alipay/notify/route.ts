import { alipay } from '@/lib/alipay'
import { syncAlipayPayment } from '@/app/actions/payment'

export const runtime = 'nodejs'

function toNotificationPayload(formData: FormData) {
  return Object.fromEntries(
    Array.from(formData.entries()).map(([key, value]) => [key, String(value)]),
  )
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const notification = toNotificationPayload(formData)

    if (!alipay.checkNotifySignV2(notification)) {
      console.error('[alipay] Notify signature verification failed')
      return new Response('failure', { status: 400 })
    }

    const tradeStatus = notification.trade_status || ''

    if (tradeStatus === 'WAIT_BUYER_PAY') {
      return new Response('success')
    }

    await syncAlipayPayment({
      checkoutReference: notification.out_trade_no || '',
      providerTransactionId: notification.trade_no || undefined,
      totalAmount: notification.total_amount || undefined,
      productName: notification.subject || undefined,
      tradeStatus,
    })

    return new Response('success')
  } catch (error) {
    console.error('[alipay] Failed to process notify callback:', error)
    return new Response('failure', { status: 500 })
  }
}
