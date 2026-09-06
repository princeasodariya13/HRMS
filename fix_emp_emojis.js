const fs = require("fs");
let content = fs.readFileSync("app/dashboard/employee/page.tsx", "utf-8");
content = content.replace(/Welcome back, \{firstName\}! .*?<\/h1>/g, 'Welcome back, {firstName}! 👋</h1>');
fs.writeFileSync("app/dashboard/employee/page.tsx", content);
console.log("Employee Emojis fixed.");