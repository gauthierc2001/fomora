const fs = require('fs');
const path = require('path');

// Read the example env file
const envExample = fs.readFileSync('.env.example', 'utf8');

// Create a proper development .env file
const devEnv = envExample
  .replace('postgresql://user:password@host:port/database?schema=public', 'postgresql://postgres:password@localhost:5432/fomora_dev')
  .replace('your-super-secret-jwt-key-here-min-32-characters', 'dev-jwt-secret-key-for-local-development-only-32-chars')
  .replace('2025-09-06T11:00:00.000Z', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()); // Tomorrow

// Write the .env file
fs.writeFileSync('.env', devEnv);

console.log('✅ Created .env file for development');
console.log('⚠️  You need to set up a PostgreSQL database or use a cloud service like Supabase');
console.log('📝 Update DATABASE_URL in .env with your actual database connection string');
