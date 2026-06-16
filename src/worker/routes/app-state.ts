import { Hono } from 'hono'
import { buildAppState } from '../builders/build-app-state'
import { fetchAppStateRows } from '../repositories/app-state-repository'
import type { WorkerEnv } from '../types/env'

export const appStateRoute = new Hono<WorkerEnv>()

appStateRoute.get('/app-state', async (c) => {
  const db = c.env.DB

  if (!db) {
    return c.json(
      {
        error: 'D1 database binding is not configured.',
      },
      503,
    )
  }

  const { listRows, shoppingRows } = await fetchAppStateRows(db)
  return c.json(buildAppState(listRows, shoppingRows))
})
