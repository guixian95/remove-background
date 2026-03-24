'use server'

import { headers } from 'next/headers'

import { stripe } from '../../lib/stripe'
import { PRODUCTS } from '../../lib/products'
import { createClient } from '@/lib/supabase/server'
import { recordPayment, updateSubscription } from './payment'

export async function startCheckoutSession(productId: string) {
  const product = PRODUCTS.find((p) => p.id === productId)
  if (!product) {
    throw new Error(`Product with id "${productId}" not found`)
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User must be authenticated to checkout')
  }

  // Create Checkout Sessions from body params.
  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded',
    redirect_on_completion: 'never',
    customer_email: user.email,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            description: product.description,
          },
          unit_amount: product.priceInCents,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    metadata: {
      user_id: user.id,
      product_id: productId,
    },
  })

  return session.client_secret
}

export async function getCheckoutSessionStatus(clientSecret: string) {
  const retrievedSession = await stripe.checkout.sessions.retrieve(
    clientSecret.split('_secret_')[0]
  )

  return {
    status: retrievedSession.payment_status,
    customer_email: retrievedSession.customer_email,
  }
}

export async function handleCheckoutComplete(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId)

  if (session.payment_status !== 'paid') {
    throw new Error('Payment not completed')
  }

  const userId = session.metadata?.user_id
  const productId = session.metadata?.product_id

  if (!userId || !productId) {
    throw new Error('Missing metadata in session')
  }

  const product = PRODUCTS.find((p) => p.id === productId)
  if (!product) {
    throw new Error('Product not found')
  }

  // Record payment in database
  await recordPayment({
    stripeCheckoutSessionId: sessionId,
    amountCents: product.priceInCents,
    productName: product.name,
  })

  // Update subscription if it's a plan
  if (
    productId === 'pro-plan' ||
    productId === 'enterprise-plan' ||
    productId === 'free-plan'
  ) {
    const planName =
      productId === 'pro-plan'
        ? 'pro'
        : productId === 'enterprise-plan'
          ? 'enterprise'
          : 'free'

    await updateSubscription({
      planName,
      stripeCustomerId: session.customer as string,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    })
  }
}
