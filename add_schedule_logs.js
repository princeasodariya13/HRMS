const fs = require("fs");
let content = fs.readFileSync("app/dashboard/admin/schedules/actions.ts", "utf-8");

if (!content.includes("logAudit")) {
  content = content.replace("import { authOptions } from \"@/app/api/auth/[...nextauth]/route\";", "import { authOptions } from \"@/app/api/auth/[...nextauth]/route\";\nimport { logAudit } from '@/lib/auditLog';");
  
  content = content.replace(
    /const schedule = await prisma\.workingSchedule\.create\(\{[\s\S]*?\}\);|await prisma\.workingSchedule\.create\(\{[\s\S]*?\}\);/g,
    `const schedule = await prisma.workingSchedule.create({
      data: {
        companyId: companyId!,
        name: data.name,
        type: data.type,
        weeklyHours,
        lines: { create: data.lines }
      }
    });
    
    await logAudit({
      companyId: companyId!,
      userId: user.id,
      module: 'SETTINGS', // Re-using SETTINGS module for schedules
      action: 'CREATE',
      recordId: schedule.id,
      oldData: null,
      newData: { name: schedule.name, type: schedule.type, weeklyHours },
    });`
  );
  
  content = content.replace(
    /await prisma\.workingSchedule\.update\(\{[\s\S]*?\}\);/g,
    `await prisma.workingSchedule.update({
      where: { id },
      data: { name: data.name, type: data.type, weeklyHours, lines: { create: data.lines } }
    });
    
    await logAudit({
      companyId: existing.companyId,
      userId: user.id,
      module: 'SETTINGS',
      action: 'UPDATE',
      recordId: id,
      oldData: { name: existing.name, type: existing.type },
      newData: { name: data.name, type: data.type, weeklyHours },
    });`
  );

  content = content.replace(
    /await prisma\.workingSchedule\.delete\(\{ where: \{ id \} \}\);/g,
    `await prisma.workingSchedule.delete({ where: { id } });
    
    await logAudit({
      companyId: existing.companyId,
      userId: user.id,
      module: 'SETTINGS',
      action: 'DELETE',
      recordId: id,
      oldData: { name: existing.name, type: existing.type },
      newData: null,
    });`
  );
  
  fs.writeFileSync("app/dashboard/admin/schedules/actions.ts", content);
  console.log("Added audit logs to schedules actions");
} else {
  console.log("Audit logs already present");
}