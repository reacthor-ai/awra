import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import { createHash } from 'crypto'

const GUEST_CHAT_LIMIT = 3

function getHash(ip: string): string {
  const date = new Date().toISOString().split('T')[0]
  return createHash('sha256')
    .update(`${ip}-${date}-${process.env.HASH_SALT || 'default-salt'}`)
    .digest('hex')
}

export async function shouldAllowGuestChat(): Promise<boolean> {
  const headersList = await headers()
  const hash = getHash(headersList.get('x-forwarded-for') || 'unknown')

  const usage = await prisma.anonymousUsage.findFirst({
    where: {hash}
  })

  if (!usage) {
    await prisma.anonymousUsage.create({
      data: {hash, chatCount: 0}
    })
    return true
  }

  return usage.chatCount < GUEST_CHAT_LIMIT
}

export async function incrementAnonymousUsage(): Promise<void> {
  const headersList = await headers()
  const hash = getHash(headersList.get('x-forwarded-for') || 'unknown')
  console.log({hash})
  await prisma.anonymousUsage.upsert({
    where: {hash},
    create: {hash, chatCount: 1},
    update: {chatCount: {increment: 1}}
  })
}

export async function getAnonymousRemainingGuestChats(userId: string): Promise<number | null> {
  const headersList = await headers()
  const user = await prisma.user.findUnique({
    where: {id: userId},
    include: {
      _count: {
        select: {chats: true}
      }
    }
  })

  if (!user || !user?.isGuest) return null

  const hash = getHash(headersList.get('x-forwarded-for') || 'unknown')
  const usage = await prisma.anonymousUsage.findFirst({
    where: {hash}
  })

  const userRemaining = Math.max(0, GUEST_CHAT_LIMIT - user._count.chats)
  const anonymousRemaining = Math.max(0, GUEST_CHAT_LIMIT - (usage?.chatCount || 0))

  return Math.min(userRemaining, anonymousRemaining)
}