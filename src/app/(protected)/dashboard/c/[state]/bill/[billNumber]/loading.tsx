import { Skeleton } from "@/components/ui/skeleton";

export default function BillDetailsSkeleton() {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex-1 flex flex-col">
        {/* Header Skeleton */}
        <div className="border-b">
          <div className="max-w-4xl mx-auto px-4 py-2">
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-8 rounded-full"/>
              <div className="space-y-2">
                <Skeleton className="h-6 w-48"/>
                <Skeleton className="h-4 w-72"/>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area Skeleton */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="space-y-8">
              {/* Questions Grid Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2 border rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4"/>
                      <Skeleton className="h-4 w-48"/>
                    </div>
                    <Skeleton className="h-4 w-full"/>
                    <Skeleton className="h-4 w-3/4"/>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Chat Input Skeleton */}
        <div className="border-t bg-background mb-14 p-4 w-full">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 flex-1 rounded-full"/>
              <Skeleton className="h-12 w-12 rounded-full"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}