import { PrismaClient, CourseType, ContentType } from "@prisma/client";
import { Context } from "hono";
import { prisma } from "../lib/prisma";

// ✅ Controller: Get all chapters (with contents) by courseId
export const getChaptersByCourse = async (c: Context) => {
  try {
    const courseId = c.req.param("courseId");

    if (!courseId) {
      return c.json({ error: "Course ID is required" }, 400);
    }

    // Ambil semua chapter berdasarkan courseId
    const chapters = await prisma.courseChapter.findMany({
      where: { course_id: courseId },
      orderBy: { sort_order: "asc" },
      include: {
        contents: {
          orderBy: { sort_order: "asc" },
          select: {
            id: true,
            title: true,
            overview: true,
            content_type: true,
            path: true,
            sort_order: true,
          },
        },
      },
    });

    return c.json(chapters, 200);
  } catch (error) {
    console.error("Error fetching chapters:", error);
    return c.json({ error: "Failed to fetch chapters" }, 500);
  }
};
