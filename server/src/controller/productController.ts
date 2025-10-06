// src/controllers/productController.ts
import { PrismaClient } from "@prisma/client";
import type { Context } from "hono";

const prisma = new PrismaClient();

// =======================
// Tambah produk baru (khusus instructor)
// =======================
export const createProduct = async (c: Context): Promise<Response> => {
  try {
    const user = c.get("user");
    if (!user || user.role !== "instructor") {
      return c.json({ success: false, message: "Unauthorized. Only instructors can create products." }, 401);
    }

    const body = await c.req.json();
    const { title, overview, cover, product_type, price } = body;

    if (!title || !product_type || price === undefined) {
      return c.json(
        { success: false, message: "Field title, product_type, dan price wajib diisi." },
        400
      );
    }

    const newProduct = await prisma.product.create({
      data: {
        title,
        overview,
        cover,
        product_type,
        price: parseFloat(price),
      },
      select: {
        id: true,
        title: true,
        overview: true,
        cover: true,
        product_type: true,
        price: true,
      },
    });

    return c.json({ success: true, data: newProduct }, 201);
  } catch (error: any) {
    console.error("❌ Error createProduct:", error);
    return c.json(
      { success: false, message: "Gagal membuat produk", error: error.message },
      500
    );
  }
};

// =======================
// Ambil semua produk (bisa student & instructor)
// =======================
export const getAllProducts = async (c: Context): Promise<Response> => {
  try {
    const user = c.get("user");
    if (!user || user.role !== "instructor") {
      return c.json({ success: false, message: "Unauthorized. Only Instructor can access products." }, 401);
    }

    const products = await prisma.product.findMany({
      select: {
        id: true,
        title: true,
        overview: true,
        cover: true,
        product_type: true,
        price: true,
      },
    });

    return c.json({ success: true, data: products }, 200);
  } catch (error: any) {
    console.error("❌ Error getAllProducts:", error);
    return c.json(
      { success: false, message: "Gagal mengambil data produk", error: error.message },
      500
    );
  }
};

// =======================
// Ambil produk berdasarkan ID (bisa student & instructor)
// =======================
export const getProductById = async (c: Context): Promise<Response> => {
  try {
    const user = c.get("user");
    if (!user || user.role !== "instructor") {
      return c.json({ success: false, message: "Unauthorized. Only Instructor can access products." }, 401);
    }

    const id = c.req.param("id");

    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        overview: true,
        cover: true,
        product_type: true,
        price: true,
      },
    });

    if (!product) {
      return c.json({ success: false, message: "Produk tidak ditemukan" }, 404);
    }

    return c.json({ success: true, data: product }, 200);
  } catch (error: any) {
    console.error("❌ Error getProductById:", error);
    return c.json(
      { success: false, message: "Gagal mengambil detail produk", error: error.message },
      500
    );
  }
};

// =======================
// Ambil semua product_type unik (bisa student & instructor)
// =======================
export const getProductTypes = async (c: Context): Promise<Response> => {
  try {
    const user = c.get("user");
    if (!user || user.role !== "instructor") {
      return c.json({ success: false, message: "Unauthorized. Only Instructor can access product types." }, 401);
    }

    const types = await prisma.product.findMany({
      distinct: ["product_type"],
      select: { product_type: true },
    });

    const uniqueTypes = types.map((t) => t.product_type);

    return c.json({ success: true, data: uniqueTypes }, 200);
  } catch (error: any) {
    console.error("❌ Error getProductTypes:", error);
    return c.json(
      { success: false, message: "Gagal mengambil product types", error: error.message },
      500
    );
  }
};
