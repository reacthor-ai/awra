import { NavigationSidebar } from "./navigation-sidebar"
import { ChatItem } from "@/libs/library/chat-item";

const chats = [
  {
    id: '1',
    title: 'Improve chat ui',
    preview: "I'm not a big fan of the current chat UI somethings I thin...",
    isLocked: true,
    updatedAt: new Date('2025-01-01T16:32:15'),
    user: {
      username: 'wsissoko65',
      avatar: '/placeholder.svg'
    }
  },
  {
    id: '2',
    title: 'Gumroad payment clone',
    preview: 'Create a payment page where you can accept payment...',
    isLocked: true,
    updatedAt: new Date('2024-12-19'),
    user: {
      username: 'wsissoko65',
      avatar: '/placeholder.svg'
    }
  },
  {
    id: '3',
    title: 'App interface design',
    preview: 'Design the interface for this app - pixel by pixel you can...',
    isLocked: true,
    updatedAt: new Date('2024-12-15'),
    user: {
      username: 'wsissoko65',
      avatar: '/placeholder.svg'
    }
  },
]

export function Library() {
  return (
    <div className="flex h-screen flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur">
        <div className="flex h-14 items-center px-4 gap-4">
          <NavigationSidebar/>
          <h1 className="text-xl font-semibold">Library</h1>
          <div className="ml-auto"/>

        </div>
      </header>

      <div className="flex-1 overflow-auto pb-16 md:pb-0">
        <div className="divide-y divide-gray-800">
          {chats.map((chat) => (
            <ChatItem key={chat.id} chat={chat}/>
          ))}
        </div>
      </div>

    </div>
  )
}

