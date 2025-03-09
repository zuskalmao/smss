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
  "license": "MIT"
};

// Create a mock envUtils.js file that fixes the syntax error
const envUtilsJs = `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDesktop = exports.isWeb = void 0;

// Fixed version that works with bundlers
const isWeb = () => false;
exports.isWeb = isWeb;

const isDesktop = () => false;
exports.isDesktop = isDesktop;
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

console.log('Created mock @trezor/env-utils package in local_modules/');
