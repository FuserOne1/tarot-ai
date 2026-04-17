// Run: node scripts/generate-icons.js
// Requires: npm install canvas (optional, for real PNG generation)
// For now, copies a placeholder. Replace icon-192.png and icon-512.png with real icons.

const fs = require("fs");
const path = require("path");

// Simple purple square PNG (1x1 pixel scaled) as placeholder
// In production, use a real 192x192 and 512x512 PNG
const svgContent = fs.readFileSync(path.join(__dirname, "../public/icon.svg"), "utf8");
console.log("SVG icon exists. Please convert icon.svg to icon-192.png and icon-512.png");
console.log("You can use: https://cloudconvert.com/svg-to-png or any image tool");
