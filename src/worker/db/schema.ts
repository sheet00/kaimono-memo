import { text, sqliteTable } from 'drizzle-orm/sqlite-core'

export const appState = sqliteTable('app_state', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
})
