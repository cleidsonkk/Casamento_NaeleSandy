import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { User } from "../../drizzle/schema";
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
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
