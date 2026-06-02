#!/bin/sh
set -e

cd /usr/src/app/backend
git pull origin main
cp -r /usr/src/app/backend/frontend/. /usr/src/app/frontend/
echo "Deploy concluido! Reiniciando o servidor..."
kill 1
