// src/controllers/productDetailController.ts
import { PrismaClient } from "@prisma/client";
import type { Context } from "hono";

const prisma = new PrismaClient();

// =======================
// Create Product Detail
// =======================
export const createProductDetail = async (c: Context) => {
  try {
    const user = c.get("user") as { id: string; role: string };
    if (!user) return c.json({ error: "Unauthorized" }, 401);
    if (user.role !== "instructor") {
      return c.json(
        { error: "Forbidden. Only instructors can add product details." },
        403
      );
    }

    const { courseId, productId, price } = await c.req.json();
    if (!courseId || !price) {
      return c.json({ error: "courseId dan price wajib diisi" }, 400);
    }

    // cek apakah course dimiliki oleh instructor (user ini)
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        instructor: {
          user_id: user.id, // instructor punya relasi ke user
        },
      },
      include: { instructor: true },
    });

    if (!course) {
      return c.json(
        { error: "Kamu tidak berhak menambahkan product detail di course ini" },
        403
      );
    }

    const newDetail = await prisma.productDetail.create({
      data: {
        course_id: courseId,
        product_id: productId ?? null,
        price: parseFloat(price),
      },
      include: { course: true, product: true },
    });

    return c.json(
      { message: "Product detail created successfully", data: newDetail },
      201
    );
  } catch (err: any) {
    console.error("createProductDetail error:", err);
    return c.json({ error: err.message }, 500);
  }
};

// =======================
// Get Product Details (all or by courseId)
// =======================
export const getProductDetails = async (c: Context) => {
  try {
    const courseId = c.req.query("courseId");

    const details = await prisma.productDetail.findMany({
      where: courseId ? { course_id: courseId } : {},
      include: { course: true, product: true },
    });

    return c.json(details);
  } catch (err: any) {
    console.error("getProductDetails error:", err);
    return c.json({ error: err.message }, 500);
  }
};

