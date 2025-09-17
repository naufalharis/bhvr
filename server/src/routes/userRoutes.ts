import { Router } from "express";
import { createUser } from "../controller/userController";

const router = Router();

router.post("/users", createUser);

export default router;