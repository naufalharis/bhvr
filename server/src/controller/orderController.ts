import { PrismaClient } from "@prisma/client";
import type { Context, Next } from "hono";

const prisma = new PrismaClient();

// === Middleware Auth ===
export const authMiddleware = async (c: Context, next: Next) => {
  try {
    const user = c.get("user"); // diasumsikan sudah di-set di JWT verify
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    await next();
  } catch (err: any) {
    console.error("Auth error:", err);
    return c.json({ error: "Authentication failed" }, 401);
  }
};

// === STEP 1: Create Order
export const createOrder = async (c: Context) => {
  try {
    const user = c.get("user");
    if (!user || user.role !== "student") {
      return c.json({ error: "Unauthorized. Only students can order." }, 401);
    }

    const { status } = await c.req.json();

    const newOrder = await prisma.order.create({
      data: {
        user_id: user.id,
        status: status || "pending",
      },
    });

    return c.json({ message: "Order created", order: newOrder }, 201);
  } catch (error: any) {
    console.error(error);
    return c.json({ error: error.message }, 500);
  }
};

// === STEP 2: Add Order Line
export const addOrderLine = async (c: Context) => {
  try {
    const user = c.get("user");
    const { order_id, product_id, course_id, status } = await c.req.json();

    if (!order_id || !status) {
      return c.json({ error: "order_id and status are required" }, 400);
    }

    // Pastikan order milik user
    const order = await prisma.order.findUnique({
      where: { id: order_id },
    });

    if (!order || order.user_id !== user.id) {
      return c.json({ error: "Order not found or not owned by user" }, 403);
    }

    if (!product_id && !course_id) {
      return c.json(
        { error: "At least one of product_id or course_id is required" },
        400
      );
    }

    const newOrderLine = await prisma.orderLine.create({
      data: {
        order_id,
        product_id: product_id || null,
        course_id: course_id || null,
        status,
      },
    });

    return c.json({ success: true, data: newOrderLine }, 201);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Failed to add order line" }, 500);
  }
};

// === STEP 3: Add Payment
export const addPayment = async (c: Context) => {
  try {
    const user = c.get("user");
    const { order_id, method, status, reference_number } = await c.req.json();

    // pastikan order ada dan milik user
    const order = await prisma.order.findUnique({
      where: { id: order_id },
      include: {
        lines: {
          include: {
            product: {
              include: { details: true }, // biar dapat course dari product
            },
          },
        },
      },
    });

    if (!order || order.user_id !== user.id) {
      return c.json({ error: "Order not found or not owned by user" }, 403);
    }

    // simpan payment
    const payment = await prisma.orderPayment.create({
      data: {
        order_id,
        method,
        status,
        reference_number,
      },
    });

    let enrolledCourses: any[] = [];

    if (status === "success") {
      for (const line of order.lines) {
        // CASE 1: langsung punya course_id
        if (line.course_id) {
          const existing = await prisma.enrolledCourse.findFirst({
            where: {
              user_id: order.user_id,
              course_id: line.course_id,
              order_id: order.id,
            },
          });

          if (!existing) {
            const enrolled = await prisma.enrolledCourse.create({
              data: {
                user_id: order.user_id,
                course_id: line.course_id,
                order_id: order.id,
              },
            });
            enrolledCourses.push(enrolled);
          }
        }

        // CASE 2: lewat product → productDetail → course_id
        if (line.product_id) {
          const productDetails = await prisma.productDetail.findMany({
            where: { product_id: line.product_id },
          });

          for (const detail of productDetails) {
            const existing = await prisma.enrolledCourse.findFirst({
              where: {
                user_id: order.user_id,
                course_id: detail.course_id,
                order_id: order.id,
              },
            });

            if (!existing) {
              const enrolled = await prisma.enrolledCourse.create({
                data: {
                  user_id: order.user_id,
                  course_id: detail.course_id,
                  order_id: order.id,
                },
              });
              enrolledCourses.push(enrolled);
            }
          }
        }

        // update orderLine status
        await prisma.orderLine.update({
          where: { id: line.id },
          data: { status: "completed" },
        });
      }

      // update order status
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "completed" },
      });
    }

    return c.json(
      {
        message: "✅ Payment recorded & enrollment success",
        payment,
        enrolledCourses,
      },
      201
    );
  } catch (error: any) {
    console.error("addPayment error:", error);
    return c.json({ error: error.message }, 500);
  }
};
// === STEP 5: Get Order with Details
export const getOrderDetails = async (c: Context) => {
  try {
    const user = c.get("user");
    const { id } = c.req.param();

    const order = await prisma.order.findFirst({
      where: { id, user_id: user.id },
      include: {
        lines: true,
        payments: true,
        enrolled: true,
      },
    });

    if (!order) {
      return c.json({ error: "Order not found or not owned by user" }, 404);
    }

    return c.json({ order });
  } catch (error: any) {
    console.error(error);
    return c.json({ error: error.message }, 500);
  }
};

// === STEP 6: Get Order Lines by Order
export const getOrderLinesByOrder = async (c: Context) => {
  try {
    const user = c.get("user");
    const { orderId } = c.req.param();

    const order = await prisma.order.findFirst({
      where: { id: orderId, user_id: user.id },
    });

    if (!order) {
      return c.json({ error: "Order not found or not owned by user" }, 404);
    }

    const orderLines = await prisma.orderLine.findMany({
      where: { order_id: orderId },
      include: { course: true, product: true }, // biar ada relasi
    });

    return c.json({ orderLines });
  } catch (error: any) {
    console.error(error);
    return c.json({ error: error.message }, 500);
  }
};

// === STEP 7: Get Pending Order Lines for Student
export const getPendingOrderLinesForStudent = async (c: Context) => {
  try {
    const user = c.get("user");
    if (!user || user.role !== "student") {
      return c.json({ error: "Unauthorized. Only students can access." }, 401);
    }

    const orders = await prisma.order.findMany({
      where: { user_id: user.id },
      select: { id: true },
    });
    const orderIds = orders.map((o) => o.id);

    const orderLines = await prisma.orderLine.findMany({
      where: {
        order_id: { in: orderIds },
        status: "pending",
      },
      include: { course: true, product: true },
    });

    return c.json({ orderLines });
  } catch (error: any) {
    console.error(error);
    return c.json({ error: error.message }, 500);
  }
};

// === STEP 8: Post Order Line for Student