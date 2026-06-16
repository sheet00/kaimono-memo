#!/usr/bin/env bash

set -eu

docker compose exec app sh -lc 'cd /app && npx wrangler dev --ip 0.0.0.0 --port 8787'
