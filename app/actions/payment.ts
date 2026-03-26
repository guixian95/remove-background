'use server'

import { createServerClient } from '@supabase/ssr'

import { ALIPAY_SUCCESS_STATUSES, parseAlipayAmount } from '@/lib/alipay'
import { PRODUCTS } from '@/lib/products'
import { createClient } from '@/lib/supabase/server'

type PaymentStatus = 'succeeded' | 'pending' | 'failed'

function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SB_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY for privileged payment updates')
  }

  return createServerClient(supabaseUrl, serviceRoleKey, {
    cookies: {
      getAll() {
        return []
      },
      setAll() {},
    },
  })
}

async function updateSubscriptionForUser({
  userId,
  planName,
  currentPeriodStart,
  currentPeriodEnd,
}: {
  userId: string
  planName: string
  currentPeriodStart?: Date
  currentPeriodEnd?: Date
}) {
  const supabase = createAdminClient()

  const { data: existingSubscription, error: existingSubscriptionError } =
    await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()

  if (existingSubscriptionError) {
    throw new Error(
      `Failed to load subscription before update: ${existingSubscriptionError.message}`,
    )
  }

  const subscriptionPayload = {
    plan_name: planName,
    current_period_start: currentPeriodStart?.toISOString(),
    current_period_end: currentPeriodEnd?.toISOString(),
    status: 'active',
    updated_at: new Date().toISOString(),
  }

  const result = existingSubscription
    ? await supabase
        .from('subscriptions')
        .update(subscriptionPayload)
        .eq('user_id', userId)
        .select()
    : await supabase
        .from('subscriptions')
        .insert([
          {
            user_id: userId,
            ...subscriptionPayload,
          },
        ])
        .select()

  if (result.error) {
    throw new Error(`Failed to update subscription: ${result.error.message}`)
  }

  return result.data
}

function getPlanNameFromProductName(productName: string) {
  const product = PRODUCTS.find((item) => item.name === productName)

  if (!product) {
    return null
  }

  switch (product.id) {
    case 'pro-plan':
      return 'pro'
    case 'enterprise-plan':
      return 'enterprise'
    case 'free-plan':
      return 'free'
    default:
      return null
  }
}

export async function recordPayment({
  stripePaymentIntentId,
  stripeCheckoutSessionId,
  amountCents,
  currency = 'usd',
  productName,
  status = 'succeeded',
}: {
  stripePaymentIntentId?: string
  stripeCheckoutSessionId?: string
  amountCents: number
  currency?: string
  productName: string
  status?: PaymentStatus
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('payments')
    .insert([
      {
        user_id: user.id,
        stripe_payment_intent_id: stripePaymentIntentId,
        stripe_checkout_session_id: stripeCheckoutSessionId,
        amount_cents: amountCents,
        currency,
        status,
        product_name: productName,
      },
    ])
    .select()

  if (error) {
    console.error('[v0] Payment recording error:', error)
    throw new Error(`Failed to record payment: ${error.message}`)
  }

  return data
}

export async function syncAlipayPayment({
  checkoutReference,
  providerTransactionId,
  totalAmount,
  productName,
  tradeStatus,
}: {
  checkoutReference: string
  providerTransactionId?: string
  totalAmount?: string
  productName?: string
  tradeStatus: string
}) {
  if (!checkoutReference) {
    throw new Error('Missing Alipay checkout reference')
  }

  const supabase = createAdminClient()
  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .select('*')
    .eq('stripe_checkout_session_id', checkoutReference)
    .maybeSingle()

  if (paymentError) {
    throw new Error(`Failed to load payment for Alipay callback: ${paymentError.message}`)
  }

  if (!payment) {
    throw new Error(`Payment not found for checkout reference: ${checkoutReference}`)
  }

  if (totalAmount && payment.amount_cents !== parseAlipayAmount(totalAmount)) {
    throw new Error('Alipay amount does not match the recorded payment amount')
  }

  if (productName && payment.product_name && payment.product_name !== productName) {
    throw new Error('Alipay product name does not match the recorded payment')
  }

  const nextStatus: PaymentStatus = ALIPAY_SUCCESS_STATUSES.has(tradeStatus)
    ? 'succeeded'
    : tradeStatus === 'TRADE_CLOSED'
      ? 'failed'
      : 'pending'

  if (
    payment.status === nextStatus &&
    (!providerTransactionId || payment.stripe_payment_intent_id === providerTransactionId)
  ) {
    return payment
  }

  const { data: updatedPayment, error: updateError } = await supabase
    .from('payments')
    .update({
      status: nextStatus,
      stripe_payment_intent_id:
        providerTransactionId || payment.stripe_payment_intent_id,
    })
    .eq('id', payment.id)
    .select('*')
    .maybeSingle()

  if (updateError) {
    throw new Error(`Failed to update Alipay payment: ${updateError.message}`)
  }

  if (!updatedPayment) {
    throw new Error('Failed to load updated Alipay payment record')
  }

  const planName = getPlanNameFromProductName(updatedPayment.product_name || '')

  if (nextStatus === 'succeeded' && planName) {
    const currentPeriodStart = new Date()
    const currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    await updateSubscriptionForUser({
      userId: updatedPayment.user_id,
      planName,
      currentPeriodStart,
      currentPeriodEnd,
    })
  }

  return updatedPayment
}

export async function updateSubscription({
  planName,
  stripeCustomerId,
  stripeSubscriptionId,
  currentPeriodStart,
  currentPeriodEnd,
}: {
  planName: string
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  currentPeriodStart?: Date
  currentPeriodEnd?: Date
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  // First check if subscription exists
  const { data: existingSubscription } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  let result
  if (existingSubscription) {
    // Update existing subscription
    result = await supabase
      .from('subscriptions')
      .update({
        plan_name: planName,
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: stripeSubscriptionId,
        current_period_start: currentPeriodStart?.toISOString(),
        current_period_end: currentPeriodEnd?.toISOString(),
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .select()
  } else {
    // Create new subscription
    result = await supabase
      .from('subscriptions')
      .insert([
        {
          user_id: user.id,
          plan_name: planName,
          stripe_customer_id: stripeCustomerId,
          stripe_subscription_id: stripeSubscriptionId,
          current_period_start: currentPeriodStart?.toISOString(),
          current_period_end: currentPeriodEnd?.toISOString(),
          status: 'active',
        },
      ])
      .select()
  }

  if (result.error) {
    console.error('[v0] Subscription update error:', result.error)
    throw new Error(`Failed to update subscription: ${result.error.message}`)
  }

  return result.data
}

export async function getUserSubscription() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    // 表可能不存在或 RLS 策略问题，静默处理
    return null
  }

  return data
}

export async function getUserPayments() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[v0] Failed to fetch payments:', error)
    return []
  }

  return data || []
}
