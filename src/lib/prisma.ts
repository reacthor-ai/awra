// ts-ignore 7017 is used to ignore the error that the global object is not
// defined in the global scope. This is because the global object is only
// defined in the global scope in Node.js and not in the browser.

import { type Chat, ChatType, PrismaClient, type User as AwraUser } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

type ChatAwraUserExtend = Chat & {
  user: AwraUser
}

export type { AwraUser, Chat, ChatAwraUserExtend }
export { ChatType }

export default prisma