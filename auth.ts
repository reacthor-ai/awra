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
      },
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

        const existingUser = await prisma.user.findFirst({
          where: {
            OR: [
              {email: user.email},
              {isGuest: true, email: user.email}
            ]
          },
          include: {
            accounts: true
          }
        });

        if (existingUser && profile) {
          const updatedUser = await prisma.user.update({
            where: {id: existingUser.id},
            data: {
              name: profile.name,
              image: (profile as { picture: string }).picture,
              isGuest: false,
              emailVerified: new Date(),
              lastLoginAt: new Date(),
              ...(existingUser.isGuest ? {email: profile.email} : {})
            }
          })
          user.name = updatedUser.name
          user.email = updatedUser.email
          user.image = updatedUser.image
          user.isGuest = updatedUser.isGuest
          user.guestId = updatedUser.guestId
          user.id = updatedUser.id
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
        token.id = user.id
        token.isGuest = user.isGuest
        token.name = profile.name
        token.email = profile.email
        token.guestId = user.guestId
        token.picture = (profile as { picture: string }).picture
        token.isGuest = false
      }

      return token
    },
    async session({session, token}) {
      const authenticatedUser = await prisma.user.findFirst({
        where: {
          email: token.email,
          isGuest: false
        },
      })

      if (authenticatedUser) {
        return {
          ...session,
          user: {
            ...authenticatedUser,
            id: authenticatedUser.id,
            guestId: authenticatedUser.guestId
          }
        }
      }

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

      if (account?.provider === 'google' && profile) {
        const existingUser = await prisma.user.findUnique({
          where: {email: profile.email}
        });

        const existingGuest = await prisma.user.findFirst({
          where: {
            isGuest: true,
            email: user.email
          }
        });

        if (existingGuest) {
          if (existingUser && existingUser.id !== existingGuest.id) {
            // If there's already a user with this email,
            // we should merge the guest data with the existing user
            // and delete the guest account
            await prisma.$transaction(async (tx) => {
              await tx.chat.updateMany({
                where: {userId: existingGuest.id},
                data: {userId: existingUser.id}
              });

              // Update the existing user
              await tx.user.update({
                where: {id: existingUser.id},
                data: {
                  name: profile.name,
                  image: (profile as { picture: string }).picture,
                  emailVerified: new Date(),
                  lastLoginAt: new Date()
                }
              });
            });
          } else {
            // If no existing user with this email, update the guest
            await prisma.user.update({
              where: {id: existingGuest.id},
              data: {
                name: profile.name,
                email: profile.email,
                image: (profile as { picture: string }).picture,
                isGuest: false,
                guestId: null,
                emailVerified: new Date(),
                lastLoginAt: new Date()
              }
            });
          }
        }
      } else {
        await prisma.user.update({
          where: {id: user.id},
          data: {lastLoginAt: new Date()}
        });
      }
    },
    async signOut({token}) {
      if (token.id) {
        if (!token?.isGuest) {
          await prisma.$transaction([
            prisma.session.deleteMany({
              where: {userId: token.id},
            }),
            prisma.account.deleteMany({
              where: {userId: token.id},
            }),
          ]);
        }
      }
    }
  }
} satisfies NextAuthOptions

export const handler = NextAuth(config)

export function auth() {
  return getServerSession(config)
}