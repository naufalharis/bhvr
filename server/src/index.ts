// src/index.ts
import { Hono } from 'hono'
import { createUser } from './controller/userController'
import { loginUser } from './controller/loginController'
import { 
     getCourses, createCourse, updateCourse, deleteCourse,
     getChapters, addChapter, updateChapter, deleteChapter,
     getContents, addChapterContent, updateContent, deleteContent } from './controller/courseController'
import { authMiddleware } from "./middleware/authMiddleware";
import courseCategory from './controller/courseCategoryController'

const app = new Hono()
app.route("/api/course-categories", courseCategory);

app.get('/', (c) => c.text('Hello from Hono + Bun!'))
app.post('/users', createUser) // langsung pakai handler Hono
app.post('/login', loginUser);
//courses
app.post("/courses", authMiddleware, createCourse);
app.get('/courses', authMiddleware, getCourses);
app.put('/courses/:id', authMiddleware, updateCourse)
app.delete('/courses/:id', authMiddleware, deleteCourse);
//courses - chapters
app.post("/courses/:courseId/chapters", authMiddleware, addChapter);
app.get("/courses/:courseId/chapters", authMiddleware, getChapters);
app.put("/chapters/:chapterId", authMiddleware, updateChapter);
app.delete("/chapters/:chapterId", authMiddleware, deleteChapter);
//courses - chapter contents
app.post("/chapters/:chapterId/contents", authMiddleware, addChapterContent);
app.get("/chapters/:chapterId/contents", authMiddleware, getContents);
app.put("/contents/:contentId", authMiddleware, updateContent);
app.delete("/contents/:contentId", authMiddleware, deleteContent);
//courses - chapter contents

export default app
