#!/usr/bin/env bash
# PROLICIT – atualiza o servidor com a última versão do GitHub
# Uso, na VM:  bash ~/prolict/deploy/atualizar.sh
set -euo pipefail
APP_DIR="${APP_DIR:-$HOME/prolict}"
WEB_DIR="/var/www/prolicit"

git -C "$APP_DIR" checkout -- . && git -C "$APP_DIR" pull --ff-only
(cd "$APP_DIR/backend" && { npm ci --omit=dev || npm install --omit=dev; })
(cd "$APP_DIR/frontend" && (npm ci || npm install) && VITE_API_URL=/api npm run build)
sudo rm -rf "${WEB_DIR:?}"/* && sudo cp -r "$APP_DIR/frontend/dist/." "$WEB_DIR/"
pm2 restart prolicit --update-env
echo "Atualizado."
