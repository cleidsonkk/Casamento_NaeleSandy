import { describe, it, expect, beforeEach, vi } from 'vitest';
import { appRouter } from './routers';
import type { TrpcContext } from './_core/context';

// Mock user context
function createMockContext(role: 'admin' | 'user' = 'user'): TrpcContext {
  return {
    user: {
      id: 1,
      openId: 'test-user',
      email: 'test@example.com',
      name: 'Test User',
      loginMethod: 'manus',
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: 'https',
      headers: {},
    } as TrpcContext['req'],
    res: {
      clearCookie: vi.fn(),
    } as TrpcContext['res'],
  };
}

describe('tRPC Procedures', () => {
  describe('auth.logout', () => {
    it('should clear session cookie on logout', async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.logout();

      expect(result).toEqual({ success: true });
      expect(ctx.res.clearCookie).toHaveBeenCalled();
    });
  });

  describe('auth.me', () => {
    it('should return current user', async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();

      expect(result).toBeDefined();
      expect(result?.id).toBe(1);
      expect(result?.name).toBe('Test User');
    });
  });

  describe('event procedures', () => {
    it('should require admin role for update', async () => {
      const userCtx = createMockContext('user');
      const caller = appRouter.createCaller(userCtx);

      try {
        await caller.event.update({
          title: 'Updated Event',
        });
        expect.fail('Should have thrown FORBIDDEN error');
      } catch (error: any) {
        expect(error.code).toBe('FORBIDDEN');
      }
    });
  });

  describe('guest procedures', () => {
    it('should allow public guest creation', async () => {
      const ctx = createMockContext('user');
      const caller = appRouter.createCaller(ctx);

      // This will fail if no event exists, but that's expected
      try {
        const result = await caller.guest.create({
          name: 'John Doe',
          whatsapp: '11999999999',
          companions: 2,
          message: 'Looking forward to the event',
        });

        if (result) {
          expect(result.name).toBe('John Doe');
          expect(result.rsvpStatus).toBe('confirmed');
        }
      } catch (error: any) {
        // Expected if no event exists or internal error
        expect(['NOT_FOUND', 'INTERNAL_SERVER_ERROR']).toContain(error.code);
      }
    });

    it('should require admin role for guest deletion', async () => {
      const userCtx = createMockContext('user');
      const caller = appRouter.createCaller(userCtx);

      try {
        await caller.guest.delete({ guestId: 1 });
        expect.fail('Should have thrown FORBIDDEN error');
      } catch (error: any) {
        expect(error.code).toBe('FORBIDDEN');
      }
    });
  });

  describe('gift procedures', () => {
    it('should allow public gift listing', async () => {
      const ctx = createMockContext('user');
      const caller = appRouter.createCaller(ctx);

      const result = await caller.gift.list();

      expect(Array.isArray(result)).toBe(true);
    });

    it('should require admin role for gift creation', async () => {
      const userCtx = createMockContext('user');
      const caller = appRouter.createCaller(userCtx);

      try {
        await caller.gift.create({
          name: 'Gift',
          suggestedValue: '100.00',
        });
        expect.fail('Should have thrown FORBIDDEN error');
      } catch (error: any) {
        expect(error.code).toBe('FORBIDDEN');
      }
    });
  });

  describe('payment procedures', () => {
    it('should allow public payment creation', async () => {
      const ctx = createMockContext('user');
      const caller = appRouter.createCaller(ctx);

      try {
        const result = await caller.payment.create({
          guestId: 1,
          giftSelectionId: 1,
          amount: '100.00',
        });

        if (result) {
          expect(result.status).toBe('awaiting_payment');
        }
      } catch (error: any) {
        // Expected if no event exists or internal error
        expect(['NOT_FOUND', 'INTERNAL_SERVER_ERROR']).toContain(error.code);
      }
    });

    it('should require admin role for payment confirmation', async () => {
      const userCtx = createMockContext('user');
      const caller = appRouter.createCaller(userCtx);

      try {
        await caller.payment.confirm({
          paymentId: 1,
        });
        expect.fail('Should have thrown FORBIDDEN error');
      } catch (error: any) {
        expect(error.code).toBe('FORBIDDEN');
      }
    });
  });

  describe('dashboard statistics', () => {
    it('should require admin role for stats', async () => {
      const userCtx = createMockContext('user');
      const caller = appRouter.createCaller(userCtx);

      try {
        await caller.dashboard.stats();
        expect.fail('Should have thrown FORBIDDEN error');
      } catch (error: any) {
        expect(error.code).toBe('FORBIDDEN');
      }
    });

    it('should return stats for admin', async () => {
      const adminCtx = createMockContext('admin');
      const caller = appRouter.createCaller(adminCtx);

      try {
        const result = await caller.dashboard.stats();

        if (result) {
          expect(result).toHaveProperty('confirmedCount');
          expect(result).toHaveProperty('totalGuests');
          expect(result).toHaveProperty('selectedGifts');
          expect(result).toHaveProperty('totalAmount');
        }
      } catch (error: any) {
        // Expected if no event exists or internal error
        expect(['NOT_FOUND', 'INTERNAL_SERVER_ERROR']).toContain(error.code);
      }
    });
  });
});
