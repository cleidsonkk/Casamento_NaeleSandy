import { asc, desc, eq } from "drizzle-orm";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import {
  Event,
  Gift,
  GiftSelection,
  Guest,
  InsertGift,
  InsertGuest,
  InsertPayment,
  InsertUser,
  Payment,
  events,
  giftSelections,
  gifts,
  guests,
  payments,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";
import { DEFAULT_GIFTS } from "./defaultGifts";

type Db = ReturnType<typeof drizzle>;

let _db: Db | null = null;

function withUpdatedAt<T extends object>(data: T): T & { updatedAt: Date } {
  return { ...data, updatedAt: new Date() };
}

export async function getDb() {
  if (!_db && ENV.databaseUrl) {
    try {
      const client = neon(ENV.databaseUrl);
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    updateSet.updatedAt = new Date();

    await db
      .insert(users)
      .values(values)
      .onConflictDoUpdate({ target: users.openId, set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getEventById(eventId: number): Promise<Event | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getFirstEvent(): Promise<Event | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(events).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createEvent(
  data: Omit<Event, "id" | "createdAt" | "updatedAt">,
): Promise<Event | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const inserted = await db.insert(events).values(data as any).returning();
  return inserted[0];
}

export async function updateEvent(eventId: number, data: Partial<Event>) {
  const db = await getDb();
  if (!db) return undefined;
  const updated = await db
    .update(events)
    .set(withUpdatedAt(data))
    .where(eq(events.id, eventId))
    .returning();
  return updated[0];
}

export async function getGuestsByEvent(eventId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(guests).where(eq(guests.eventId, eventId)).orderBy(desc(guests.confirmedAt));
}

export async function getGuestById(guestId: number): Promise<Guest | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(guests).where(eq(guests.id, guestId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createGuest(data: InsertGuest): Promise<Guest | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const inserted = await db.insert(guests).values(data).returning();
  return inserted[0];
}

export async function updateGuest(guestId: number, data: Partial<Guest>) {
  const db = await getDb();
  if (!db) return undefined;
  const updated = await db
    .update(guests)
    .set(withUpdatedAt(data))
    .where(eq(guests.id, guestId))
    .returning();
  return updated[0];
}

export async function deleteGuest(guestId: number) {
  const db = await getDb();
  if (!db) return false;
  await db.delete(guests).where(eq(guests.id, guestId));
  return true;
}

export async function getGiftsByEvent(eventId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(gifts).where(eq(gifts.eventId, eventId)).orderBy(asc(gifts.name));
}

export async function ensureDefaultGiftsForEvent(eventId: number) {
  const db = await getDb();
  if (!db) return [];

  const existing = await db.select({ id: gifts.id }).from(gifts).where(eq(gifts.eventId, eventId)).limit(1);
  if (existing.length > 0) return getGiftsByEvent(eventId);

  for (const gift of DEFAULT_GIFTS) {
    await db.insert(gifts).values({
      eventId,
      name: gift.name,
      description: gift.description ?? null,
      imageUrl: gift.imageUrl ?? null,
      suggestedValue: gift.suggestedValue,
      status: "available",
    });
  }

  return getGiftsByEvent(eventId);
}

export async function getGiftById(giftId: number): Promise<Gift | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(gifts).where(eq(gifts.id, giftId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createGift(data: InsertGift): Promise<Gift | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const inserted = await db.insert(gifts).values(data).returning();
  return inserted[0];
}

export async function updateGift(giftId: number, data: Partial<Gift>) {
  const db = await getDb();
  if (!db) return undefined;
  const updated = await db
    .update(gifts)
    .set(withUpdatedAt(data))
    .where(eq(gifts.id, giftId))
    .returning();
  return updated[0];
}

export async function deleteGift(giftId: number) {
  const db = await getDb();
  if (!db) return false;
  await db.delete(gifts).where(eq(gifts.id, giftId));
  return true;
}

export async function getGiftSelectionsByGuest(guestId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(giftSelections).where(eq(giftSelections.guestId, guestId));
}

export async function getGiftSelectionsByGift(giftId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(giftSelections).where(eq(giftSelections.giftId, giftId));
}

export async function getGiftSelectionsByEvent(eventId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(giftSelections)
    .where(eq(giftSelections.eventId, eventId))
    .orderBy(desc(giftSelections.selectedAt));
}

export async function createGiftSelection(
  data: Omit<GiftSelection, "id" | "createdAt" | "updatedAt"> & { reservedUntil?: Date | null },
): Promise<GiftSelection | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const inserted = await db.insert(giftSelections).values(data as any).returning();
  return inserted[0];
}

export async function deleteGiftSelection(selectionId: number) {
  const db = await getDb();
  if (!db) return false;
  await db.delete(giftSelections).where(eq(giftSelections.id, selectionId));
  return true;
}

export async function getPaymentsByEvent(eventId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(payments).where(eq(payments.eventId, eventId)).orderBy(desc(payments.createdAt));
}

export async function getPaymentById(paymentId: number): Promise<Payment | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(payments).where(eq(payments.id, paymentId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPaymentByGiftSelection(giftSelectionId: number): Promise<Payment | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(payments)
    .where(eq(payments.giftSelectionId, giftSelectionId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createPayment(data: InsertPayment): Promise<Payment | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const inserted = await db.insert(payments).values(data).returning();
  return inserted[0];
}

export async function updatePayment(paymentId: number, data: Partial<Payment>) {
  const db = await getDb();
  if (!db) return undefined;
  const updated = await db
    .update(payments)
    .set(withUpdatedAt(data))
    .where(eq(payments.id, paymentId))
    .returning();
  return updated[0];
}
