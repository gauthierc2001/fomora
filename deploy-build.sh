#!/bin/bash
set -e

echo "🔧 Starting deployment build..."

echo "📦 Generating Prisma client..."
cd packages/db
pnpm db:generate
cd ../..

echo "🏗️ Building Next.js app..."
cd apps/web
pnpm build
cd ../..

echo "✅ Build completed successfully!"
