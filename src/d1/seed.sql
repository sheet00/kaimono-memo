-- seed.sql
-- 公開用のサンプルデータのみを投入

INSERT OR REPLACE INTO app_state (key, value) VALUES (
  'sample',
  '{"lists":[{"id":"vegetables-fruits","title":"野菜・果物","items":["キャベツ","たまねぎ","にんじん","りんご","バナナ"]},{"id":"chilled-foods","title":"生鮮・冷蔵食品","items":["牛乳","たまご","豆腐","納豆","豚肉","鮭","ヨーグルト"]},{"id":"pantry","title":"調味料・常温食品","items":["醤油","砂糖","塩","コーヒー","食パン"]},{"id":"household-goods","title":"日用消耗品","items":["トイレットペーパー","ティッシュ","ゴミ袋 (30L)","サランラップ","アルミホイル"]},{"id":"personal-care","title":"洗面・ヘルスケア","items":["シャンプー","歯磨き粉","洗濯洗剤","ハンドソープ","バンドエイド"]}],"checkedItems":{"chilled-foods::牛乳":true,"vegetables-fruits::キャベツ":true,"vegetables-fruits::りんご":true,"household-goods::トイレットペーパー":true,"personal-care::シャンプー":true},"basketItems":{}}'
);
