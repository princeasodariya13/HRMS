const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const isSuperAdmin = true;
  const emps = await prisma.employee.findMany({
    where: { deletedAt: null },
    include: { _count: { select: { contracts: true } } }
  });
  console.log("With _count:", emps.length);
}
main().catch(console.error).finally(() => prisma.$disconnect());