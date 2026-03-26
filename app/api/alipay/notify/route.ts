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

    // Log incoming notification for debugging
    console.log('[alipay] Notify received:', {
      out_trade_no: notification.out_trade_no,
      trade_no: notification.trade_no,
      trade_status: notification.trade_status,
      total_amount: notification.total_amount,
      subject: notification.subject,
    })

    if (!alipay.checkNotifySignV2(notification)) {
      console.error('[alipay] Notify signature verification failed', { notification })
      return new Response('failure', { status: 400 })
    }

    const tradeStatus = notification.trade_status || ''

    if (tradeStatus === 'WAIT_BUYER_PAY') {
      console.log('[alipay] Trade status is WAIT_BUYER_PAY, returning success')
      return new Response('success')
    }

    console.log('[alipay] Processing payment sync for trade status:', tradeStatus)
    
    await syncAlipayPayment({
      checkoutReference: notification.out_trade_no || '',
      providerTransactionId: notification.trade_no || undefined,
      totalAmount: notification.total_amount || undefined,
      productName: notification.subject || undefined,
      tradeStatus,
    })

    console.log('[alipay] Payment sync completed successfully')
    return new Response('success')
  } catch (error) {
    console.error('[alipay] Failed to process notify callback:', error)
    return new Response('failure', { status: 500 })
  }
}
