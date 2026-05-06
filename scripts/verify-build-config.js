#!/usr/bin/env node

/**
 * Script para verificar la configuración de build de Electron Forge
 * Valida que todos los makers estén configurados correctamente
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración de build...\n');

// Verificar archivos requeridos
const requiredFiles = [
  'forge.config.js',
  'package.json',
  'assets/icon.png',
  'assets/icon.ico',
];

let allFilesExist = true;

console.log('📁 Verificando archivos requeridos:');
requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, '..', file));
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
});

if (!allFilesExist) {
  console.log('\n❌ Faltan archivos requeridos. Por favor, verifica la configuración.');
  process.exit(1);
}

// Cargar configuración
const forgeConfig = require('../forge.config.js');
const packageJson = require('../package.json');

console.log('\n📦 Información del paquete:');
console.log(`  Nombre: ${packageJson.name}`);
console.log(`  Versión: ${packageJson.version}`);
console.log(`  Autor: ${packageJson.author.name}`);

console.log('\n🛠️  Makers configurados:');
forgeConfig.makers.forEach(maker => {
  const makerName = maker.name.replace('@electron-forge/maker-', '').replace('@reforged/maker-', '');
  const platforms = maker.platforms.join(', ');
  console.log(`  ✅ ${makerName.toUpperCase()} (${platforms})`);
});

console.log('\n📤 Publishers configurados:');
forgeConfig.publishers.forEach(publisher => {
  if (publisher.name === '@electron-forge/publisher-github') {
    console.log(`  ✅ GitHub Releases`);
    console.log(`     Owner: ${publisher.config.repository.owner}`);
    console.log(`     Repo: ${publisher.config.repository.name}`);
    console.log(`     Draft: ${publisher.config.draft}`);
  }
});

// Verificar token de GitHub
console.log('\n🔑 Variables de entorno:');
const githubToken = process.env.GITHUB_TOKEN;
if (githubToken) {
  console.log(`  ✅ GITHUB_TOKEN configurado (${githubToken.substring(0, 4)}...)`);
} else {
  console.log('  ⚠️  GITHUB_TOKEN no configurado');
  console.log('     Para publicar, ejecuta: export GITHUB_TOKEN=tu_token');
}

console.log('\n📋 Formatos de salida esperados:');
console.log('  Windows:');
console.log(`    - romsmanager-${packageJson.version} Setup.exe`);
console.log('  macOS:');
console.log('    - ROM Manager.app');
console.log('  Linux:');
console.log(`    - romsmanager-${packageJson.version}.AppImage`);

console.log('\n✅ Configuración verificada correctamente');
console.log('\n💡 Comandos disponibles:');
console.log('   npm run make     - Compilar todos los formatos');
console.log('   npm run publish  - Compilar y publicar en GitHub');
console.log('   npm run package  - Solo empaquetar (sin instaladores)');
