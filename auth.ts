import NextAuth, { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import type { AwraUser } from "@/lib/prisma"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next";

const config = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt" // Explicitly set JWT strategy
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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

        // Try to find existing guest user
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
    async jwt({token, user: nextAuthUser, trigger, session}) {
      const user = nextAuthUser as AwraUser
      if (user) {
        token.id = user.id
        token.isGuest = user.isGuest
        token.guestId = user.guestId
        token.name = user.name
        token.email = user.email
      }

      if (trigger === "update" && session) {
        return {...token, ...session}
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
          email: token.email
        }
      }
    }
  },
  events: {
    async signIn({user: nextAuthUser}) {
      const user = nextAuthUser as AwraUser
      if (user.isGuest) {
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