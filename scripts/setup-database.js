#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔧 Setting up database...');

try {
  // Generate Prisma client
  console.log('📦 Generating Prisma client...');
  execSync('cd packages/db && pnpm db:generate', { stdio: 'inherit' });
  
  // Push database schema
  console.log('🗄️ Creating database tables...');
  execSync('cd packages/db && pnpm db:push', { stdio: 'inherit' });
  
  console.log('✅ Database setup complete!');
} catch (error) {
  console.error('❌ Database setup failed:', error.message);
  process.exit(1);
}
