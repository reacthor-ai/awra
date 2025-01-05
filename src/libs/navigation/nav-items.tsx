import { CompassIcon, SettingsIcon, Users } from "lucide-react";

export type NavId = 'discover' | 'library' | 'settings'

export type NavItems = {
  label: string
  id: NavId
  icon: typeof Users
}

export const navItems: NavItems[] = [
  {id: 'discover', label: 'Discover', icon: CompassIcon},
  {id: 'library', label: 'Library', icon: Users},
  {id: 'settings', label: 'Settings', icon: SettingsIcon},
]
