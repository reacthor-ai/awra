import { type Chat, ChatType, prisma } from '@/lib/prisma'

interface ChatCreationResult {
  success: boolean
  chat?: Chat
  error?: string
}

type GetOrCreateBillChat = {
  userId: string
  roomId: string
  title?: string
  congress?: number
  billType?: string
}

export async function getOrCreateBillChat(params: GetOrCreateBillChat): Promise<ChatCreationResult> {
  const {
    userId,
    roomId,
    title,
    congress,
    billType,
  } = params

  try {
    const existingChat = await prisma.chat.findFirst({
      where: {
        userId,
        roomId,
      },
    })

    if (existingChat) {
      return {
        success: true,
        chat: existingChat,
      }
    }

    const user = await prisma.user.findUnique({
      where: {id: userId},
      include: {
        _count: {
          select: {chats: true}
        }
      }
    })

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      }
    }

    const newChat = await prisma.$transaction(async (tx) =>
      await tx.chat.create({
        data: {
          userId,
          roomId,
          title: title || `Chat ${roomId}`,
          chatType: ChatType.BILL,
          metadata: {
            congress,
            billType
          }
        },
      })
    )

    return {
      success: true,
      chat: newChat,
    }
  } catch (error) {
    console.error('Error in getOrCreateChat:', error)
    return {
      success: false,
      error: 'Failed to create chat',
    }
  }
}