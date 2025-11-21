#!/usr/bin/env node

/**
 * INDRA Mobile - Setup Verification Script
 * Checks if all dependencies and configurations are correct
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.cyan}${msg}${colors.reset}`),
};

let errors = 0;
let warnings = 0;

// Check Node.js version
function checkNodeVersion() {
  log.section('Checking Node.js...');
  try {
    const version = process.version;
    const major = parseInt(version.slice(1).split('.')[0]);
    
    if (major >= 18) {
      log.success(`Node.js ${version} (✓ >= 18.0.0)`);
    } else {
      log.error(`Node.js ${version} (✗ < 18.0.0)`);
      log.warning('Please upgrade to Node.js 18 or higher');
      errors++;
    }
  } catch (error) {
    log.error('Failed to check Node.js version');
    errors++;
  }
}

// Check npm
function checkNpm() {
  log.section('Checking npm...');
  try {
    const version = execSync('npm -v', { encoding: 'utf8' }).trim();
    log.success(`npm ${version}`);
  } catch (error) {
    log.error('npm not found');
    errors++;
  }
}

// Check Expo CLI
function checkExpoCLI() {
  log.section('Checking Expo CLI...');
  try {
    const version = execSync('expo --version', { encoding: 'utf8' }).trim();
    log.success(`Expo CLI ${version}`);
  } catch (error) {
    log.warning('Expo CLI not found globally');
    log.info('Install with: npm install -g expo-cli');
    warnings++;
  }
}

// Check EAS CLI
function checkEASCLI() {
  log.section('Checking EAS CLI...');
  try {
    const version = execSync('eas --version', { encoding: 'utf8' }).trim();
    log.success(`EAS CLI ${version}`);
  } catch (error) {
    log.warning('EAS CLI not found globally');
    log.info('Install with: npm install -g eas-cli');
    warnings++;
  }
}

// Check node_modules
function checkNodeModules() {
  log.section('Checking dependencies...');
  
  if (fs.existsSync('node_modules')) {
    log.success('node_modules directory exists');
    
    // Check critical dependencies
    const criticalDeps = [
      'react',
      'react-native',
      'expo',
      'expo-sqlite',
      'react-native-reanimated',
      'zustand',
      '@tanstack/react-query',
    ];
    
    criticalDeps.forEach((dep) => {
      const depPath = path.join('node_modules', dep);
      if (fs.existsSync(depPath)) {
        log.success(`${dep} installed`);
      } else {
        log.error(`${dep} not found`);
        errors++;
      }
    });
  } else {
    log.error('node_modules not found');
    log.info('Run: npm install');
    errors++;
  }
}

// Check .env file
function checkEnvFile() {
  log.section('Checking environment configuration...');
  
  if (fs.existsSync('.env')) {
    log.success('.env file exists');
    
    const envContent = fs.readFileSync('.env', 'utf8');
    
    // Check for required variables
    const requiredVars = ['API_BASE_URL', 'WEBSOCKET_URL'];
    requiredVars.forEach((varName) => {
      if (envContent.includes(varName)) {
        log.success(`${varName} configured`);
      } else {
        log.warning(`${varName} not found in .env`);
        warnings++;
      }
    });
    
    // Check if still using example IP
    if (envContent.includes('192.168.1.100')) {
      log.warning('Still using example IP address (192.168.1.100)');
      log.info('Update .env with your actual IP address');
      warnings++;
    }
  } else {
    log.warning('.env file not found');
    log.info('Copy .env.example to .env and configure');
    warnings++;
  }
}

// Check app.json
function checkAppJson() {
  log.section('Checking app configuration...');
  
  if (fs.existsSync('app.json')) {
    log.success('app.json exists');
    
    try {
      const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));
      
      if (appJson.expo) {
        log.success('Expo configuration found');
        
        // Check project ID
        if (appJson.expo.extra?.eas?.projectId) {
          log.success('EAS project ID configured');
        } else if (appJson.expo.extra?.eas?.projectId === 'your-project-id-here') {
          log.warning('EAS project ID not configured');
          log.info('Run: eas init');
          warnings++;
        }
      }
    } catch (error) {
      log.error('Failed to parse app.json');
      errors++;
    }
  } else {
    log.error('app.json not found');
    errors++;
  }
}

// Check babel.config.js
function checkBabelConfig() {
  log.section('Checking Babel configuration...');
  
  if (fs.existsSync('babel.config.js')) {
    log.success('babel.config.js exists');
    
    const babelContent = fs.readFileSync('babel.config.js', 'utf8');
    
    if (babelContent.includes('react-native-reanimated/plugin')) {
      log.success('Reanimated plugin configured');
      
      // Check if it's the last plugin
      const pluginsMatch = babelContent.match(/plugins:\s*\[([\s\S]*?)\]/);
      if (pluginsMatch) {
        const plugins = pluginsMatch[1];
        const lastPlugin = plugins.trim().split(',').pop().trim();
        
        if (lastPlugin.includes('react-native-reanimated/plugin')) {
          log.success('Reanimated plugin is last (correct)');
        } else {
          log.warning('Reanimated plugin should be the last plugin');
          warnings++;
        }
      }
    } else {
      log.error('Reanimated plugin not found in babel.config.js');
      errors++;
    }
  } else {
    log.error('babel.config.js not found');
    errors++;
  }
}

// Check assets directory
function checkAssets() {
  log.section('Checking assets...');
  
  if (fs.existsSync('assets')) {
    log.success('assets directory exists');
  } else {
    log.warning('assets directory not found');
    log.info('Create with: mkdir assets');
    warnings++;
  }
}

// Check TypeScript configuration
function checkTypeScript() {
  log.section('Checking TypeScript...');
  
  if (fs.existsSync('tsconfig.json')) {
    log.success('tsconfig.json exists');
  } else {
    log.error('tsconfig.json not found');
    errors++;
  }
}

// Check server files
function checkServer() {
  log.section('Checking mock server...');
  
  if (fs.existsSync('server.js')) {
    log.success('server.js exists');
  } else {
    log.error('server.js not found');
    errors++;
  }
}

// Check documentation
function checkDocumentation() {
  log.section('Checking documentation...');
  
  const docs = [
    'README.md',
    'QUICKSTART.md',
    'SETUP.md',
    'ARCHITECTURE.md',
    'CONTRIBUTING.md',
  ];
  
  docs.forEach((doc) => {
    if (fs.existsSync(doc)) {
      log.success(`${doc} exists`);
    } else {
      log.warning(`${doc} not found`);
      warnings++;
    }
  });
}

// Check source structure
function checkSourceStructure() {
  log.section('Checking source structure...');
  
  const requiredDirs = [
    'src',
    'src/api',
    'src/components',
    'src/hooks',
    'src/libs',
    'src/navigation',
    'src/screens',
    'src/services',
    'src/store',
  ];
  
  requiredDirs.forEach((dir) => {
    if (fs.existsSync(dir)) {
      log.success(`${dir}/ exists`);
    } else {
      log.error(`${dir}/ not found`);
      errors++;
    }
  });
}

// Main execution
function main() {
  console.log('\n' + '='.repeat(50));
  console.log('INDRA Mobile - Setup Verification');
  console.log('='.repeat(50));
  
  checkNodeVersion();
  checkNpm();
  checkExpoCLI();
  checkEASCLI();
  checkNodeModules();
  checkEnvFile();
  checkAppJson();
  checkBabelConfig();
  checkAssets();
  checkTypeScript();
  checkServer();
  checkDocumentation();
  checkSourceStructure();
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('Summary');
  console.log('='.repeat(50));
  
  if (errors === 0 && warnings === 0) {
    log.success('All checks passed! ✨');
    console.log('\nYou\'re ready to start development!');
    console.log('\nNext steps:');
    console.log('1. Start backend: node server.js');
    console.log('2. Start Expo: npm start');
    console.log('3. Scan QR code with Expo Go');
  } else {
    if (errors > 0) {
      log.error(`${errors} error(s) found`);
    }
    if (warnings > 0) {
      log.warning(`${warnings} warning(s) found`);
    }
    
    console.log('\nPlease fix the issues above before continuing.');
    
    if (errors > 0) {
      process.exit(1);
    }
  }
  
  console.log('\n');
}

// Run verification
main();
