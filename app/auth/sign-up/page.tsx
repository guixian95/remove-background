'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type OAuthProvider = 'google' | 'github' | 'wechat'

function WeChatIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.5 4.5C4.91 4.5 2 6.93 2 9.93c0 1.72.95 3.26 2.43 4.27L4 17.5l3.17-1.59c.43.07.88.1 1.33.1.18 0 .35-.01.52-.02-.34-.65-.52-1.38-.52-2.15 0-2.93 2.72-5.33 6.06-5.48C13.5 6.08 11.18 4.5 8.5 4.5Z"
        fill="currentColor"
      />
      <path
        d="M16.07 9.5c-3.28 0-5.93 2.16-5.93 4.83 0 1.45.79 2.75 2.04 3.64L11.7 21l2.71-1.35c.54.11 1.1.18 1.66.18 3.27 0 5.93-2.17 5.93-4.84 0-2.66-2.66-4.82-5.93-4.82Z"
        fill="currentColor"
      />
      <circle cx="6.88" cy="9.37" fill="white" r="0.88" />
      <circle cx="10.12" cy="9.37" fill="white" r="0.88" />
      <circle cx="14.47" cy="13.72" fill="white" r="0.82" />
      <circle cx="17.68" cy="13.72" fill="white" r="0.82" />
    </svg>
  )
}

export default function Page() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [oAuthLoading, setOAuthLoading] = useState<OAuthProvider | null>(null)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/dashboard`,
        },
      })
      if (error) throw error
      router.push('/auth/sign-up-success')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignUp = async (provider: OAuthProvider) => {
    const supabase = createClient()
    setOAuthLoading(provider)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        // Supabase supports WeChat, but this project's installed auth types lag behind.
        provider:
          provider as Parameters<typeof supabase.auth.signInWithOAuth>[0]['provider'],
        options: {
          redirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
      if (data?.url) {
        window.location.href = data.url
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
      setOAuthLoading(null)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Sign up</CardTitle>
              <CardDescription>Create a new account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="repeat-password">Repeat Password</Label>
                    </div>
                    <Input
                      id="repeat-password"
                      type="password"
                      required
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                    />
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Creating an account...' : 'Sign up'}
                  </Button>
                </div>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOAuthSignUp('google')}
                  disabled={oAuthLoading === 'google'}
                >
                  {oAuthLoading === 'google' ? 'Signing up...' : 'Google'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOAuthSignUp('github')}
                  disabled={oAuthLoading === 'github'}
                >
                  {oAuthLoading === 'github' ? 'Signing up...' : 'GitHub'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOAuthSignUp('wechat')}
                  disabled={oAuthLoading === 'wechat'}
                >
                  <WeChatIcon className="size-4" />
                  {oAuthLoading === 'wechat' ? 'Signing up...' : 'WeChat'}
                </Button>
              </div>

              <div className="mt-4 text-center text-sm">
                Already have an account?{' '}
                <Link
                  href="/auth/login"
                  className="underline underline-offset-4"
                >
                  Login
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
