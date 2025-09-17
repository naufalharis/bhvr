// src/controllers/courseController.ts
import { PrismaClient, CourseType, ContentType } from "@prisma/client";
import type { Context as HonoContext } from "hono";

const prisma = new PrismaClient();

// =======================
// Create Course
// =======================
export const createCourse = async (c: HonoContext) => {
  try {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);
    if (user.role !== "instructor") return c.json({ error: "Forbidden. Only instructors can add courses." }, 403);

    const instructor = await prisma.instructor.findFirst({ where: { user_id: user.id } });
    if (!instructor) return c.json({ error: "Instructor record not found" }, 400);

    const { title, overview, cover, course_type, slug } = await c.req.json();

    const newCourse = await prisma.course.create({
      data: {
        title,
        overview,
        cover,
        course_type: course_type as CourseType,
        slug,
        instructor_id: instructor.id,
      },
    });

    return c.json({ message: "Course created successfully", course: newCourse }, 201);
  } catch (error: any) {
    console.error("createCourse error:", error);
    return c.json({ error: error.message }, 500);
  }
};

// =======================
// Add Chapter
// =======================
export const addChapter = async (c: HonoContext) => {
  try {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);
    if (user.role !== "instructor") return c.json({ error: "Forbidden. Only instructors can add chapters." }, 403);

    const courseId = c.req.param("courseId"); // string
    if (!courseId) return c.json({ error: "courseId is required" }, 400);

    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });
    if (!course) return c.json({ error: "Course not found" }, 404);

    const instructor = await prisma.instructor.findFirst({ where: { user_id: user.id } });
    if (course.instructor_id !== instructor?.id) return c.json({ error: "You are not the owner of this course" }, 403);

    const { title, overview, cover, sort_order } = await c.req.json();

    const newChapter = await prisma.courseChapter.create({
      data: {
        course_id: courseId,
        title,
        overview,
        cover,
        sort_order,
      },
    });

    return c.json({ message: "Chapter added successfully", chapter: newChapter }, 201);
  } catch (error: any) {
    console.error("addChapter error:", error);
    return c.json({ error: error.message }, 500);
  }
};

// =======================
// Add Chapter Content
// =======================
export const addChapterContent = async (c: HonoContext) => {
  try {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);
    if (user.role !== "instructor") return c.json({ error: "Forbidden. Only instructors can add content." }, 403);

    const chapterId = c.req.param("chapterId");
    if (!chapterId) return c.json({ error: "chapterId is required" }, 400);

    const chapter = await prisma.courseChapter.findUnique({
      where: { id: chapterId },
      include: { course: true },
    });
    if (!chapter) return c.json({ error: "Chapter not found" }, 404);

    const instructor = await prisma.instructor.findFirst({ where: { user_id: user.id } });
    if (chapter.course.instructor_id !== instructor?.id) return c.json({ error: "You are not the owner of this course" }, 403);

    const { title, overview, cover, content_type, sort_order, path, original_file_name } = await c.req.json();

    const newContent = await prisma.courseChapterContent.create({
      data: {
        chapter_id: chapterId,
        title,
        overview,
        cover,
        content_type: content_type as ContentType,
        sort_order,
        path,
        original_file_name,
      },
    });

    return c.json({ message: "Content added successfully", content: newContent }, 201);
  } catch (error: any) {
    console.error("addChapterContent error:", error);
    return c.json({ error: error.message }, 500);
  }
};
