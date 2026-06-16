# kaimono-memo

日常の買い物に特化した、片手タップ前提の買い物リストアプリです。

## 構成

- `src/`: Vite + React + TypeScript のフロントエンド
- `docker-compose.yml`: ローカル開発用

## ローカル開発

```bash
docker compose up -d
docker compose exec app bash
cd /app
npm install
npm run dev -- --host
```

## Cloudflare Pages デプロイ

GitHub に push したら自動デプロイする前提では、Cloudflare Pages にこのリポジトリを接続します。

Cloudflare 側の設定:

- Framework preset: `Vite`
- Root directory: `src`
- Build command: `npm run build`
- Build output directory: `dist`

補足:

- `src/wrangler.jsonc` に `pages_build_output_dir` を定義済み
- TypeScript のビルドキャッシュは `src/.cache/` に出力する設定済み

公式ドキュメント:

- Git integration: https://developers.cloudflare.com/pages/get-started/git-integration/
- Build configuration: https://developers.cloudflare.com/pages/configuration/build-configuration/
- Wrangler configuration for Pages: https://developers.cloudflare.com/pages/functions/wrangler-configuration/
