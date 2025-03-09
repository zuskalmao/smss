import fs from 'fs';
import path from 'path';

// Create directories
const mockDir = path.resolve('./local_modules/trezor-env-utils-mock');
const libDir = path.resolve('./local_modules/trezor-env-utils-mock/lib');

// Ensure directories exist
if (!fs.existsSync('./local_modules')) {
  fs.mkdirSync('./local_modules', { recursive: true });
}
if (!fs.existsSync(mockDir)) {
  fs.mkdirSync(mockDir, { recursive: true });
}
if (!fs.existsSync(libDir)) {
  fs.mkdirSync(libDir, { recursive: true });
}

// Create package.json for mock package
const packageJson = {
  "name": "@trezor/env-utils",
  "version": "1.0.0",
  "description": "Mock package to fix build issues",
  "main": "lib/envUtils.js",
  "module": "lib/envUtils.js",
  "exports": {
    ".": {
      "require": "./lib/envUtils.js",
      "import": "./lib/envUtils.js",
      "default": "./lib/envUtils.js"
    }
  },
  "license": "MIT",
  "sideEffects": false
};

// Create a mock envUtils.js file that fixes the syntax error
const envUtilsJs = `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDesktop = exports.isWeb = exports.default = void 0;

// Fixed version that works with bundlers
const isWeb = () => false;
exports.isWeb = isWeb;

const isDesktop = () => false;
exports.isDesktop = isDesktop;

// Export a default object as well for ESM/CJS compatibility
const defaultExport = {
  isWeb,
  isDesktop
};
exports.default = defaultExport;

// Add compatibility for different import styles
// This prevents errors regardless of how the module is imported
if (typeof module !== 'undefined') {
  module.exports = Object.assign(module.exports, {
    isWeb,
    isDesktop,
    default: defaultExport
  });
}
`;

// Create an index.js file for better module resolution
const indexJs = `// Re-export from lib for better module compatibility
module.exports = require('./lib/envUtils.js');
`;

// Write files
fs.writeFileSync(
  path.join(mockDir, 'package.json'),
  JSON.stringify(packageJson, null, 2)
);

fs.writeFileSync(
  path.join(libDir, 'envUtils.js'),
  envUtilsJs
);

fs.writeFileSync(
  path.join(mockDir, 'index.js'),
  indexJs
);

console.log('Created mock @trezor/env-utils package in local_modules/');
