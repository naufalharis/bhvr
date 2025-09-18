import { PrismaClient } from "@prisma/client";
import type { Context } from "hono";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

// Register sebagai affiliator
export const registerAffiliate = async (c: Context) => {
  const user = c.get("user"); // dari authMiddleware

  // cek sudah affiliator belum
  const affiliate = await prisma.affiliate.findFirst({
    where: { user_id: user.id },
  });
  if (affiliate) return c.json({ error: "Already an affiliate" }, 400);

  const newAffiliate = await prisma.affiliate.create({
    data: {
      user_id: user.id,
      unique_code: uuidv4().slice(0, 8), // kode unik 8 karakter
      status: "active",
    },
  });

  return c.json(newAffiliate);
};

// Ambil semua courses yg bisa dipromosikan
export const listCourses = async (c: Context) => {
  const courses = await prisma.course.findMany({
    select: { id: true, title: true, slug: true },
  });
  return c.json(courses);
};

// Tambah course ke affiliate
export const addAffiliateCourse = async (c: Context) => {
  const affiliateId = c.req.param("affiliateId");
  const { course_id } = await c.req.json();

  const link = await prisma.affiliatesCourses.create({
    data: {
      affiliate_id: affiliateId,
      course_id,
    },
  });

  return c.json(link);
};

// Ambil semua course yg di affiliate
export const listAffiliateCourses = async (c: Context) => {
  const affiliateId = c.req.param("affiliateId");
  const links = await prisma.affiliatesCourses.findMany({
    where: { affiliate_id: affiliateId },
  });
  return c.json(links);
};