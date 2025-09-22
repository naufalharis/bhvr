import { PrismaClient } from "@prisma/client";
import type { Context } from "hono";

const prisma = new PrismaClient();

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
    const { order_id, product_id, course_id, status } = await c.req.json();

    if (!order_id || !status) {
      return c.json({ error: "order_id and status are required" }, 400);
    }

    // Minimal salah satu harus ada
    if (!product_id && !course_id) {
      return c.json({ error: "At least one of product_id or course_id is required" }, 400);
    }

    // Simpan order line, course_id dan product_id bisa null
    const orderLine = await prisma.orderLine.create({
      data: {
        order_id,
        product_id: product_id ?? null,
        course_id: course_id ?? null,
        status,
      },
    });

    return c.json({ message: "Order line added", orderLine }, 201);
  } catch (error: any) {
    console.error(error);
    return c.json({ error: error.message }, 500);
  }
};

// === STEP 3: Add Payment
export const addPayment = async (c: Context) => {
  try {
    const { order_id, method, status, reference_number } = await c.req.json();

    const payment = await prisma.orderPayment.create({
      data: {
        order_id,
        method,
        status,
        reference_number,
      },
    });

    // STEP 4: Jika payment sukses → enroll student ke course
    if (status === "success") {
      const order = await prisma.order.findUnique({
        where: { id: order_id },
      });

      if (!order) {
        return c.json({ error: "Order not found" }, 404);
      }

      const orderLines = await prisma.orderLine.findMany({
        where: { order_id },
      });

      for (const line of orderLines) {
        if (line.course_id) {
          await prisma.enrolledCourse.create({
            data: {
              user_id: order.user_id,
              course_id: line.course_id,
              order_id,
            },
          });
        }
      }
    }

    return c.json({ message: "Payment recorded", payment }, 201);
  } catch (error: any) {
    console.error(error);
    return c.json({ error: error.message }, 500);
  }
};

// === STEP 5: Get Order with Details
export const getOrderDetails = async (c: Context) => {
  try {
    const { id } = c.req.param();

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        lines: true, // orderLines
        payments: true, // orderPayments
        enrolled: true, // enrolledCourses
      },
    });

    if (!order) {
      return c.json({ error: "Order not found" }, 404);
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
    const { orderId } = c.req.param();
    const orderLines = await prisma.orderLine.findMany({
      where: { order_id: orderId },
    });
    return c.json({ orderLines });
  } catch (error: any) {
    console.error(error);
    return c.json({ error: error.message }, 500);
  }
};
