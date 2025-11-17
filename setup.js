#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Viral n8n Platform Setup\n');

// Check Node.js version
const nodeVersion = process.version;
console.log(`✓ Node.js version: ${nodeVersion}`);

// Create .env files if they don't exist
const envTemplates = {
  '.env': `# Root Environment
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=service-role-key
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/generate-hungarian-content
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
`,
  'scheduler/.env': `# Scheduler Service Env
PORT=3001
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/publish
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=service-role-key
`,
  'trending-scraper/.env': `# Trending Scraper Env
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/trending-content
SCRAPE_INTERVAL=*/30 * * * *
`,
  'dashboard/.env': `# Dashboard Env
VITE_API_BASE=http://localhost:3001/api
VITE_N8N_WEBHOOK=https://your-n8n-instance.com/webhook/generate-hungarian-content
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=public-anon-key
`
};

const envFiles = [
  { src: '.env.example', dest: '.env' },
  { src: 'scheduler/.env.example', dest: 'scheduler/.env' },
  { src: 'trending-scraper/.env.example', dest: 'trending-scraper/.env' },
  { src: 'dashboard/.env.example', dest: 'dashboard/.env' }
];

console.log('\n📝 Setting up environment files...');
envFiles.forEach(({ src, dest }) => {
  const srcPath = path.join(__dirname, src);
  const destPath = path.join(__dirname, dest);
  
  if (fs.existsSync(destPath)) {
    console.log(`  ⚠ ${dest} already exists, skipping`);
    return;
  }

  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`  ✓ Created ${dest}`);
    return;
  }

  if (envTemplates[dest]) {
    fs.writeFileSync(destPath, envTemplates[dest]);
    console.log(`  ✓ Created ${dest} from template`);
  } else {
    console.log(`  ⚠ ${src} not found, and no template available`);
  }
});

// Install dependencies
console.log('\n📦 Installing dependencies...');
const dirs = ['dashboard', 'scheduler', 'trending-scraper', 'nodes'];

dirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (fs.existsSync(dirPath) && fs.existsSync(path.join(dirPath, 'package.json'))) {
    console.log(`\n  Installing ${dir}...`);
    try {
      execSync('npm install', { cwd: dirPath, stdio: 'inherit' });
      console.log(`  ✓ ${dir} dependencies installed`);
    } catch (error) {
      console.log(`  ✗ Failed to install ${dir} dependencies`);
    }
  }
});

console.log('\n✅ Setup complete!\n');
console.log('Next steps:');
console.log('1. Edit .env files with your API keys and configuration');
console.log('2. Start Redis (required for scheduler):');
console.log('   - Windows: Download Redis or use Docker');
console.log('   - Mac: brew install redis && brew services start redis');
console.log('   - Linux: sudo apt install redis && sudo systemctl start redis');
console.log('3. Run: npm run dev');
console.log('4. Open http://localhost:3000 in your browser\n');

