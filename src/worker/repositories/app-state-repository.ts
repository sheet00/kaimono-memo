import { drizzle } from 'drizzle-orm/d1'
import { eq } from 'drizzle-orm'
import { appState } from '../db/schema'

export async function fetchAppStateJson(db: D1Database, listKey: string): Promise<string | null> {
  const client = drizzle(db)
  const result = await client
    .select({ value: appState.value })
    .from(appState)
    .where(eq(appState.key, listKey))
    .get()

  return result?.value ?? null
}

export async function saveAppStateJson(db: D1Database, listKey: string, json: string): Promise<void> {
  const client = drizzle(db)
  await client
    .insert(appState)
    .values({ key: listKey, value: json })
    .onConflictDoUpdate({
      target: appState.key,
      set: { value: json },
    })
    .run()
}
