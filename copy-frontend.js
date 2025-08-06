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

// Copy the public directory to multiple locations for different deployment contexts
const sourceDir = path.join(__dirname, 'dist', 'public');
const destDir1 = path.join(__dirname, 'dist', 'dist', 'public'); // For local testing
const destDir2 = path.join(__dirname, 'public'); // For DigitalOcean workspace root

if (fs.existsSync(sourceDir)) {
  // Copy to dist/dist/public (for when running from dist locally)
  console.log(`Copying ${sourceDir} to ${destDir1}`);
  copyDir(sourceDir, destDir1);
  
  // Copy to root public (for DigitalOcean deployment)
  console.log(`Copying ${sourceDir} to ${destDir2}`);
  copyDir(sourceDir, destDir2);
  
  console.log('Frontend files copied successfully to both locations!');
} else {
  console.log(`Source directory ${sourceDir} does not exist`);
}
