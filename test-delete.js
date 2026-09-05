const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const employee = await prisma.employee.findFirst();
  if (!employee) {
    console.log("No employee found in DB");
    return;
  }
  
  console.log("Found employee:", employee.id, employee.firstName);

  try {
    // Attempt the deletes that actions.ts does
    await prisma.payslip.deleteMany({ where: { employeeId: employee.id } })
    await prisma.attendance.deleteMany({ where: { employeeId: employee.id } })
    await prisma.leaveRequest.deleteMany({ where: { employeeId: employee.id } })
    await prisma.document.deleteMany({ where: { employeeId: employee.id } })
    await prisma.goal.deleteMany({ where: { employeeId: employee.id } })

    // Delete the Employee
    await prisma.employee.delete({
      where: { 
        id: employee.id
      }
    });

    console.log("SUCCESSFULLY DELETED EMPLOYEE");
  } catch (error) {
    console.error("ERROR CAUGHT:");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
