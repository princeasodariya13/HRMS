const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      if (dirPath.endsWith('.ts') || dirPath.endsWith('.tsx')) {
        callback(path.join(dir, f));
      }
    }
  });
}

const authOptionsImport = `import { getServerSession } from "next-auth";\nimport { authOptions } from "@/app/api/auth/[...nextauth]/route";`;

walkDir('./app', (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Pattern 1: import { createClient } from "@/utils/supabase/server"
  const importRegex = /import\s*{\s*createClient\s*}\s*from\s*['"]@\/utils\/supabase\/server['"];?/g;
  if (importRegex.test(content)) {
    content = content.replace(importRegex, authOptionsImport);
  }

  // Pattern 2: const supabase = await createClient()
  //            const { data: { user } } = await supabase.auth.getUser()
  const authCallRegex = /const\s+supabase\s*=\s*await\s+createClient\(\);?\s*(?:const\s+{\s*data:\s*{\s*user\s*(?:,\s*error)?\s*}\s*(?:,\s*error:\s*[a-zA-Z0-9_]+)?\s*}\s*=\s*await\s+supabase\.auth\.getUser\(\);?|const\s+{\s*data:\s*{\s*user\s*}\s*,\s*error\s*}\s*=\s*await\s+supabase\.auth\.getUser\(\);?|let\s+{\s*data:\s*{\s*user\s*}\s*}\s*=\s*await\s+supabase\.auth\.getUser\(\);?)/g;
  
  if (authCallRegex.test(content)) {
    content = content.replace(authCallRegex, `const session = await getServerSession(authOptions);\n    const user = session?.user;`);
  }

  // Fallback for actions where they might do it differently:
  const authCallFallback1 = /const\s+supabase\s*=\s*await\s+createClient\(\)\s*const\s+{\s*data:\s*{\s*user\s*}\s*}\s*=\s*await\s+supabase\.auth\.getUser\(\)/g;
  if (authCallFallback1.test(content)) {
    content = content.replace(authCallFallback1, `const session = await getServerSession(authOptions);\n    const user = session?.user;`);
  }

  // Ensure `user.id` works (NextAuth user has `.id`)
  
  // Replace auth-actions sign in logic (we'll just rewrite auth-actions completely)
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
});
