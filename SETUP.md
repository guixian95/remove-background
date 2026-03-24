# Supabase + Stripe Integration Setup

This project includes full authentication and payment integration with Supabase and Stripe.

## What's Been Set Up

### 1. **Supabase Authentication**
- Email/password authentication
- Google OAuth
- GitHub OAuth
- User profiles table with RLS policies
- Automatic profile creation on signup (via database trigger)

### 2. **Database Tables**
- `profiles` - User profile information
- `subscriptions` - User subscription plans
- `payments` - Payment history and transactions
- `usage` - Track user usage quota

### 3. **Stripe Integration**
- Checkout integration (Embedded UI)
- Payment processing and recording
- Product catalog system
- Subscription management

## Environment Variables Required

### Supabase
```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

### Stripe
```
STRIPE_SECRET_KEY=<your-stripe-secret-key>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<your-stripe-publishable-key>
```

### Optional - Email Confirmation Redirect
```
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard
```

## File Structure

```
lib/
  supabase/
    client.ts       - Browser client
    server.ts       - Server client
    middleware.ts   - Token refresh middleware
  stripe.ts         - Stripe client setup
  products.ts       - Product catalog
  
app/
  auth/
    login/          - Login page with OAuth
    sign-up/        - Sign up page with OAuth
    error/          - Auth error page
    sign-up-success/- Confirmation message
  dashboard/        - User dashboard (protected)
  pricing/          - Pricing page
  checkout/         - Checkout page (protected)
  actions/
    stripe.ts       - Stripe checkout actions
    payment.ts      - Payment recording actions

components/
  checkout.tsx      - Stripe checkout component
  header.tsx        - Header with auth state
  
middleware.ts       - Session refresh middleware
```

## Database Setup

The following tables are automatically created:

### profiles
- Stores user profile information
- One-to-one relationship with auth.users
- RLS enabled for user data privacy

### subscriptions
- Tracks user subscription plans (free, pro, enterprise)
- Stores Stripe customer and subscription IDs
- Automatic profile creation via trigger

### payments
- Records all payment transactions
- Stores Stripe payment intent and session IDs
- Tracks payment status

### usage
- Tracks user usage quota (monthly)
- Unique per user per month
- Can be used to enforce rate limits

## Key Features

### Authentication Flow
1. User signs up via email or OAuth (Google/GitHub)
2. If email signup, email confirmation required (configurable)
3. Database trigger auto-creates profile
4. User redirected to dashboard

### Payment Flow
1. User selects plan/product on pricing page
2. Redirected to checkout (requires authentication)
3. Stripe checkout embedded UI
4. After successful payment:
   - Payment recorded in database
   - Subscription updated
   - User returned to dashboard

### Protected Routes
- `/dashboard` - User dashboard
- `/checkout` - Requires authentication

## Database Triggers

### Profile Auto-creation
When a user signs up, a database trigger automatically creates a profile row. This ensures every user has a corresponding profile without requiring them to fill out a form.

The trigger uses `security definer` to bypass RLS policies, preventing email confirmation issues.

## Customization

### Adding Products
Edit `lib/products.ts`:
```typescript
export const PRODUCTS: Product[] = [
  {
    id: 'my-product',
    name: 'My Product',
    description: 'Product description',
    priceInCents: 2999, // $29.99
  },
]
```

### Modifying Auth Providers
Edit the OAuth calls in auth pages to add/remove providers:
```typescript
await supabase.auth.signInWithOAuth({
  provider: 'google' | 'github' | 'discord', // Add more as needed
})
```

### RLS Policies
All RLS policies in the database ensure users can only access their own data. See `scripts/001_create_tables.sql` for policy details.

## Testing

### Test Stripe
Use Stripe's test card numbers:
- `4242 4242 4242 4242` - Successful payment
- `4000 0000 0000 0002` - Declined payment

### Test OAuth Locally
OAuth providers require `localhost` to be configured in their dev consoles. Make sure to add `http://localhost:3000` to your OAuth app's redirect URLs.

## Troubleshooting

### Email Confirmation Loop
If users can't access protected routes after email signup, check:
1. Email redirect URL is set correctly
2. User confirms email via confirmation link
3. Session is established after confirmation

### Stripe Checkout Not Loading
- Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
- Check browser console for errors
- Ensure user is authenticated before accessing checkout

### OAuth Redirect Issues
- Verify redirect URLs in OAuth provider settings
- Check `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` env var
- Ensure cookies are enabled in browser

## Security Notes

- All database tables use RLS policies
- Passwords are hashed by Supabase Auth
- Stripe payment data never stored locally
- Session tokens refreshed automatically
- API routes protected by authentication middleware
