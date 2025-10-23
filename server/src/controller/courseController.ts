// src/controllers/courseController.ts
import { PrismaClient, CourseType, ContentType } from "@prisma/client";
import type { Context as HonoContext } from "hono";
import type { Context } from "hono";

const prisma = new PrismaClient();

// =======================
//  Course
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

//nambahin kode untuk student

export const getCourses = async (c: Context) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  let courses;
  if (user.role === "instructor") {
    const instructor = await prisma.instructor.findUnique({ where: { user_id: user.id } });
    if (!instructor) return c.json({ error: "Instructor not found" }, 404);
    courses = await prisma.course.findMany({ where: { instructor_id: instructor.id }, include: { chapters: true } });
  } else {
    // student → bisa lihat semua courses
    courses = await prisma.course.findMany({ include: { chapters: true } });
  }

  return c.json(courses);
};

export const updateCourse = async (c: Context) => {
  const user = c.get("user");
  if (!user || user.role !== "instructor") {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const courseId = c.req.param("id"); // ⬅️ ganti ke "id"
  const body = await c.req.json();

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return c.json({ error: "Course not found" }, 404);

  // pastikan course milik instructor
  const instructor = await prisma.instructor.findUnique({ where: { user_id: user.id } });
  if (course.instructor_id !== instructor?.id) {
    return c.json({ error: "Forbidden" }, 403);
  }

  const updated = await prisma.course.update({
    where: { id: courseId },
    data: {
      title: body.title,
      overview: body.overview,
      cover: body.cover,
      course_type: body.course_type,
    },
  });

  return c.json(updated);
};

export const deleteCourse = async (c: Context) => {
  const user = c.get("user");
  if (!user || user.role !== "instructor") {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const courseId = c.req.param("id"); // ⬅️ ganti ke "id"

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return c.json({ error: "Course not found" }, 404);

  const instructor = await prisma.instructor.findUnique({ where: { user_id: user.id } });
  if (course.instructor_id !== instructor?.id) {
    return c.json({ error: "Forbidden" }, 403);
  }

  await prisma.course.delete({ where: { id: courseId } });
  return c.json({ message: "Course deleted successfully" });
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

export const getChapters = async (c: Context) => {
  const courseId = c.req.param("courseId");
  const chapters = await prisma.courseChapter.findMany({ where: { course_id: courseId } });
  return c.json(chapters);
};

export const updateChapter = async (c: Context) => {
  const chapterId = c.req.param("chapterId");
  const body = await c.req.json();

  const chapter = await prisma.courseChapter.findUnique({ where: { id: chapterId }, include: { course: true } });
  if (!chapter) return c.json({ error: "Chapter not found" }, 404);

  const user = c.get("user");
  const instructor = await prisma.instructor.findUnique({ where: { user_id: user.id } });
  if (chapter.course.instructor_id !== instructor?.id) {
    return c.json({ error: "Forbidden" }, 403);
  }

  const updated = await prisma.courseChapter.update({
    where: { id: chapterId },
    data: {
      title: body.title,
      overview: body.overview,
      cover: body.cover,
      sort_order: body.sort_order,
    },
  });
  return c.json(updated);
};

export const deleteChapter = async (c: Context) => {
  const chapterId = c.req.param("chapterId");

  const chapter = await prisma.courseChapter.findUnique({ where: { id: chapterId }, include: { course: true } });
  if (!chapter) return c.json({ error: "Chapter not found" }, 404);

  const user = c.get("user");
  const instructor = await prisma.instructor.findUnique({ where: { user_id: user.id } });
  if (chapter.course.instructor_id !== instructor?.id) {
    return c.json({ error: "Forbidden" }, 403);
  }

  await prisma.courseChapter.delete({ where: { id: chapterId } });
  return c.json({ message: "Chapter deleted successfully" });
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

    const {
      title,
      overview,
      cover,
      content_type,
      sort_order,
      path,
      original_file_name,
    } = await c.req.json();

    // Validasi minimal
    if (!title || !content_type) {
      return c.json({ error: "Title and content_type are required" }, 400);
    }

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
    return c.json({ error: error.message || "Internal server error" }, 500);
  }
};

export const getContents = async (c: Context) => {
  try {
    const chapterId = c.req.param("chapterId");
    if (!chapterId) return c.json({ error: "chapterId is required" }, 400);

    const contents = await prisma.courseChapterContent.findMany({
      where: { chapter_id: chapterId },
    });
    return c.json(contents);
  } catch (error: any) {
    return c.json({ error: error.message || "Internal server error" }, 500);
  }
};

export const updateContent = async (c: Context) => {
  try {
    const contentId = c.req.param("contentId");
    if (!contentId) return c.json({ error: "contentId is required" }, 400);

    const body = await c.req.json();

    const content = await prisma.courseChapterContent.findUnique({
      where: { id: contentId },
      include: { chapter: { include: { course: true } } },
    });
    if (!content) return c.json({ error: "Content not found" }, 404);

    const user = c.get("user");
    const instructor = await prisma.instructor.findUnique({ where: { user_id: user.id } });
    if (content.chapter.course.instructor_id !== instructor?.id) {
      return c.json({ error: "Forbidden" }, 403);
    }

    const updated = await prisma.courseChapterContent.update({
      where: { id: contentId },
      data: {
        title: body.title,
        overview: body.overview,
        cover: body.cover,
        content_type: body.content_type,
        sort_order: body.sort_order,
        path: body.path,
        original_file_name: body.original_file_name,
      },
    });
    return c.json(updated);
  } catch (error: any) {
    return c.json({ error: error.message || "Internal server error" }, 500);
  }
};

export const deleteContent = async (c: Context) => {
  try {
    const contentId = c.req.param("contentId");
    if (!contentId) return c.json({ error: "contentId is required" }, 400);

    const content = await prisma.courseChapterContent.findUnique({
      where: { id: contentId },
      include: { chapter: { include: { course: true } } },
    });
    if (!content) return c.json({ error: "Content not found" }, 404);

    const user = c.get("user");
    const instructor = await prisma.instructor.findUnique({ where: { user_id: user.id } });
    if (content.chapter.course.instructor_id !== instructor?.id) {
      return c.json({ error: "Forbidden" }, 403);
    }

    await prisma.courseChapterContent.delete({ where: { id: contentId } });
    return c.json({ message: "Content deleted successfully" });
  } catch (error: any) {
    return c.json({ error: error.message || "Internal server error" }, 500);
  }
};


// =======================
//  Get Chapters for Dropdown
// =======================
export const getChaptersForDropdown = async (c: Context) => {
  try {
    const courseId = c.req.param("courseId");
    if (!courseId) return c.json({ error: "courseId is required" }, 400);

    // Ambil semua chapter dari course tersebut
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
            original_file_name: true,
            sort_order: true,
          },
        },
      },
    });

    // Jika tidak ada chapter
    if (chapters.length === 0) {
      return c.json({ message: "No chapters found for this course", chapters: [] }, 200);
    }

    return c.json({ message: "Chapters fetched successfully", chapters }, 200);
  } catch (error: any) {
    console.error("getChaptersForDropdown error:", error);
    return c.json({ error: error.message || "Failed to fetch chapters" }, 500);
  }
};
