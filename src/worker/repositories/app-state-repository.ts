export async function fetchAppStateJson(db: D1Database): Promise<string | null> {
  const result = await db
    .prepare("SELECT value FROM app_state WHERE key = 'main'")
    .first<{ value: string }>()
  return result?.value ?? null
}

export async function saveAppStateJson(db: D1Database, json: string): Promise<void> {
  await db
    .prepare("INSERT OR REPLACE INTO app_state (key, value) VALUES ('main', ?)")
    .bind(json)
    .run()
}
