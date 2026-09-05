const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, 'app', 'dashboard');

function replaceInFile(filePath) {
  const stat = fs.statSync(filePath);
  if (stat.isDirectory()) {
    const files = fs.readdirSync(filePath);
    files.forEach(file => replaceInFile(path.join(filePath, file)));
  } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    // Regex to match console.error(..., error);
    // Replace with console.warn(..., error.message || "Connection failed");
    if (content.includes('console.error("Prisma Database connection failed')) {
      content = content.replace(/console\.error\("Prisma Database connection failed(.*?)",\s*error\);/g, 'console.warn("Prisma Database connection failed$1. Next.js Dev overlay suppressed.");');
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
}

replaceInFile(directory);
console.log('Done!');
