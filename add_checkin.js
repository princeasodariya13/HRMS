const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const emp = await prisma.employee.findFirst({ where: { firstName: 'Vijay' } });
  if (emp) {
    const today = new Date();
    await prisma.attendance.create({
      data: {
        employeeId: emp.id,
        date: today,
        checkInTime: new Date(today.setHours(9, 0, 0, 0)),
        status: 'PRESENT',
        notes: 'Checked in via automated fix script'
      }
    });
    console.log("Created check-in for Vijay");
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());