#!/bin/bash
set -e

echo "🔧 Installing dependencies..."
pnpm install --no-frozen-lockfile

echo "🗄️ Generating Prisma client..."
cd packages/db && pnpm db:generate && cd ../..

echo "🏗️ Building web app..."
cd apps/web && pnpm build

echo "✅ Build complete!"
