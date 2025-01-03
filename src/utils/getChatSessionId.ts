import { MEMORY_BLANK_SPACE } from "./constant";

type GetChatSessionId = {
  roomId: string
  userId: string
  billNumber: string
}

export const getChatSessionId = ({roomId, billNumber, userId}: GetChatSessionId) =>
    `${userId}${MEMORY_BLANK_SPACE}${roomId}${MEMORY_BLANK_SPACE}${billNumber}`