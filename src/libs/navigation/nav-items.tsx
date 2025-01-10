import { CompassIcon, SettingsIcon, Users, LibraryIcon } from "lucide-react";

export type NavId = 'discover' | 'library' | 'settings'

export type NavItems = {
  label: string
  id: NavId
  icon: typeof Users
}

export const navItems: NavItems[] = [
  {id: 'discover', label: 'Bills', icon: CompassIcon},
  {id: 'library', label: 'Library', icon: LibraryIcon},
  {id: 'settings', label: 'Settings', icon: SettingsIcon},
]
