import { Hono } from 'hono'
import type { WorkerEnv } from '../types/env'

export const healthRoute = new Hono<WorkerEnv>()

healthRoute.get('/health', (c) =>
  c.json({
    ok: true,
  }),
)
