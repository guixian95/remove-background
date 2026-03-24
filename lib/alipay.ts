import 'server-only'

import { AlipaySdk } from 'alipay-sdk'

const DEFAULT_ALIPAY_GATEWAY =
  'https://openapi-sandbox.dl.alipaydev.com/gateway.do'

function getRequiredEnv(name: string) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

function normalizePem(value: string) {
  return value.replace(/\\n/g, '\n').trim()
}

export const alipay = new AlipaySdk({
  appId: getRequiredEnv('ALIPAY_APP_ID'),
  privateKey: normalizePem(getRequiredEnv('ALIPAY_PRIVATE_KEY')),
  alipayPublicKey: normalizePem(getRequiredEnv('ALIPAY_PUBLIC_KEY')),
  gateway: process.env.ALIPAY_GATEWAY || DEFAULT_ALIPAY_GATEWAY,
  keyType: 'PKCS8',
  signType: 'RSA2',
})

export const ALIPAY_SUCCESS_STATUSES = new Set([
  'TRADE_SUCCESS',
  'TRADE_FINISHED',
])

export function formatAlipayAmount(amountCents: number) {
  return (amountCents / 100).toFixed(2)
}

export function parseAlipayAmount(totalAmount: string) {
  return Math.round(Number(totalAmount) * 100)
}

export function buildAlipayReturnUrl(searchParams: Record<string, string>) {
  const url = new URL(
    process.env.ALIPAY_RETURN_URL || 'http://localhost:3000/checkout',
  )

  Object.entries(searchParams).forEach(([key, value]) => {
    url.searchParams.set(key, value)
  })

  return url.toString()
}
