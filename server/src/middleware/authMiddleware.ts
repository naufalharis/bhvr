import type { Context as HonoContext } from "hono";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
  export const authMiddleware = async (c: HonoContext, next: () => Promise<void>) => {
    const authHeader = c.req.header("Authorization");
  if (!authHeader) return c.json({ error: "Unauthorized" }, 401);

  const parts = authHeader.split(" ");
  if (parts.length !== 2) return c.json({ error: "Malformed token" }, 401);

  const token = parts[1]; // Sekarang pasti string
  if (!token) return c.json({ error: "Token missing" }, 401);

  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    c.set("user", payload);
    await next();
  } catch {
    return c.json({ error: "Invalid token" }, 401);
}
};