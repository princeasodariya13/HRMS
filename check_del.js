const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const employees = await prisma.employee.findMany({ select: { id: true, firstName: true, companyId: true, deletedAt: true }});
  console.log("Employees:", employees);
}
main().catch(console.error).finally(() => prisma.$disconnect());