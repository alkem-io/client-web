#!/usr/bin/env node

/**
 * Translation Namespace Management Utility
 * 
 * This script helps manage the split translation namespace files.
 * It can validate, merge, and synchronize namespace files.
 */

const fs = require('fs');
const path = require('path');

const I18N_DIR = path.join(__dirname, '..', 'src', 'core', 'i18n');
const SUPPORTED_LANGUAGES = ['en', 'es', 'nl', 'bg', 'de', 'fr', 'pt', 'ach'];

// Import namespace configuration
const NAMESPACES = [
  'common', 'authentication', 'navigation', 'messaging',
  'spaces', 'community', 'collaboration', 'innovation', 'templates', 'credentials',
  'components', 'forms', 'dialogs',
  'calendar', 'operations', 'pages', 'context',
  'virtualContributor', 'chatbot', 'platform'
];

/**
 * Validates that all namespace files exist for all languages
 */
function validateNamespaceFiles() {
  console.log('🔍 Validating namespace files...\n');
  
  let hasErrors = false;
  
  SUPPORTED_LANGUAGES.forEach(lang => {
    const langDir = path.join(I18N_DIR, lang);
    const namespacesDir = path.join(langDir, 'namespaces');
    
    console.log(`Checking ${lang}:`);
    
    if (!fs.existsSync(namespacesDir)) {
      console.log(`  ❌ Missing namespaces directory`);
      hasErrors = true;
      return;
    }
    
    NAMESPACES.forEach(namespace => {
      const filePath = path.join(namespacesDir, `${namespace}.json`);
      if (!fs.existsSync(filePath)) {
        console.log(`  ❌ Missing ${namespace}.json`);
        hasErrors = true;
      } else {
        try {
          JSON.parse(fs.readFileSync(filePath, 'utf8'));
          console.log(`  ✅ ${namespace}.json`);
        } catch (error) {
          console.log(`  ❌ Invalid JSON in ${namespace}.json: ${error.message}`);
          hasErrors = true;
        }
      }
    });
    console.log('');
  });
  
  if (hasErrors) {
    console.log('❌ Validation failed. Please fix the issues above.');
    process.exit(1);
  } else {
    console.log('✅ All namespace files are valid!');
  }
}

/**
 * Shows statistics about the translation files
 */
function showStats() {
  console.log('📊 Translation Statistics\n');
  
  SUPPORTED_LANGUAGES.forEach(lang => {
    const namespacesDir = path.join(I18N_DIR, lang, 'namespaces');
    
    if (!fs.existsSync(namespacesDir)) {
      console.log(`${lang}: No namespaces directory`);
      return;
    }
    
    console.log(`${lang.toUpperCase()}:`);
    let totalKeys = 0;
    let totalSize = 0;
    
    NAMESPACES.forEach(namespace => {
      const filePath = path.join(namespacesDir, `${namespace}.json`);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        const keyCount = Object.keys(data).length;
        const size = content.length;
        
        totalKeys += keyCount;
        totalSize += size;
        
        console.log(`  ${namespace}: ${keyCount} keys, ${(size / 1024).toFixed(1)}KB`);
      }
    });
    
    console.log(`  TOTAL: ${totalKeys} keys, ${(totalSize / 1024).toFixed(1)}KB\n`);
  });
}

// Command line interface
const command = process.argv[2];

switch (command) {
  case 'validate':
    validateNamespaceFiles();
    break;
  
  case 'stats':
    showStats();
    break;
  
  default:
    console.log(`
Translation Namespace Management Utility

Commands:
  validate                    - Validate all namespace files
  stats                      - Show translation statistics

Examples:
  node scripts/i18n-utils.js validate
  node scripts/i18n-utils.js stats
`);
}