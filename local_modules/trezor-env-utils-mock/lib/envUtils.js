"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDesktop = exports.isWeb = void 0;

// Fixed version that works with bundlers
const isWeb = () => false;
exports.isWeb = isWeb;

const isDesktop = () => false;
exports.isDesktop = isDesktop;
