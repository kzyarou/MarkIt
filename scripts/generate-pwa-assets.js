#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🎨 Generating PWA assets...');

// Create scripts directory if it doesn't exist
const scriptsDir = path.join(__dirname);
if (!fs.existsSync(scriptsDir)) {
  fs.mkdirSync(scriptsDir, { recursive: true });
}

// Function to create a simple PNG-like file (placeholder)
function createPlaceholderPNG(size, filename) {
  // This is a placeholder - in production you'd use a proper image processing library
  // like sharp or jimp to convert SVG to PNG
  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size/8}" fill="#2563eb"/>
  <path d="M${size/2} ${size/4}C${size*0.35} ${size/4} ${size*0.24} ${size*0.35} ${size*0.24} ${size/2}C${size*0.24} ${size*0.65} ${size*0.35} ${size*0.75} ${size/2} ${size*0.75}C${size*0.65} ${size*0.75} ${size*0.76} ${size*0.65} ${size*0.76} ${size/2}C${size*0.76} ${size*0.35} ${size*0.65} ${size/4} ${size/2} ${size/4}Z" fill="white"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size/8}" fill="white"/>
</svg>`;
  
  const publicDir = path.join(__dirname, '..', 'public');
  const filePath = path.join(publicDir, filename);
  
  fs.writeFileSync(filePath, svgContent);
  console.log(`✅ Created ${filename}`);
}

// Generate PWA assets
try {
  // Create 192x192 icon
  createPlaceholderPNG(192, 'pwa-192x192.png');
  
  // Create 512x512 icon
  createPlaceholderPNG(512, 'pwa-512x512.png');
  
  // Create favicon
  createPlaceholderPNG(32, 'favicon.ico');
  
  // Create apple touch icon
  createPlaceholderPNG(180, 'apple-touch-icon.png');
  
  console.log('🎉 PWA assets generated successfully!');
  console.log('📝 Note: These are SVG placeholders. For production, convert to proper PNG/ICO files.');
  
} catch (error) {
  console.error('❌ Error generating PWA assets:', error);
  process.exit(1);
} 