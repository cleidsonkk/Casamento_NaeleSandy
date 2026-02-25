import type { IncomingHttpHeaders } from "node:http";
import type { User } from "../../drizzle/schema";
import { ENV } from "./env";

function readBearerToken(authorization: string | undefined): string | null {
  if (!authorization) return null;
  const [scheme, token] = authorization.split(" ");
  if (scheme?.toLowerCase() !== "bearer") return null;
  return token?.trim() || null;
}

export function getAdminAccessToken(headers: IncomingHttpHeaders): string | null {
  const directHeader = headers["x-admin-key"];
  if (typeof directHeader === "string" && directHeader.trim().length > 0) {
    return directHeader.trim();
  }

  const authHeader = typeof headers.authorization === "string" ? headers.authorization : undefined;
  return readBearerToken(authHeader);
}

export function resolveAdminUser(token: string | null): User | null {
  if (!ENV.adminAccessKey || !token || token !== ENV.adminAccessKey) return null;

  const now = new Date();
  return {
    id: 0,
    openId: "admin-local-access",
    name: "Admin",
    email: null,
    loginMethod: "admin_key",
    role: "admin",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
  };
}
