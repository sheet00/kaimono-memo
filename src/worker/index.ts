import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { appStateRoute } from './routes/app-state'
import { healthRoute } from './routes/health'
import type { WorkerEnv } from './types/env'

const DEV_ORIGIN = 'http://localhost:5173'
const app = new Hono<WorkerEnv>()

app.use('/api/*', cors({ origin: DEV_ORIGIN }))
app.route('/api', healthRoute)
app.route('/api', appStateRoute)

app.all('*', (c) => c.env.ASSETS.fetch(c.req.raw))

export default app
