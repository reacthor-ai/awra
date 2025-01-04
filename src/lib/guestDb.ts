import Dexie, { type Table } from 'dexie';

export interface GuestUser {
  id: string;
  name: string;
  createdAt: Date;
  lastLoginAt: Date;
}

export class GuestDB extends Dexie {
  guestUsers!: Table<GuestUser>;

  constructor() {
    super('guestDB');
    this.version(1).stores({
      guestUsers: 'id, name, createdAt, lastLoginAt'
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

export async function clearGuestUser(): Promise<void> {
  await db.guestUsers.clear();
}