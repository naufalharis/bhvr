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
import { addAffiliateCourse, listAffiliateCourses } from './controller/affiliateController';
import { createOrder, addOrderLine, addPayment, getOrderDetails } from "./controller/orderController";

const app = new Hono()
app.route("/api/course-categories", courseCategory);

app.get('/', (c) => c.text("HELLO I'M HONO, PLEASE TESTING VIA POSTMAN APP OR FRONTEND"))
app.post('/api/users', createUser) // langsung pakai handler Hono
app.post('/api/login', loginUser);
// courses
app.post("/api/courses", authMiddleware, createCourse);
app.get('/api/courses', authMiddleware, getCourses);
app.put('/api/courses/:id', authMiddleware, updateCourse)
app.delete('/api/courses/:id', authMiddleware, deleteCourse);
// courses - chapters
app.post("api/courses/:courseId/chapters", authMiddleware, addChapter);
app.get("api/courses/:courseId/chapters", authMiddleware, getChapters);
app.put("api/chapters/:chapterId", authMiddleware, updateChapter);
app.delete("api/chapters/:chapterId", authMiddleware, deleteChapter);
// courses - chapter contents
app.post("/api/chapters/:chapterId/contents", authMiddleware, addChapterContent);
app.get("/api/chapters/:chapterId/contents", authMiddleware, getContents);
app.put("/api/contents/:contentId", authMiddleware, updateContent);
app.delete("/api/contents/:contentId", authMiddleware, deleteContent);
// affiliates
app.post("/affiliates/:affiliateId/courses", authMiddleware, addAffiliateCourse);
app.get("/affiliates/:affiliateId/courses", authMiddleware, listAffiliateCourses);
// orders and payments
app.post("/orders", authMiddleware, createOrder);
app.post("/order-lines", authMiddleware, addOrderLine);
app.post("/payments", authMiddleware, addPayment);
app.get("/orders/:id", authMiddleware, getOrderDetails);


export default app
