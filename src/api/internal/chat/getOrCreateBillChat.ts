import { type Chat, ChatType, prisma } from '@/lib/prisma'
import { incrementAnonymousUsage, shouldAllowGuestChat } from "@/api/internal/anonymous/tracking";

const GUEST_CHAT_LIMIT = 3

interface ChatCreationResult {
  success: boolean
  chat?: Chat
  error?: string
  remainingChats?: number | null
}

type GetOrCreateBillChat = {
  userId: string
  roomId: string
  title?: string
  congress?: number
  billType?: string
}

export async function getOrCreateBillChat(params: GetOrCreateBillChat, req: Request): Promise<ChatCreationResult> {
  const {
    userId,
    roomId,
    title,
    congress,
    billType,
  } = params

  try {
    // First, try to find an existing chat for this user and roomId
    const existingChat = await prisma.chat.findFirst({
      where: {
        userId,
        roomId,
      },
    })

    // If chat exists, return it without incrementing usage
    if (existingChat) {
      return {
        success: true,
        chat: existingChat,
      }
    }

    // Get user details and their current chat count in one query
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

    if (user.isGuest) {
      const canUseGuest = await shouldAllowGuestChat()
      if (!canUseGuest) {
        return {
          success: false,
          error: 'Guest access limit reached. Please sign in to continue.',
          remainingChats: 0,
        }
      }

      if (user._count.chats >= GUEST_CHAT_LIMIT) {
        return {
          success: false,
          error: 'Guest chat limit reached. Please sign in to create more chats.',
          remainingChats: 0,
        }
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

    // Increment anonymous usage tracking after successful creation
    if (user.isGuest) {
      await incrementAnonymousUsage()
    }

    const remainingChats = user.isGuest ?
      GUEST_CHAT_LIMIT - (user._count.chats + 1) :
      null

    return {
      success: true,
      chat: newChat,
      remainingChats,
    }
  } catch (error) {
    console.error('Error in getOrCreateChat:', error)
    return {
      success: false,
      error: 'Failed to create chat',
    }
  }
}