#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Viral n8n Platform Setup\n');

// Check Node.js version
const nodeVersion = process.version;
console.log(`✓ Node.js version: ${nodeVersion}`);

// Create .env files if they don't exist
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
  
  if (fs.existsSync(srcPath) && !fs.existsSync(destPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`  ✓ Created ${dest}`);
  } else if (fs.existsSync(destPath)) {
    console.log(`  ⚠ ${dest} already exists, skipping`);
  } else {
    console.log(`  ⚠ ${src} not found, skipping`);
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

