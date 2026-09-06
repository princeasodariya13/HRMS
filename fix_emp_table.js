const fs = require("fs");
let content = fs.readFileSync("components/dashboard/tables/EmployeeTable.tsx", "utf-8");

// Fix duplicate dark:text- classes
content = content.replace(/dark:text-\[\#9CA3AF\] dark:text-\[\#6B7280\]/g, "dark:text-[#9CA3AF]");
content = content.replace(/dark:text-\[\#6B7280\] dark:text-\[\#9CA3AF\]/g, "dark:text-[#9CA3AF]");

// Fix bullet point encoding issue
content = content.replace(/\{emp\.email\} .*? \{emp\.code\}/g, "{emp.email} • {emp.code}");

fs.writeFileSync("components/dashboard/tables/EmployeeTable.tsx", content);
console.log("Fixed classes and encodings in EmployeeTable.tsx");