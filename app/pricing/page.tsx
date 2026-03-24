import { PRODUCTS, formatPrice } from '@/lib/products'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export const metadata = {
  title: 'Pricing',
  description: 'Choose the perfect plan for your needs',
}

export default function PricingPage() {
  const plans = PRODUCTS.filter((p) => p.id.includes('plan'))

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground">
            Choose the plan that works best for you
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`flex flex-col ${
                plan.id === 'pro-plan' ? 'border-primary md:scale-105' : ''
              }`}
            >
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="mb-6">
                  {plan.priceInCents === 0 ? (
                    <div className="text-4xl font-bold">Free</div>
                  ) : (
                    <>
                      <div className="text-4xl font-bold">
                        {formatPrice(plan.priceInCents)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        one-time payment
                      </p>
                    </>
                  )}
                </div>

                {plan.id === 'pro-plan' && (
                  <Badge className="mb-6 w-fit">Popular</Badge>
                )}

                <div className="space-y-3 mb-8 flex-1">
                  {plan.id === 'free-plan' && (
                    <>
                      <div className="text-sm">✓ 10 background removals/month</div>
                      <div className="text-sm">✓ Basic support</div>
                      <div className="text-sm">✓ Standard quality</div>
                    </>
                  )}
                  {plan.id === 'pro-plan' && (
                    <>
                      <div className="text-sm">✓ 1,000 background removals/month</div>
                      <div className="text-sm">✓ Priority support</div>
                      <div className="text-sm">✓ HD quality</div>
                      <div className="text-sm">✓ Batch processing</div>
                    </>
                  )}
                  {plan.id === 'enterprise-plan' && (
                    <>
                      <div className="text-sm">✓ Unlimited removals</div>
                      <div className="text-sm">✓ 24/7 dedicated support</div>
                      <div className="text-sm">✓ 4K quality</div>
                      <div className="text-sm">✓ Custom API access</div>
                      <div className="text-sm">✓ SLA guaranteed</div>
                    </>
                  )}
                </div>

                {plan.id === 'free-plan' ? (
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/auth/sign-up">Get Started</Link>
                  </Button>
                ) : (
                  <Button className="w-full" asChild>
                    <Link href={`/checkout?product=${plan.id}`}>
                      Upgrade Now
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* One-time purchases */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8 text-center">
            One-Time Purchases
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {PRODUCTS.filter((p) => p.id.includes('one-time')).map((product) => (
              <Card key={product.id}>
                <CardHeader>
                  <CardTitle>{product.name}</CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <div className="text-3xl font-bold">
                      {formatPrice(product.priceInCents)}
                    </div>
                  </div>
                  <Button className="w-full" asChild>
                    <Link href={`/checkout?product=${product.id}`}>
                      Purchase
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
