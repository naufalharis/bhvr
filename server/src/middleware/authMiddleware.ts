// src/middleware/authMiddleware.ts
import type { Context as HonoContext, Next } from "hono";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Pastikan selalu string, default jika env belum di-set
const JWT_SECRET: string = process.env.JWT_SECRET ?? "your-secret-key";

export const authMiddleware = async (c: HonoContext, next: Next) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader) return c.json({ error: "Unauthorized" }, 401);

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return c.json({ error: "Malformed token" }, 401);
    }

    const token = parts[1];
    if (!token) return c.json({ error: "Token missing" }, 401);

    // Verifikasi JWT
    const payload = jwt.verify(token, JWT_SECRET) as { id: number; role: string };

    // Ambil user dari DB
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    // Simpan seluruh record user ke context
    c.set("user", user);

    // Lanjut ke handler berikutnya
    await next();
  } catch (err: any) {
    console.error("Auth middleware error:", err.message ?? err);
    return c.json({ error: "Invalid token" }, 401);
  }
};