-- seed.sql
-- 初期データの投入

-- 1. lists の投入
INSERT OR IGNORE INTO lists (id, name, sort_order) VALUES
  ('list-refrigerator', '冷蔵庫', 1),
  ('list-daily', '生活品', 2),
  ('list-occasional', 'たまに買う', 3);

-- 2. list_items の投入
INSERT OR IGNORE INTO list_items (id, list_id, name, sort_order) VALUES
  -- 冷蔵庫
  ('item-milk', 'list-refrigerator', '牛乳', 1),
  ('item-egg', 'list-refrigerator', '卵', 2),
  ('item-natto', 'list-refrigerator', '納豆', 3),
  ('item-tofu', 'list-refrigerator', '豆腐', 4),
  -- 生活品
  ('item-toilet-paper', 'list-daily', 'トイレットペーパー', 1),
  ('item-detergent', 'list-daily', '洗濯洗剤', 2),
  ('item-tissue', 'list-daily', 'ティッシュ', 3),
  -- たまに買う
  ('item-light-bulb', 'list-occasional', '電球', 1),
  ('item-battery', 'list-occasional', '乾電池', 2);

-- 3. shopping_items の投入 (動作確認用)
INSERT OR IGNORE INTO shopping_items (id, source_list_id, source_item_id, name, status, sort_order) VALUES
  ('shop-milk', 'list-refrigerator', 'item-milk', '牛乳', 'shopping', 1),
  ('shop-toilet-paper', 'list-daily', 'item-toilet-paper', 'トイレットペーパー', 'basket', 2);
