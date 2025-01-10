import { ChatItem } from "@/libs/library/chat-item";
import { ChatAwraUserExtend } from "@/lib/prisma";

type LibraryProps = {
  chatList: ChatAwraUserExtend[]
  stateId: string
}

export function Library({chatList, stateId}: LibraryProps) {
  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background backdrop-blur">
        <div className="flex h-14 items-center px-4 gap-4">
          <h1 className="text-2xl font-semibold">Library</h1>
        </div>
      </header>

      <div className="z-0 mx-auto flex w-full flex-1 flex-col overflow-auto px-0 py-4">
        <div className="mx-auto flex w-full flex-1 flex-col gap-4 px-4 pb-4" style={{maxWidth: '1360px'}}>
          <div className="flex h-full w-full flex-col">
            <div className="flex flex-col items-stretch gap-4">
              {chatList.length <= 0 ? <p>Nothing yet!</p> : chatList.map((chat, key) => {
                return (
                  <div key={chat.id} className={`${key + 1 === chatList.length ? 'mb-14' : 'mb-2'}`}>
                    <ChatItem stateId={stateId} chat={chat}/>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

