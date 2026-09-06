const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const emps = await prisma.employee.findMany({
    where: { deletedAt: { isSet: false } }
  });
  console.log("With isSet: false :", emps.length);
}
main().catch(console.error).finally(() => prisma.$disconnect());