import { PrismaClient } from "@prisma/client";
import type { Context } from "hono";

const prisma = new PrismaClient();

// POST /api/content/completion
export const saveProgress = async (c: Context) => {
  try {
    const { userId, contentId, completed } = await c.req.json();

    if (!userId || !contentId) {
      return c.json({ error: "userId dan contentId wajib diisi" }, 400);
    }

    // Cek apakah progres sudah ada
    const existing = await prisma.contentProgress.findFirst({
      where: { user_id: userId, content_id: contentId },
    });

    if (existing) {
      const updated = await prisma.contentProgress.update({
        where: { id: existing.id },
        data: { completed },
      });
      return c.json({ message: "Progres diperbarui", data: updated });
    } else {
      const created = await prisma.contentProgress.create({
        data: { user_id: userId, content_id: contentId, completed },
      });
      return c.json({ message: "Progres disimpan", data: created });
    }
  } catch (err) {
    console.error(err);
    return c.json({ error: "Terjadi kesalahan server" }, 500);
  }
};

// GET /api/content/completion/:userId
export const getProgressByUser = async (c: Context) => {
  const userId = c.req.param("userId");
  try {
    const progressList = await prisma.contentProgress.findMany({
      where: { user_id: userId },
    });
    return c.json({ data: progressList });
  } catch (err) {
    console.error(err);
    return c.json({ error: "Gagal mengambil progres" }, 500);
  }
};
