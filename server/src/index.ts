// src/index.ts
import { Hono } from 'hono'
import { createUser } from './controller/userController'

const app = new Hono()

app.get('/', (c) => c.text('Hello from Hono + Bun!'))
app.post('/users', createUser) // langsung pakai handler Hono

export default app
