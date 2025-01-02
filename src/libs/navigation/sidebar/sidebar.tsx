import { Clock, FolderPlus, Heart, Library, Plus, Save, Star, Upload, Video } from 'lucide-react'
import Link from "next/link"

export function Sidebar() {
  return (
    <aside className="w-64 border-r bg-card p-4 space-y-6">
      <div className="mb-8">
        <Link href="/" className="flex items-center gap-2">
          <Video className="h-6 w-6" />
        </Link>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Explore
          </h2>
          <nav className="space-y-1">
            <Link
              href="#"
              className="flex items-center gap-3 rounded-lg bg-secondary px-4 py-2 text-secondary-foreground"
            >
              <Clock className="h-4 w-4" />
              Recent
            </Link>
            <Link
              href="#"
              className="flex items-center gap-3 rounded-lg px-4 py-2 text-muted-foreground hover:text-primary hover:bg-secondary"
            >
              <Star className="h-4 w-4" />
              Featured
            </Link>
            <Link
              href="#"
              className="flex items-center gap-3 rounded-lg px-4 py-2 text-muted-foreground hover:text-primary hover:bg-secondary"
            >
              <Save className="h-4 w-4" />
              Saved
            </Link>
          </nav>
        </div>

        <div>
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Library
          </h2>
          <nav className="space-y-1">
            <Link
              href="#"
              className="flex items-center gap-3 rounded-lg px-4 py-2 text-muted-foreground hover:text-primary hover:bg-secondary"
            >
              <Video className="h-4 w-4" />
              All videos
            </Link>
            <Link
              href="#"
              className="flex items-center gap-3 rounded-lg px-4 py-2 text-muted-foreground hover:text-primary hover:bg-secondary"
            >
              <Heart className="h-4 w-4" />
              Favorites
            </Link>
            <Link
              href="#"
              className="flex items-center gap-3 rounded-lg px-4 py-2 text-muted-foreground hover:text-primary hover:bg-secondary"
            >
              <Upload className="h-4 w-4" />
              Uploads
            </Link>
            <Link
              href="#"
              className="flex items-center gap-3 rounded-lg px-4 py-2 text-muted-foreground hover:text-primary hover:bg-secondary"
            >
              <FolderPlus className="h-4 w-4" />
              New folder
            </Link>
          </nav>
        </div>
      </div>
    </aside>
  )
}

