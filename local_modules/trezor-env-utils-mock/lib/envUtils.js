"use strict";
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
