// src/index.ts
import { Hono } from 'hono'
import { createUser } from './controller/userController'
import { loginUser } from './controller/loginController'
import { createCourse, addChapter, addChapterContent } from './controller/courseController'
import { authMiddleware } from "./middleware/authMiddleware";

const app = new Hono()

app.get('/', (c) => c.text('Hello from Hono + Bun!'))
app.post('/users', createUser) // langsung pakai handler Hono
app.post('/login', loginUser);
app.post("/courses", authMiddleware, createCourse);
app.post("/courses/:courseId/chapters", authMiddleware, addChapter);
app.post("/chapters/:chapterId/contents", authMiddleware, addChapterContent);

export default app
