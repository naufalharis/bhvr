import { PrismaClient } from "@prisma/client";
import type { Context } from "hono";

const prisma = new PrismaClient();


export const getEnrolledCourses = async (c: Context) => {
  try {
    const user = c.get("user");
    if (!user || user.role !== "student") {
      return c.json({ error: "Unauthorized. Only students can access enrolled courses." }, 401);
    }

    const enrolled = await prisma.enrolledCourse.findMany({
      where: { user_id: user.id },
      include: {
        course: true,     // detail course
        orderRef: true,  // detail order
      },
    });

    return c.json({ enrolled });
  } catch (error: any) {
    console.error(error);
    return c.json({ error: error.message }, 500);
  }
};
