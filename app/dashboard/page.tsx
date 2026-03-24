import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Link from 'next/link'
import { formatPrice } from '@/lib/products'
import { getUserSubscription, getUserPayments } from '@/app/actions/payment'
import { getUserImages } from '@/app/actions/upload'
import { ImageGallery } from '@/components/image-gallery'

export const metadata = {
  title: 'Dashboard',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const [subscription, payments, images] = await Promise.all([
    getUserSubscription(),
    getUserPayments(),
    getUserImages(),
  ])

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {user.email}
            </p>
          </div>
          <form
            action={async () => {
              'use server'
              const supabase = await createClient()
              await supabase.auth.signOut()
              redirect('/auth/login')
            }}
          >
            <Button variant="outline">Sign Out</Button>
          </form>
        </div>

        {/* Subscription Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Current Subscription</CardTitle>
            <CardDescription>Manage your subscription plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Plan</p>
                <p className="text-2xl font-bold capitalize">
                  {subscription?.plan_name || 'free'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <Badge
                  variant={
                    subscription?.status === 'active' ? 'default' : 'secondary'
                  }
                >
                  {subscription?.status || 'active'}
                </Badge>
              </div>
              {subscription?.current_period_end && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Renewal Date
                  </p>
                  <p className="text-lg">
                    {new Date(subscription.current_period_end).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
            <div className="mt-6">
              <Button asChild>
                <Link href="/pricing">Upgrade Plan</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Image Gallery */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>我的图片</CardTitle>
            <CardDescription>已上传和处理的图片</CardDescription>
          </CardHeader>
          <CardContent>
            {images.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">还没有上传过图片</p>
                <Button className="mt-4" asChild>
                  <Link href="/">开始抠图</Link>
                </Button>
              </div>
            ) : (
              <ImageGallery images={images} />
            )}
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>Your recent transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No payments yet</p>
                <Button className="mt-4" asChild>
                  <Link href="/pricing">Browse Plans</Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {payment.product_name}
                      </TableCell>
                      <TableCell>
                        {formatPrice(payment.amount_cents, payment.currency || 'usd')}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            payment.status === 'succeeded'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(payment.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
