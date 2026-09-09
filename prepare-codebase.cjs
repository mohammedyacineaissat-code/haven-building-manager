const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const exts = ['.ts', '.tsx', '.css', '.html', '.json', '.js'];
const outputFile = path.join(__dirname, 'building-manager-codebase.txt');

let outputContent = '';

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else {
            if (exts.includes(path.extname(fullPath))) {
                const relativePath = path.relative(__dirname, fullPath);
                outputContent += `\n\n--- ${relativePath} ---\n\n`;
                outputContent += fs.readFileSync(fullPath, 'utf8');
            }
        }
    }
}

// Include specific root files
const rootFiles = ['package.json', 'tailwind.config.js', 'tsconfig.json', 'vite.config.ts', 'index.html'];
for (const file of rootFiles) {
    if (fs.existsSync(path.join(__dirname, file))) {
        outputContent += `\n\n--- ${file} ---\n\n`;
        outputContent += fs.readFileSync(path.join(__dirname, file), 'utf8');
    }
}

walk(srcDir);
fs.writeFileSync(outputFile, outputContent);
console.log('Created building-manager-codebase.txt');
