const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const emp = await prisma.employee.findFirst({ where: { firstName: 'Maharshi' } });
  if (emp) {
    const start = new Date();
    start.setDate(start.getDate() + 2);
    const end = new Date(start);
    end.setDate(start.getDate() + 4);
    await prisma.leaveRequest.create({
      data: {
        employeeId: emp.id,
        companyId: emp.companyId,
        startDate: start,
        endDate: end,
        totalDays: 3,
        status: 'PENDING',
        reason: 'Family vacation'
      }
    });
    console.log("Created leave for Maharshi");
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());