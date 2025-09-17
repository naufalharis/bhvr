// src/controllers/loginController.ts
import { PrismaClient } from "@prisma/client";
import type { Context as HonoContext } from "hono";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"; // ganti dengan env variable

export const loginUser = async (c: HonoContext) => {
  try {
    const { email, password } = await c.req.json();

    // cek user berdasarkan email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return c.json({ error: "Invalid email or password" }, 401);
    }

    // cek password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return c.json({ error: "Invalid email or password" }, 401);
    }

    // buat JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    return c.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error: any) {
    console.error(error);
    return c.json({ error: error.message }, 500);
  }
};
