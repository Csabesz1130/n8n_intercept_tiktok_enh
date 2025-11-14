#!/usr/bin/env node

/**
 * Test script to verify all services are running correctly
 */

const http = require('http');

const services = [
  { name: 'Dashboard', url: 'http://localhost:3000', timeout: 5000 },
  { name: 'Scheduler API', url: 'http://localhost:3001/health', timeout: 5000 },
];

console.log('🧪 Testing Viral n8n Platform Services...\n');

let passed = 0;
let failed = 0;

async function testService(service) {
  return new Promise((resolve) => {
    const req = http.get(service.url, { timeout: service.timeout }, (res) => {
      if (res.statusCode === 200 || res.statusCode === 404) {
        // 404 is OK for dashboard (React router)
        console.log(`✅ ${service.name}: Running`);
        passed++;
        resolve(true);
      } else {
        console.log(`❌ ${service.name}: Unexpected status ${res.statusCode}`);
        failed++;
        resolve(false);
      }
    });

    req.on('error', (err) => {
      if (err.code === 'ECONNREFUSED') {
        console.log(`❌ ${service.name}: Not running (connection refused)`);
      } else {
        console.log(`❌ ${service.name}: Error - ${err.message}`);
      }
      failed++;
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      console.log(`⏱️  ${service.name}: Timeout`);
      failed++;
      resolve(false);
    });
  });
}

async function runTests() {
  for (const service of services) {
    await testService(service);
  }

  console.log('\n' + '='.repeat(50));
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(50) + '\n');

  if (failed === 0) {
    console.log('🎉 All services are running correctly!');
    console.log('\nAccess the app:');
    console.log('  📊 Dashboard: http://localhost:3000');
    console.log('  ⏰ Scheduler: http://localhost:3001');
    process.exit(0);
  } else {
    console.log('⚠️  Some services are not running.');
    console.log('\nMake sure you started all services:');
    console.log('  npm run dev');
    console.log('  or');
    console.log('  ./start.sh (Linux/Mac)');
    console.log('  .\\start.ps1 (Windows)');
    process.exit(1);
  }
}

runTests();

