import { COOKIE_NAME } from "../shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import { notifyOwner } from "./_core/notification";
import { DEFAULT_GIFTS } from "./defaultGifts";

const buildFallbackEvent = () => {
  const now = new Date();
  const eventDate = new Date();
  eventDate.setDate(eventDate.getDate() + 30);

  return {
    id: 0,
    title: "Amonael & Sandriellyy",
    description: "Nosso grande dia",
    eventDate,
    eventTime: "18:00",
    location: "Local a confirmar",
    pixKey: "",
    pixKeyType: "celular" as const,
    receiverName: "",
    whatsappContact: "",
    whatsappMessage: "",
    giftReservationLimit: "unlimited" as const,
    giftReservationTimeout: 120,
    createdAt: now,
    updatedAt: now,
  };
};

const buildFallbackGifts = () =>
  DEFAULT_GIFTS.map((gift, index) => ({
    id: index + 1,
    eventId: 0,
    name: gift.name,
    description: gift.description ?? null,
    imageUrl: gift.imageUrl ?? null,
    suggestedValue: gift.suggestedValue,
    status: "available" as const,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  event: router({
    get: publicProcedure.query(async () => {
      try {
        let event = await db.getFirstEvent();
        if (!event) {
          const futureDate = new Date();
          futureDate.setDate(futureDate.getDate() + 30);
          event = await db.createEvent({
            title: 'Nosso Grande Dia',
            description: 'Um evento especial para celebrar',
            eventDate: futureDate,
            eventTime: '18:00',
            location: 'Local a definir',
            pixKey: '',
            pixKeyType: 'celular',
            receiverName: '',
            whatsappContact: '',
            whatsappMessage: '',
            giftReservationLimit: 'unlimited',
            giftReservationTimeout: 120,
          });
        }
        return event ?? buildFallbackEvent();
      } catch (error) {
        console.error("[event.get] Fallback due to database error:", error);
        return buildFallbackEvent();
      }
    }),
    
    update: adminProcedure
      .input(z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        eventDate: z.date().optional(),
        eventTime: z.string().optional(),
        location: z.string().optional(),
        pixKey: z.string().optional(),
        pixKeyType: z.enum(["celular", "aleatoria", "email", "cpf"]).optional(),
        receiverName: z.string().optional(),
        whatsappContact: z.string().optional(),
        whatsappMessage: z.string().optional(),
        giftReservationLimit: z.enum(["one_per_guest", "one_per_gift", "unlimited"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const event = await db.getFirstEvent();
        if (!event) throw new TRPCError({ code: 'NOT_FOUND' });
        return db.updateEvent(event.id, input);
      }),
  }),

  guest: router({
    list: adminProcedure.query(async () => {
      const event = await db.getFirstEvent();
      if (!event) return [];
      return db.getGuestsByEvent(event.id);
    }),

    create: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        whatsapp: z.string().min(1),
        companions: z.number().int().min(0).default(0),
        message: z.string().optional(),
        dietaryRestrictions: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const event = await db.getFirstEvent();
        if (!event) throw new TRPCError({ code: 'NOT_FOUND' });
        
        const guest = await db.createGuest({
          eventId: event.id,
          name: input.name,
          whatsapp: input.whatsapp,
          companions: input.companions,
          message: input.message,
          dietaryRestrictions: input.dietaryRestrictions,
          rsvpStatus: 'confirmed',
          confirmedAt: new Date(),
        });

        if (guest) {
          await notifyOwner({
            title: '🎉 Novo RSVP Confirmado',
            content: `${guest.name} confirmou presença com ${guest.companions} acompanhante(s)`,
          });
        }

        return guest;
      }),

    update: adminProcedure
      .input(z.object({
        guestId: z.number(),
        name: z.string().optional(),
        whatsapp: z.string().optional(),
        companions: z.number().int().optional(),
        message: z.string().optional(),
        dietaryRestrictions: z.string().optional(),
        rsvpStatus: z.enum(['confirmed', 'declined', 'pending']).optional(),
      }))
      .mutation(async ({ input }) => {
        const { guestId, ...data } = input;
        return db.updateGuest(guestId, data);
      }),

    delete: adminProcedure
      .input(z.object({ guestId: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteGuest(input.guestId);
      }),

    getById: publicProcedure
      .input(z.object({ guestId: z.number() }))
      .query(async ({ input }) => {
        return db.getGuestById(input.guestId);
      }),

    getByWhatsapp: publicProcedure
      .input(z.object({ whatsapp: z.string() }))
      .query(async ({ input }) => {
        const event = await db.getFirstEvent();
        if (!event) return null;
        const guests = await db.getGuestsByEvent(event.id);
        return guests.find(g => g.whatsapp === input.whatsapp) || null;
      })
  }),

  gift: router({
    list: publicProcedure.query(async () => {
      try {
        const event = await db.getFirstEvent();
        if (!event) return buildFallbackGifts();
        return db.ensureDefaultGiftsForEvent(event.id);
      } catch (error) {
        console.error("[gift.list] Fallback due to database error:", error);
        return buildFallbackGifts();
      }
    }),

    create: adminProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
        suggestedValue: z.string().transform(v => parseFloat(v)),
      }))
      .mutation(async ({ input }) => {
        const event = await db.getFirstEvent();
        if (!event) throw new TRPCError({ code: 'NOT_FOUND' });
        
        return db.createGift({
          eventId: event.id,
          name: input.name,
          description: input.description,
          imageUrl: input.imageUrl,
          suggestedValue: input.suggestedValue.toString(),
          status: 'available',
        });
      }),

    update: adminProcedure
      .input(z.object({
        giftId: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
        suggestedValue: z.number().optional(),
        status: z.enum(['available', 'reserved', 'completed']).optional(),
      }))
      .mutation(async ({ input }) => {
        const { giftId, suggestedValue, ...data } = input;
        const updateData: any = data;
        if (suggestedValue !== undefined) {
          updateData.suggestedValue = suggestedValue.toString();
        }
        return db.updateGift(giftId, updateData);
      }),

    delete: adminProcedure
      .input(z.object({ giftId: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteGift(input.giftId);
      }),
  }),

  giftSelection: router({
    create: publicProcedure
      .input(z.object({
        giftId: z.number(),
        guestId: z.number(),
      }))
      .mutation(async ({ input }) => {
        const event = await db.getFirstEvent();
        if (!event) throw new TRPCError({ code: 'NOT_FOUND' });

        const gift = await db.getGiftById(input.giftId);
        if (!gift) throw new TRPCError({ code: 'NOT_FOUND' });

        if (gift.status !== 'available') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Gift not available' });
        }

        const selection = await db.createGiftSelection({
          giftId: input.giftId,
          guestId: input.guestId,
          eventId: event.id,
          selectedAt: new Date(),
          reservedUntil: null,
        });

        if (selection) {
          await db.updateGift(input.giftId, { status: 'reserved' });

          const guest = await db.getGuestById(input.guestId);
          await notifyOwner({
            title: '🎁 Presente Reservado',
            content: `${guest?.name} reservou: ${gift.name}`,
          });
        }

        return selection;
      }),

    getByGuest: publicProcedure
      .input(z.object({ guestId: z.number() }))
      .query(async ({ input }) => {
        return db.getGiftSelectionsByGuest(input.guestId);
      }),

    delete: adminProcedure
      .input(z.object({ selectionId: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteGiftSelection(input.selectionId);
      }),
  }),

  payment: router({
    create: publicProcedure
      .input(z.object({
        guestId: z.number(),
        giftSelectionId: z.number(),
        amount: z.string().transform(v => parseFloat(v)),
      }))
      .mutation(async ({ input }) => {
        const event = await db.getFirstEvent();
        if (!event) throw new TRPCError({ code: 'NOT_FOUND' });

        return db.createPayment({
          eventId: event.id,
          guestId: input.guestId,
          giftSelectionId: input.giftSelectionId,
          amount: input.amount.toString(),
          status: 'awaiting_payment',
          pixKey: event.pixKey,
        });
      }),

    list: adminProcedure.query(async () => {
      const event = await db.getFirstEvent();
      if (!event) return [];
      return db.getPaymentsByEvent(event.id);
    }),

    confirm: adminProcedure
      .input(z.object({
        paymentId: z.number(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const payment = await db.updatePayment(input.paymentId, {
          status: 'confirmed',
          confirmedAt: new Date(),
          internalNotes: input.notes,
        });

        if (payment) {
          const guest = await db.getGuestById(payment.guestId);
          const amount = parseFloat(payment.amount.toString()).toFixed(2);
          await notifyOwner({
            title: '✅ Pagamento Confirmado',
            content: `Pagamento de ${guest?.name} foi confirmado: R$ ${amount}`,
          });
        }

        return payment;
      }),

    markAsInformed: publicProcedure
      .input(z.object({ paymentId: z.number() }))
      .mutation(async ({ input }) => {
        return db.updatePayment(input.paymentId, {
          status: 'payment_informed',
          paymentInformedAt: new Date(),
        });
      }),
  }),

  dashboard: router({
    stats: adminProcedure.query(async () => {
      const event = await db.getFirstEvent();
      if (!event) throw new TRPCError({ code: 'NOT_FOUND' });

      const guests = await db.getGuestsByEvent(event.id);
      const confirmedGuests = guests.filter(g => g.rsvpStatus === 'confirmed');
      const totalCompanions = confirmedGuests.reduce((sum, g) => sum + g.companions, 0);

      const gifts = await db.getGiftsByEvent(event.id);
      const selectedGifts = gifts.filter(g => g.status === 'reserved').length;

      const payments = await db.getPaymentsByEvent(event.id);
      const confirmedPayments = payments.filter(p => p.status === 'confirmed');
      const totalAmount = confirmedPayments.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);

      return {
        confirmedCount: confirmedGuests.length,
        totalGuests: guests.length,
        totalCompanions,
        selectedGifts,
        totalGifts: gifts.length,
        totalAmount,
        confirmedPayments: confirmedPayments.length,
        informedPayments: payments.filter(p => p.status === 'payment_informed').length,
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
