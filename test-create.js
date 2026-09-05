const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const dbUser = await prisma.user.findFirst();
    if (!dbUser) {
      console.log("No user found");
      return;
    }

    const email = "testemployee123@acme.com";
    const employeeCode = `EMP-TEST`;

    const newUser = await prisma.user.upsert({
      where: { email: email },
      update: {
        companyId: dbUser.companyId,
        role: "EMPLOYEE"
      },
      create: {
        email: email,
        companyId: dbUser.companyId,
        role: "EMPLOYEE"
      }
    })

    const employee = await prisma.employee.create({
      data: {
        companyId: dbUser.companyId,
        userId: newUser.id,
        firstName: "Test",
        lastName: "Employee",
        workEmail: email,
        designation: "Tester",
        employeeCode: employeeCode,
        joiningDate: new Date(),
        status: 'ACTIVE'
      }
    });

    console.log("SUCCESSFULLY CREATED EMPLOYEE:", employee.id);
  } catch (error) {
    console.error("ERROR CAUGHT:");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
