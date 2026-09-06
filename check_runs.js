const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const runs = await prisma.payrollRun.findMany({ select: { companyId: true } });
  console.log("Payroll Runs:", runs);
}
main().catch(console.error).finally(() => prisma.$disconnect());