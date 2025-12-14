#!/usr/bin/env node

/**
 * Pre-deployment check script
 * Run: node scripts/check-deployment.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Pre-Deployment Check...\n');

let errors = [];
let warnings = [];

// 1. Verifică variabilele de mediu
console.log('1. Verificare variabile de mediu...');
const envFile = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envFile)) {
  warnings.push('⚠️  .env.local nu există - va trebui să fie setat pe hosting');
} else {
  const envContent = fs.readFileSync(envFile, 'utf-8');
  if (!envContent.includes('NEXT_PUBLIC_SUPABASE_URL')) {
    errors.push('❌ NEXT_PUBLIC_SUPABASE_URL lipsește din .env.local');
  }
  if (!envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY')) {
    errors.push('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY lipsește din .env.local');
  }
}

// 2. Verifică fișierele esențiale
console.log('2. Verificare fișiere esențiale...');
const essentialFiles = [
  'package.json',
  'next.config.mjs',
  'tsconfig.json',
  'pages/_app.tsx',
  'pages/index.tsx',
  'styles/globals.css',
];

essentialFiles.forEach(file => {
  if (!fs.existsSync(path.join(process.cwd(), file))) {
    errors.push(`❌ ${file} lipsește`);
  }
});

// 3. Verifică assets-urile
console.log('3. Verificare assets...');
const assets = [
  'public/logo.png',
  'public/doctor.png',
  'public/doctorI1.png',
  'public/doctorp.png',
];

assets.forEach(asset => {
  if (!fs.existsSync(path.join(process.cwd(), asset))) {
    warnings.push(`⚠️  ${asset} lipsește`);
  }
});

// 4. Verifică .gitignore
console.log('4. Verificare .gitignore...');
if (fs.existsSync(path.join(process.cwd(), '.gitignore'))) {
  const gitignore = fs.readFileSync(path.join(process.cwd(), '.gitignore'), 'utf-8');
  if (!gitignore.includes('.env')) {
    warnings.push('⚠️  .gitignore nu exclude .env files');
  }
}

// 5. Verifică package.json
console.log('5. Verificare package.json...');
const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8'));
if (!packageJson.scripts.build) {
  errors.push('❌ Script "build" lipsește din package.json');
}
if (!packageJson.scripts.start) {
  errors.push('❌ Script "start" lipsește din package.json');
}

// Rezultate
console.log('\n📊 Rezultate:\n');

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ Toate verificările au trecut! Proiectul este gata pentru deployment.\n');
  process.exit(0);
} else {
  if (errors.length > 0) {
    console.log('❌ Erori critice (trebuie rezolvate):');
    errors.forEach(err => console.log(`   ${err}`));
    console.log('');
  }
  
  if (warnings.length > 0) {
    console.log('⚠️  Avertismente (recomandat să fie rezolvate):');
    warnings.forEach(warn => console.log(`   ${warn}`));
    console.log('');
  }
  
  if (errors.length > 0) {
    console.log('❌ Deployment-ul va eșua dacă erorile nu sunt rezolvate!\n');
    process.exit(1);
  } else {
    console.log('⚠️  Deployment-ul ar putea funcționa, dar verifică avertismentele.\n');
    process.exit(0);
  }
}

