// src/index.ts
import { Hono } from 'hono'
import { createUser } from './controller/userController'
import { loginUser } from './controller/loginController'

const app = new Hono()

app.get('/', (c) => c.text('Hello from Hono + Bun!'))
app.post('/users', createUser) // langsung pakai handler Hono
app.post('/login', loginUser);

export default app
