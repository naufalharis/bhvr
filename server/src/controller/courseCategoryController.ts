import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const CoursesCategory = new Hono();

// Tambah relasi course ↔ category
CoursesCategory.post("/", async (c) => {
  try {
    const { courseId, categoryId } = await c.req.json();

    const newRelasi = await prisma.coursesCategories.create({
      data: {
        course_id: courseId,
        category_id: categoryId,
      },
    });

    return c.json(
      { message: "Relasi course ↔ category berhasil ditambahkan", data: newRelasi },
      201
    );
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Ambil semua relasi
CoursesCategory.get("/", async (c) => {
  try {
    const data = await prisma.coursesCategories.findMany({
      include: {
        course: true,
        category: true,
      },
    });

    return c.json(data);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Ambil kategori berdasarkan courseId
CoursesCategory.get("/:courseId", async (c) => {
  try {
    const courseId = c.req.param("courseId");

    const data = await prisma.coursesCategories.findMany({
      where: { course_id: courseId },
      include: { category: true },
    });

    return c.json(data);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

export default CoursesCategory;
