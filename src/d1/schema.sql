CREATE TABLE IF NOT EXISTS lists (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS list_items (
  id TEXT PRIMARY KEY,
  list_id TEXT NOT NULL,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_list_items_list_id_sort_order
  ON list_items (list_id, sort_order, created_at);

CREATE TABLE IF NOT EXISTS shopping_items (
  id TEXT PRIMARY KEY,
  source_list_id TEXT NOT NULL,
  source_item_id TEXT,
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('shopping', 'basket')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (source_list_id) REFERENCES lists(id),
  FOREIGN KEY (source_item_id) REFERENCES list_items(id)
);

CREATE INDEX IF NOT EXISTS idx_shopping_items_status_sort_order
  ON shopping_items (status, sort_order, created_at);
