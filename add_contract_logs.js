const fs = require("fs");
let content = fs.readFileSync("app/dashboard/admin/contracts/actions.ts", "utf-8");

if (!content.includes("logAudit")) {
  content = content.replace("import { ContractStatus } from '@prisma/client'", "import { ContractStatus } from '@prisma/client'\nimport { logAudit } from '@/lib/auditLog'");
  
  // createContract
  content = content.replace(
    /const contract = await prisma\.contract\.create\(\{[\s\S]*?\}\);/,
    `$&
    await logAudit({
      companyId: employee.companyId,
      userId: user.id,
      module: 'CONTRACT',
      action: 'CREATE',
      recordId: contract.id,
      oldData: null,
      newData: { status: data.status, wage: data.wage, startDate: data.startDate },
    });`
  );

  // updateContract
  content = content.replace(
    /await prisma\.contract\.update\(\{[\s\S]*?\}\);/,
    `$&
    await logAudit({
      companyId: existingContract.companyId,
      userId: user.id,
      module: 'CONTRACT',
      action: 'UPDATE',
      recordId: id,
      oldData: { status: existingContract.status, wage: existingContract.wage },
      newData: { status: data.status, wage: data.wage },
    });`
  );

  // deleteContract
  content = content.replace(
    /await prisma\.contract\.delete\(\{ where: \{ id \} \}\);/,
    `$&
    await logAudit({
      companyId: existingContract.companyId,
      userId: user.id,
      module: 'CONTRACT',
      action: 'DELETE',
      recordId: id,
      oldData: { status: existingContract.status, wage: existingContract.wage },
      newData: null,
    });`
  );
  
  fs.writeFileSync("app/dashboard/admin/contracts/actions.ts", content);
  console.log("Added audit logs to contracts actions");
} else {
  console.log("Audit logs already present");
}