#!/usr/bin/env node

/**
 * Note-Taking App - Installation Verification Script
 * Verifies that all project files are in place and configured correctly
 * 
 * Usage: node verify-installation.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n📋 Note-Taking App - Installation Verification\n');
console.log('=' .repeat(60) + '\n');

let passed = 0;
let failed = 0;
let warnings = 0;

const checkboxPass = '✅';
const checkboxFail = '❌';
const checkboxWarn = '⚠️ ';

function checkFile(filePath, description) {
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    console.log(`${checkboxPass} ${description}`);
    passed++;
    return true;
  } else {
    console.log(`${checkboxFail} ${description} (${filePath})`);
    failed++;
    return false;
  }
}

function checkDirectory(dirPath, description) {
  const fullPath = path.join(__dirname, dirPath);
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
    console.log(`${checkboxPass} ${description}`);
    passed++;
    return true;
  } else {
    console.log(`${checkboxFail} ${description} (${dirPath})`);
    failed++;
    return false;
  }
}

function checkFileSize(filePath, description, minSize = 100) {
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    if (stats.size >= minSize) {
      console.log(`${checkboxPass} ${description} (${formatBytes(stats.size)})`);
      passed++;
      return true;
    } else {
      console.log(`${checkboxWarn} ${description} (File too small: ${formatBytes(stats.size)})`);
      warnings++;
      return true;
    }
  } else {
    console.log(`${checkboxFail} ${description} (Not found)`);
    failed++;
    return false;
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Backend Structure
console.log('Backend Structure:');
console.log('-' .repeat(60));
checkDirectory('backend', 'Backend directory');
checkDirectory('backend/db', 'Database directory');
checkDirectory('backend/middleware', 'Middleware directory');
checkDirectory('backend/routes', 'Routes directory');
checkDirectory('backend/controllers', 'Controllers directory');
console.log();

// Backend Configuration
console.log('Backend Configuration:');
console.log('-' .repeat(60));
checkFile('backend/package.json', 'package.json');
checkFile('backend/.env.example', '.env.example');
checkFile('backend/.gitignore', '.gitignore');
console.log();

// Backend Files
console.log('Backend Files:');
console.log('-' .repeat(60));
checkFileSize('backend/server.js', 'server.js', 500);
checkFileSize('backend/db/database.js', 'database.js', 500);
checkFileSize('backend/middleware/auth.js', 'auth.js', 300);
checkFileSize('backend/middleware/validation.js', 'validation.js', 500);
checkFileSize('backend/routes/authRoutes.js', 'authRoutes.js', 200);
checkFileSize('backend/routes/notesRoutes.js', 'notesRoutes.js', 300);
checkFileSize('backend/controllers/authController.js', 'authController.js', 800);
checkFileSize('backend/controllers/notesController.js', 'notesController.js', 1000);
console.log();

// Frontend Structure
console.log('Frontend Structure:');
console.log('-' .repeat(60));
checkDirectory('frontend', 'Frontend directory');
checkDirectory('frontend/css', 'CSS directory');
checkDirectory('frontend/js', 'JavaScript directory');
console.log();

// Frontend Files
console.log('Frontend Files:');
console.log('-' .repeat(60));
checkFileSize('frontend/index.html', 'index.html', 1000);
checkFileSize('frontend/css/styles.css', 'styles.css', 2000);
checkFileSize('frontend/js/app.js', 'app.js', 2000);
console.log();

// Documentation Files
console.log('Documentation:');
console.log('-' .repeat(60));
checkFileSize('README.md', 'README.md', 3000);
checkFileSize('QUICKSTART.md', 'QUICKSTART.md', 1000);
checkFileSize('PROJECT_SUMMARY.md', 'PROJECT_SUMMARY.md', 2000);
checkFileSize('CONFIGURATION.md', 'CONFIGURATION.md', 1500);
checkFileSize('TESTING.md', 'TESTING.md', 2000);
checkFileSize('DEPLOYMENT.md', 'DEPLOYMENT.md', 3000);
checkFileSize('DIRECTORY_STRUCTURE.md', 'DIRECTORY_STRUCTURE.md', 1500);
checkFileSize('DOCUMENTATION_INDEX.md', 'DOCUMENTATION_INDEX.md', 1000);
console.log();

// Root Configuration
console.log('Root Configuration:');
console.log('-' .repeat(60));
checkFile('.gitignore', '.gitignore (root)');
console.log();

// Summary
console.log('=' .repeat(60));
console.log('\n📊 Verification Summary:\n');
console.log(`  ${checkboxPass} Passed: ${passed}`);
console.log(`  ${checkboxWarn} Warnings: ${warnings}`);
console.log(`  ${checkboxFail} Failed: ${failed}`);
console.log();

// Next Steps
console.log('=' .repeat(60));
if (failed === 0) {
  console.log('\n✅ Installation verified successfully!\n');
  console.log('Next steps:');
  console.log('  1. cd backend && npm install');
  console.log('  2. cp .env.example .env');
  console.log('  3. npm start');
  console.log('  4. In another terminal: cd frontend');
  console.log('  5. python -m http.server 8000');
  console.log('  6. Open http://localhost:8000 in your browser\n');
  process.exit(0);
} else {
  console.log(`\n❌ Installation verification failed!\n`);
  console.log('Please ensure all project files are present.');
  console.log('See README.md for complete installation instructions.\n');
  process.exit(1);
}
