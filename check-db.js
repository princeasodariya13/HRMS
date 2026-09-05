const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const users = await prisma.user.findMany({ select: { id: true, email: true, role: true, companyId: true } });
  console.log("Users:", users);

  const employees = await prisma.employee.findMany({ select: { id: true, firstName: true, companyId: true, userId: true } });
  console.log("Employees:", employees);
}

run().catch(console.error).finally(() => prisma.$disconnect());
