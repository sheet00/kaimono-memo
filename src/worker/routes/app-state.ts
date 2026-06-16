import { Hono } from 'hono'
import { fetchAppStateJson, saveAppStateJson } from '../repositories/app-state-repository'
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

  const listKey = c.req.header('x-list-key') || 'main'
  const json = await fetchAppStateJson(db, listKey)
  if (!json) {
    return c.json({
      lists: [],
      checkedItems: {},
      basketItems: {}
    })
  }

  return c.json(JSON.parse(json))
})

appStateRoute.post('/app-state', async (c) => {
  const db = c.env.DB

  if (!db) {
    return c.json(
      {
        error: 'D1 database binding is not configured.',
      },
      503,
    )
  }

  try {
    const listKey = c.req.header('x-list-key') || 'main'
    const body = await c.req.json()
    await saveAppStateJson(db, listKey, JSON.stringify(body))
    return c.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return c.json({ error: message }, 500)
  }
})
