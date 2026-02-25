import {
  boolean,
  integer,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("role", ["user", "admin"]);
export const pixKeyTypeEnum = pgEnum("pixKeyType", ["celular", "aleatoria", "email", "cpf"]);
export const giftReservationLimitEnum = pgEnum("giftReservationLimit", [
  "one_per_guest",
  "one_per_gift",
  "unlimited",
]);
export const rsvpStatusEnum = pgEnum("rsvpStatus", ["confirmed", "declined", "pending"]);
export const giftStatusEnum = pgEnum("status", ["available", "reserved", "completed", "disabled"]);
export const paymentStatusEnum = pgEnum("paymentStatus", [
  "awaiting_payment",
  "payment_informed",
  "confirmed",
  "cancelled",
]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: userRoleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  eventDate: timestamp("eventDate").notNull(),
  eventTime: varchar("eventTime", { length: 10 }),
  location: text("location"),
  pixKey: varchar("pixKey", { length: 255 }).notNull(),
  pixKeyType: pixKeyTypeEnum("pixKeyType").default("celular").notNull(),
  receiverName: varchar("receiverName", { length: 255 }).notNull(),
  whatsappContact: varchar("whatsappContact", { length: 20 }),
  whatsappMessage: text("whatsappMessage"),
  giftReservationLimit: giftReservationLimitEnum("giftReservationLimit")
    .default("one_per_guest")
    .notNull(),
  giftReservationTimeout: integer("giftReservationTimeout").default(120),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

export const guests = pgTable("guests", {
  id: serial("id").primaryKey(),
  eventId: integer("eventId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 20 }).notNull(),
  companions: integer("companions").default(0).notNull(),
  message: text("message"),
  dietaryRestrictions: text("dietaryRestrictions"),
  rsvpStatus: rsvpStatusEnum("rsvpStatus").default("pending").notNull(),
  confirmedAt: timestamp("confirmedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Guest = typeof guests.$inferSelect;
export type InsertGuest = typeof guests.$inferInsert;

export const gifts = pgTable("gifts", {
  id: serial("id").primaryKey(),
  eventId: integer("eventId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: varchar("imageUrl", { length: 500 }),
  suggestedValue: numeric("suggestedValue", { precision: 10, scale: 2 }).notNull(),
  status: giftStatusEnum("status").default("available").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Gift = typeof gifts.$inferSelect;
export type InsertGift = typeof gifts.$inferInsert;

export const giftSelections = pgTable("giftSelections", {
  id: serial("id").primaryKey(),
  giftId: integer("giftId").notNull(),
  guestId: integer("guestId").notNull(),
  eventId: integer("eventId").notNull(),
  selectedAt: timestamp("selectedAt").defaultNow().notNull(),
  reservedUntil: timestamp("reservedUntil"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type GiftSelection = typeof giftSelections.$inferSelect;
export type InsertGiftSelection = typeof giftSelections.$inferInsert;

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  eventId: integer("eventId").notNull(),
  guestId: integer("guestId").notNull(),
  giftSelectionId: integer("giftSelectionId"),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  status: paymentStatusEnum("status").default("awaiting_payment").notNull(),
  pixKey: varchar("pixKey", { length: 255 }),
  qrCode: text("qrCode"),
  internalNotes: text("internalNotes"),
  confirmedAt: timestamp("confirmedAt"),
  confirmedBy: integer("confirmedBy"),
  paymentInformedAt: timestamp("paymentInformedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;
