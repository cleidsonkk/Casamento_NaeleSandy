import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { User } from "../../drizzle/schema";
import { getAdminAccessToken, resolveAdminUser } from "./adminAccess";
import { sdk } from "./sdk";

type TrpcRequest = CreateExpressContextOptions["req"] | IncomingMessage;
type TrpcResponse = CreateExpressContextOptions["res"] | ServerResponse;

export type TrpcContext = {
  req: TrpcRequest;
  res: TrpcResponse;
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  const adminToken = getAdminAccessToken(opts.req.headers);
  let user: User | null = resolveAdminUser(adminToken);

  if (!user) {
    try {
      user = await sdk.authenticateRequest(opts.req);
    } catch (error) {
      // Authentication is optional for public procedures.
      user = null;
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
