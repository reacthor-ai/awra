import Dexie, { type Table } from 'dexie';
import type { VoiceType } from "@/types/ai";

export interface GuestUser {
  id: string;
  name: string;
  createdAt: Date;
  lastLoginAt: Date;
}

export interface UserPreferences {
  userId: string;
  voice: VoiceType;
  updatedAt: Date;
}

export class GuestDB extends Dexie {
  guestUsers!: Table<GuestUser>;
  preferences!: Table<UserPreferences>;

  constructor() {
    super('guestDB');
    this.version(2)
      .stores({
        guestUsers: 'id, name, createdAt, lastLoginAt',
        preferences: 'userId, voice, updatedAt'
      })
      .upgrade(tx => {
        return tx.table('guestUsers').toCollection().each(async user => {
          await tx.table('preferences').add({
            userId: user.id,
            voice: 'analyst',
            updatedAt: new Date()
          });
        });
      });
  }
}

export const db = new GuestDB();

export async function getOrCreateGuestUser(): Promise<GuestUser> {
  let guestUser = await db.guestUsers.toCollection().first();

  if (!guestUser) {
    const newGuest: GuestUser = {
      id: `guest_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      name: `Guest_${Math.floor(Math.random() * 10000)}`,
      createdAt: new Date(),
      lastLoginAt: new Date()
    };

    await db.guestUsers.add(newGuest);
    guestUser = newGuest;
  } else {
    // Update last login time
    await db.guestUsers.update(guestUser.id, {
      lastLoginAt: new Date()
    });
  }

  return guestUser;
}

export async function getUserVoicePreference(userId: string): Promise<VoiceType> {
  const prefs = await db.preferences.get(userId);
  return prefs?.voice || 'uncleSam';
}

export async function updateUserVoicePreference(userId: string, voice: VoiceType): Promise<void> {
  await db.preferences.put({
    userId,
    voice,
    updatedAt: new Date()
  });
}

export async function clearGuestData(): Promise<void> {
  await Promise.all([
    db.guestUsers.clear(),
    db.preferences.clear()
  ]);
}

export async function hasActiveGuest(): Promise<boolean> {
  const guestUser = await db.guestUsers.toCollection().first();
  return !!guestUser;
}