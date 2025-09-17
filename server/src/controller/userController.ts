// src/controllers/userController.ts
import { PrismaClient } from "@prisma/client";
import type { Context as HonoContext } from "hono";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const createUser = async (c: HonoContext) => {
  try {
    const {
      first_name,
      last_name,
      gender,
      mobile_number,
      birth_date,
      birth_place,
      username,
      email,
      password,
      role,
    } = await c.req.json();

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // buat user
    const newUser = await prisma.user.create({
      data: {
        first_name,
        last_name,
        gender,
        mobile_number,
        birth_date: birth_date ? new Date(birth_date) : null,
        birth_place,
        username,
        email,
        password: hashedPassword,
        role,
      },
    });

    // role-based insert
    if (role === "affiliate") {
      await prisma.affiliate.create({
        data: {
          user_id: newUser.id,
          status: "active",
          unique_code: `AFF-${newUser.id}-${Date.now()}`,
        },
      });
    } else if (role === "instructor") {
      await prisma.instructor.create({
        data: {
          user_id: newUser.id,
          status: "active",
        },
      });
    }

    return c.json({
      message: "User created successfully",
      user: newUser,
    }, 201);

  } catch (error: any) {
    console.error(error);
    return c.json({ error: error.message }, 500);
  }
};
