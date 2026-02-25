import { createHTTPHandler } from "@trpc/server/adapters/standalone";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAdminAccessToken, resolveAdminUser } from "../server/_core/adminAccess";
import { appRouter } from "../server/routers";

const createPublicContext = async (opts: { req: IncomingMessage; res: ServerResponse }) => ({
  req: opts.req,
  res: opts.res,
  user: resolveAdminUser(getAdminAccessToken(opts.req.headers)),
});

const trpcHandler = createHTTPHandler({
  router: appRouter,
  createContext: createPublicContext,
});

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.url?.startsWith("/api/health") || req.url?.startsWith("/health")) {
      return res.status(200).json({ ok: true });
    }
    return trpcHandler(req, res);
  } catch (error) {
    console.error("[api] handler crash:", error);
    res.status(500).json({ error: "Function invocation failed" });
  }
}
