const fs = require('fs');
const path = require('path');

const dirsToScan = [
  path.join(__dirname, 'app/dashboard'),
  path.join(__dirname, 'components/dashboard')
];

const excludeFiles = [
  'Sidebar.tsx',
  'TopNavbar.tsx',
  'SettingsClient.tsx'
];

function scanAndReplace(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanAndReplace(fullPath);
    } else if (fullPath.endsWith('.tsx') && !excludeFiles.includes(path.basename(fullPath))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      const replacements = [
        { regex: /bg-white(?!\s+dark:bg-)/g, replacement: 'bg-white dark:bg-[#0F172A]' },
        { regex: /border-\[\#E5E7EB\](?!\s+dark:border-)/g, replacement: 'border-[#E5E7EB] dark:border-[#1E293B]' },
        { regex: /text-\[\#111827\](?!\s+dark:text-)/g, replacement: 'text-[#111827] dark:text-[#F3F4F6]' },
        { regex: /text-\[\#6B7280\](?!\s+dark:text-)/g, replacement: 'text-[#6B7280] dark:text-[#9CA3AF]' },
        { regex: /bg-\[\#F8FAFC\](?!\s+dark:bg-)/g, replacement: 'bg-[#F8FAFC] dark:bg-[#1E293B]' },
        { regex: /bg-\[\#F1F5F9\](?!\s+dark:bg-)/g, replacement: 'bg-[#F1F5F9] dark:bg-[#1E293B]' },
        { regex: /hover:bg-\[\#F3F4F6\](?!\s+dark:hover:bg-)/g, replacement: 'hover:bg-[#F3F4F6] dark:hover:bg-[#1E293B]' },
        { regex: /hover:bg-\[\#F8FAFC\](?!\s+dark:hover:bg-)/g, replacement: 'hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/50' },
        { regex: /bg-\[\#F3F4F6\](?!\s+dark:bg-)/g, replacement: 'bg-[#F3F4F6] dark:bg-[#1E293B]' },
        { regex: /bg-\[\#111827\](?!\s+dark:bg-)/g, replacement: 'bg-[#111827] dark:bg-[#F3F4F6]' },
        { regex: /text-white(?!\s+dark:text-)/g, replacement: 'text-white dark:text-[#111827]' },
        { regex: /hover:bg-\[\#1f2937\](?!\s+dark:hover:bg-)/g, replacement: 'hover:bg-[#1f2937] dark:hover:bg-[#E5E7EB]' },
        { regex: /divide-\[\#E5E7EB\](?!\s+dark:divide-)/g, replacement: 'divide-[#E5E7EB] dark:divide-[#1E293B]' },
        { regex: /text-\[\#9CA3AF\](?!\s+dark:text-)/g, replacement: 'text-[#9CA3AF] dark:text-[#6B7280]' }
      ];

      let originalContent = content;
      for (const r of replacements) {
        content = content.replace(r.regex, r.replacement);
      }

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${path.basename(fullPath)}`);
      }
    }
  }
}

for (const dir of dirsToScan) {
  if (fs.existsSync(dir)) {
    scanAndReplace(dir);
  }
}
