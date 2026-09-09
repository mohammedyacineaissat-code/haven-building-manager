const fs = require('fs');
const path = require('path');
const canvas = require('canvas');

if (!fs.existsSync('assets')) {
  fs.mkdirSync('assets');
}

const { createCanvas } = canvas;

// Generate Icon
const iconCanvas = createCanvas(1024, 1024);
const iconCtx = iconCanvas.getContext('2d');
iconCtx.fillStyle = '#2563eb'; // blue-600
iconCtx.fillRect(0, 0, 1024, 1024);
iconCtx.fillStyle = '#ffffff';
iconCtx.font = 'bold 200px sans-serif';
iconCtx.textAlign = 'center';
iconCtx.textBaseline = 'middle';
iconCtx.fillText('Haven', 512, 512);
fs.writeFileSync('assets/icon.png', iconCanvas.toBuffer('image/png'));

// Generate Splash
const splashCanvas = createCanvas(2732, 2732);
const splashCtx = splashCanvas.getContext('2d');
splashCtx.fillStyle = '#2563eb'; 
splashCtx.fillRect(0, 0, 2732, 2732);
splashCtx.fillStyle = '#ffffff';
splashCtx.font = 'bold 300px sans-serif';
splashCtx.textAlign = 'center';
splashCtx.textBaseline = 'middle';
splashCtx.fillText('Haven', 1366, 1366);
fs.writeFileSync('assets/splash.png', splashCanvas.toBuffer('image/png'));
