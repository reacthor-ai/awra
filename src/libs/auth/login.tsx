'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader } from 'lucide-react';
import { NoiseGradient } from "@/libs/web/home/gradient";

export default function Login() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false);
  const {toast} = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const result = await signIn('email', {
      redirect: false,
      email,
      callbackUrl: `${window.location.origin}/dashboard`,
    })
    setIsLoading(false)

    if (result?.error) {
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Check your email",
        description: "We've sent you a magic link to sign in.",
      })
    }
  }

  const handleGoogleSignIn = () => {
    signIn('google', {callbackUrl: '/dashboard'})
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <NoiseGradient/>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading && (
                <Loader className="animate-spin mr-2" size={16}/>
              )}
              {isLoading ? 'Sending you a magic link 🪄...' : '🪄 Magic Link 🪄 '}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

