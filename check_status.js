const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const empStatuses = await prisma.employee.groupBy({ by: ['status'], _count: true });
  console.log("Employees by status:", empStatuses);
}
main().catch(console.error).finally(() => prisma.$disconnect());