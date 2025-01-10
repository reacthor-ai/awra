import { Skeleton } from "@/components/ui/skeleton"

export default function LibrarySkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background backdrop-blur">
        <div className="flex h-14 items-center px-4 gap-4">
          <Skeleton className="h-8 w-32" />
        </div>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[1360px] px-4 py-4">
          <div className="flex flex-col gap-4">
            {[1, 2, 3, 4, 5].map((index) => (
              <div key={index} className="group border relative flex min-h-[116px] flex-col rounded-lg">
                {/* Content Area */}
                <div className="grid flex-1 auto-rows-min items-start gap-3 p-3 pt-3.5 text-sm">
                  <div className="grid auto-rows-min items-start gap-2">
                    <div className="flex max-w-[90%] items-center gap-1">
                      <Skeleton className="h-5 w-[300px]" />
                    </div>
                    <Skeleton className="h-4 w-[400px]" />
                  </div>
                </div>

                {/* Separator */}
                <div className="mx-3 w-auto h-[1px] bg-gray-100" />

                {/* Footer */}
                <div className="flex items-center p-6 h-11 gap-3 rounded-b-lg px-3 py-0">
                  <div className="flex min-w-0 items-center gap-1">
                    <Skeleton className="h-4 w-4 rounded-sm" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="ml-auto">
                    <Skeleton className="h-7 w-7 rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}