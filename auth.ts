import NextAuth, { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import type { AwraUser } from "@/lib/prisma"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"

const config = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt"
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      id: "guest",
      name: "Guest",
      credentials: {
        guestId: {type: "text"}
      },
      async authorize(credentials) {
        if (!credentials?.guestId) {
          throw new Error('Guest ID is required')
        }

        let user = await prisma.user.findFirst({
          where: {
            guestId: credentials.guestId
          }
        })

        if (!user) {
          user = await prisma.user.create({
            data: {
              name: `Guest_${Math.floor(Math.random() * 10000)}`,
              guestId: credentials.guestId,
              isGuest: true,
              email: `${credentials.guestId}@guest.local`,
              accounts: {
                create: {
                  type: "guest",
                  provider: "guest",
                  providerAccountId: credentials.guestId,
                }
              }
            }
          })
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          isGuest: user.isGuest,
          guestId: user.guestId
        }
      }
    })
  ],
  callbacks: {
    async signIn({user: nextAuthUser, account, profile}) {
      const user = nextAuthUser as AwraUser
      if (account?.provider === 'google') {
        if (!(profile as { email_verified: boolean })?.email_verified) {
          return false
        }

        const existingGuest = await prisma.user.findFirst({
          where: {
            isGuest: true,
            email: user.email
          }
        })

        if (existingGuest && profile) {
          const updatedUser = await prisma.user.update({
            where: {id: existingGuest.id},
            data: {
              name: profile.name,
              email: profile.email,
              image: (profile as { picture: string }).picture,
              isGuest: false,
              emailVerified: new Date(),
              lastLoginAt: new Date()
            }
          })

          user.name = updatedUser.name
          user.email = updatedUser.email
          user.image = updatedUser.image
          user.isGuest = updatedUser.isGuest
          return true
        }
      }

      return true
    },
    async jwt({token, user: nextAuthUser, account, profile}) {
      const user = nextAuthUser as AwraUser
      if (user) {
        token.id = user.id
        token.isGuest = user.isGuest
        token.guestId = user.guestId
        token.name = user.name
        token.email = user.email
        token.picture = user.image
      }

      if (account?.provider === 'google' && profile) {
        token.name = profile.name
        token.email = profile.email
        token.picture = (profile as { picture: string }).picture
        token.isGuest = false
      }

      return token
    },
    async session({session, token}) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          isGuest: token.isGuest,
          guestId: token.guestId,
          name: token.name,
          email: token.email,
          image: token.picture
        }
      }
    }
  },
  events: {
    async signIn({user: nextAuthUser, account, profile}) {
      const user = nextAuthUser as AwraUser

      // Handle Google sign in
      if (account?.provider === 'google' && profile) {
        await prisma.user.update({
          where: {id: user.id},
          data: {
            emailVerified: new Date(),
            lastLoginAt: new Date(),
            name: profile.name,
            image: (profile as {picture: string}).picture,
            email: profile.email,
            isGuest: false
          }
        })
      } else {
        // Update lastLoginAt for guest users
        await prisma.user.update({
          where: {id: user.id},
          data: {lastLoginAt: new Date()}
        })
      }
    }
  }
} satisfies NextAuthOptions

export const handler = NextAuth(config)

export function auth() {
  return getServerSession(config)
}