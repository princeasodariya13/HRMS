const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const companyId = '4d8811f6-c7ee-461d-b68c-02b8287ab739';
  const isSuperAdmin = true;
  try {
    const rawEmployees = await prisma.employee.findMany({
      where: isSuperAdmin ? { deletedAt: null } : { companyId, deletedAt: null },
      include: { 
        department: true
      }
    });
    console.log("With Dept:", rawEmployees.length);
  } catch (e) {
    console.error("Error with Dept:", e);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());