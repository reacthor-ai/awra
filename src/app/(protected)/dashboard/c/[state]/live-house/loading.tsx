import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import MainNavigation from "@/libs/navigation/main";

export default function LiveHouseLoadingPage() {
  return (
    <MainNavigation title='Live house'>
      <div className="flex h-screen flex-col bg-background">
        <header className="sticky top-0 z-50 bg-background border-b border-border/40">
          <div className="container mx-auto px-4 py-4">
            <Skeleton className="h-8 w-64"/>
          </div>
        </header>

        <Tabs defaultValue="overview" className="flex-1 overflow-hidden">
          <div className="container mx-auto px-4 py-6">
            <TabsList className="mb-6 bg-background/50 p-1 rounded-full inline-flex">
              <TabsTrigger value="overview"
                           className="rounded-full px-4 py-2 text-sm font-medium transition-colors">Overview</TabsTrigger>
              <TabsTrigger value="video-analysis"
                           className="rounded-full px-4 py-2 text-sm font-medium transition-colors">Video
                Analysis</TabsTrigger>
              <TabsTrigger value="engagement"
                           className="rounded-full px-4 py-2 text-sm font-medium transition-colors">Engagement</TabsTrigger>
            </TabsList>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2 space-y-6 overflow-auto h-[calc(100vh-12rem)] pr-4">
                <TabsContent value="overview" className="space-y-6">
                  <OverviewTabSkeleton/>
                </TabsContent>

                <TabsContent value="video-analysis" className="space-y-6">
                  <VideoAnalysisTabSkeleton/>
                </TabsContent>

                <TabsContent value="engagement" className="space-y-6">
                  <EngagementTabSkeleton/>
                </TabsContent>
              </div>

              <ScrollArea className="h-[calc(100vh-8rem)] mb-10">
                <div className="space-y-6 pr-4">
                  <SidebarSkeleton/>
                </div>
              </ScrollArea>
            </div>
          </div>
        </Tabs>
      </div>
    </MainNavigation>
  )
}

function OverviewTabSkeleton() {
  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="bg-background pb-2">
          <Skeleton className="h-6 w-48"/>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Skeleton className="h-8 w-32 mb-2"/>
              <Skeleton className="h-4 w-24"/>
            </div>
            <Badge variant="secondary" className="text-xs px-2 py-1">
              <Skeleton className="h-4 w-16"/>
            </Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-muted/30 p-3 rounded-lg">
                <Skeleton className="h-4 w-24 mb-2"/>
                <Skeleton className="h-4 w-full"/>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32"/>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[200px] w-full"/>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}

function VideoAnalysisTabSkeleton() {
  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="bg-background pb-2">
          <Skeleton className="h-6 w-48"/>
        </CardHeader>
        <CardContent className="pt-4">
          <Skeleton className="aspect-video w-full"/>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32"/>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[150px] w-full"/>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32"/>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[100px] w-full"/>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48"/>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full"/>
        </CardContent>
      </Card>
    </>
  )
}

function EngagementTabSkeleton() {
  return (
    <>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48"/>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full"/>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32"/>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[200px] w-full"/>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}

function SidebarSkeleton() {
  return (
    <>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32"/>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[100px] w-full mb-4"/>
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-full mb-2"/>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32"/>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-full mb-4"/>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="mb-4">
              <Skeleton className="h-4 w-full mb-2"/>
              <Skeleton className="h-4 w-3/4"/>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  )
}

