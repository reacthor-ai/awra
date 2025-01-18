import NextAuth, { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import EmailProvider from "next-auth/providers/email"
import type { AwraUser } from "@/lib/prisma"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import nodemailer from 'nodemailer'

const config = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        secure: true,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
      normalizeIdentifier(identifier: string): string {
        let [local, domain] = identifier.toLowerCase().trim().split("@")
        domain = domain.split(",")[0]
        return `${local}@${domain}`
      },
      async sendVerificationRequest(params) {
        const {
          identifier: email,
          url,
          provider,
          theme,
        } = params
        const {host} = new URL(url)
        const transport = nodemailer.createTransport(provider.server)
        try {
          await transport.sendMail({
            to: email,
            from: provider.from,
            subject: `Sign in to ${host}`,
            text: `Sign in to ${host}\n${url}\n\n`,
            html: `
  <body style="margin: 0; padding: 0; background: #000000;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" 
      style="background: #000000; padding: 20px;">
      <tr>
        <td align="center">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" 
            style="background: #111111; max-width: 600px; margin: auto; border-radius: 16px; overflow: hidden; border: 1px solid #222222;">
            <!-- Header Image -->
            
            <!-- Main Content -->
            <tr>
              <td style="padding: 40px 30px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <!-- Title -->
                  <tr>
                    <td align="center" 
                      style="padding: 0 0 30px 0; font-size: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff; font-weight: 500;">
                      Sign in to <strong style="color: #ffffff;">${host}</strong>
                    </td>
                  </tr>
                  
                  <!-- Button -->
                  <tr>
                    <td align="center" style="padding: 20px 0 30px 0;">
                      <table border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td align="center">
                            <a href="${url}"
                              target="_blank"
                              style="background: #ffffff; color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; text-decoration: none; border-radius: 8px; padding: 12px 30px; display: inline-block; font-weight: 500; transition: all 0.2s; border: none;">
                              Sign in to Awra
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer Text -->
                  <tr>
                    <td align="center"
                      style="padding: 0; font-size: 14px; line-height: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #666666;">
                      If you did not request this email, you can safely ignore it.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="padding: 20px 30px; background: #191919;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td align="center"
                      style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; color: #666666;">
                      © 2024 Awra. All rights reserved.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
`
          })
        } catch (error) {
          console.log({error})
          throw new Error(`Email sending failed: ${error}`)
        }
      },
    }),
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
  ],
  callbacks: {
    async redirect({url, baseUrl}) {
      if (url.startsWith('/')) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl + '/dashboard'
    },
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
        })

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

      if (account?.provider === 'email') {
        const existingGuest = await prisma.user.findFirst({
          where: {
            isGuest: true,
            email: user.email
          }
        })

        if (existingGuest) {
          await prisma.user.update({
            where: {id: existingGuest.id},
            data: {
              isGuest: false,
              guestId: null,
              emailVerified: new Date(),
              lastLoginAt: new Date()
            }
          })

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
  pages: {
    verifyRequest: '/auth/verify-request',
  }
} satisfies NextAuthOptions

export const handler = NextAuth(config)

export function auth() {
  return getServerSession(config)
}