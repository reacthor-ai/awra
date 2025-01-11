import { CompassIcon, LibraryIcon, NewspaperIcon, SettingsIcon, Users } from "lucide-react";
import { useParams } from "next/navigation";
import { navigationLinks } from "@/utils/nav-links";

export type NavId = 'discover' | 'library' | 'settings' | 'live-house'

export type NavItems = {
  label: string
  id: NavId
  icon: typeof Users
}

export const navItems: NavItems[] = [
  {id: 'live-house', label: 'House', icon: NewspaperIcon},
  {id: 'discover', label: 'Bills', icon: CompassIcon},
  {id: 'library', label: 'Library', icon: LibraryIcon},
  {id: 'settings', label: 'Settings', icon: SettingsIcon},
]

export function useNavigate() {
  const params = useParams();

  return function navigate(navId: NavId): string {
    const stateId = params["state"] as string;

    switch (navId) {
      case "discover":
        return navigationLinks.content({stateId})
      case 'library':
        return navigationLinks.library({stateId});
      case 'settings':
        return navigationLinks.settings({stateId});
      case 'live-house':
        return navigationLinks.liveHouse({stateId});
      default:
        return navigationLinks.content({stateId});
    }
  }
}
