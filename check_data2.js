const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const empCount = await prisma.employee.groupBy({ by: ['companyId'], _count: true });
  const users = await prisma.user.findMany({ select: { email: true, companyId: true, role: true }});
  
  console.log("Employees by Company:", empCount);
  console.log("Users:", users);
}
main().catch(console.error).finally(() => prisma.$disconnect());