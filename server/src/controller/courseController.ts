// src/controllers/courseController.ts
import { PrismaClient } from "@prisma/client";
import type { Context as HonoContext } from "hono";

const prisma = new PrismaClient();

export const createCourse = async (c: HonoContext) => {
  try {
    // Ambil user dari context (harus dari middleware auth)
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Cek role
    if (user.role !== "instructor") {
      return c.json({ error: "Forbidden. Only instructors can add courses." }, 403);
    }

    // Cek apakah ada record di tabel Instructor
    const instructor = await prisma.instructor.findFirst({
      where: { user_id: user.id },
    });

    if (!instructor) {
      return c.json({ error: "Instructor record not found" }, 400);
    }

    // Ambil data dari request
    const { title, overview, cover, course_type, slug } = await c.req.json();

    // Buat course baru
    const newCourse = await prisma.course.create({
      data: {
        title,
        overview,
        cover,
        course_type,
        slug,
        instructor_id: instructor.id, // Pakai id dari tabel Instructor
      },
    });

    return c.json({ message: "Course created successfully", course: newCourse }, 201);

  } catch (error: any) {
    console.error(error);
    return c.json({ error: error.message }, 500);
  }
};
