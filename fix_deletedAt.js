const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const result1 = await prisma.employee.updateMany({ data: { deletedAt: null } });
  const result2 = await prisma.user.updateMany({ data: { deletedAt: null } });
  const result3 = await prisma.company.updateMany({ data: { deletedAt: null } });
  console.log("Updated:", result1, result2, result3);
}
main().catch(console.error).finally(() => prisma.$disconnect());