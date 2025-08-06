import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Copy directory recursively
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Copy the public directory to dist/public (for when running from dist)
const sourceDir = path.join(__dirname, 'dist', 'public');
const destDir = path.join(__dirname, 'dist', 'dist', 'public');

if (fs.existsSync(sourceDir)) {
  console.log(`Copying ${sourceDir} to ${destDir}`);
  copyDir(sourceDir, destDir);
  console.log('Frontend files copied successfully!');
} else {
  console.log(`Source directory ${sourceDir} does not exist`);
}
