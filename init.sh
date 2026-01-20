#!/bin/sh
set -e

echo "Aguardando banco de dados estar pronto..."
sleep 5

echo "Compilando aplicação..."
npm run build || { echo "Erro ao compilar"; exit 1; }

if [ ! -f "dist/src/main.js" ]; then
  echo "Erro: dist/src/main.js não foi gerado"
  exit 1
fi

echo "Executando migrations..."
npx prisma migrate deploy || echo "Migrations já aplicadas ou erro ao executar"

echo "Executando seed..."
npx ts-node prisma/seed.ts || echo "Seed já executado ou erro ao executar"

echo "Iniciando aplicação..."
node dist/src/main.js
echo "Iniciando aplicação..."
node dist/src/main
