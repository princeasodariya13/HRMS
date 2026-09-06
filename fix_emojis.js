const fs = require("fs");
let content = fs.readFileSync("app/dashboard/admin/page.tsx", "utf-8");
content = content.replace(/<p className="font-medium text-white dark:text-\[\#111827\] mb-1">.*?Leave Analysis<\/p>/g, '<p className="font-medium text-white dark:text-[#111827] mb-1">🌴 Leave Analysis</p>');
content = content.replace(/<p className="font-medium text-white dark:text-\[\#111827\] mb-1">.*?Attendance Insights<\/p>/g, '<p className="font-medium text-white dark:text-[#111827] mb-1">📊 Attendance Insights</p>');
fs.writeFileSync("app/dashboard/admin/page.tsx", content);
console.log("Emojis fixed.");