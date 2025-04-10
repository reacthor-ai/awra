import { Skeleton } from "@/components/ui/skeleton";

export const BillCardSkeleton = () => (
  <div className="bg-black/5 mx-7 max-w-full mt-4 dark:bg-white/5 rounded-xl overflow-hidden">
    <Skeleton className="w-full aspect-[4/2]"/>

    <div className="p-4 space-y-2">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-16"/>
        <Skeleton className="h-5 w-24"/>
      </div>

      <div className="space-y-2">
        <Skeleton className="h-7 w-32"/>
        <Skeleton className="h-4 w-full"/>
      </div>
      <Skeleton className="h-11 w-full mt-4"/>
    </div>
  </div>
);

export const BillGridSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
    {[...Array(9)].map((_, index) => (
      <BillCardSkeleton key={index}/>
    ))}
  </div>
);