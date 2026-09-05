require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Connecting to database to seed real data...");
    
    // Get the first user/company
    let user = await prisma.user.findFirst();
    if (!user) {
      console.log("No user found. Creating a default company and user...");
      const company = await prisma.company.create({
        data: { name: "NexaHR Company", website: "nexahr.com" }
      });
      user = await prisma.user.create({
        data: {
          email: "admin@nexahr.com",
          companyId: company.id,
          role: "SUPER_ADMIN"
        }
      });
    }

    const companyId = user.companyId;

    // Remove old data to ensure clean slate
    await prisma.payslipLine.deleteMany();
    await prisma.payslip.deleteMany();
    await prisma.payrollRun.deleteMany();
    await prisma.leaveAllocation.deleteMany();
    await prisma.contract.deleteMany();
    await prisma.salaryRule.deleteMany({ where: { structure: { companyId } } });
    await prisma.salaryStructure.deleteMany({ where: { companyId } });
    await prisma.attendance.deleteMany();
    await prisma.leaveRequest.deleteMany();
    await prisma.goal.deleteMany();
    await prisma.candidate.deleteMany();
    await prisma.job.deleteMany();
    await prisma.document.deleteMany();
    await prisma.employee.deleteMany();
    await prisma.department.deleteMany({ where: { companyId } });
    await prisma.workingSchedule.deleteMany({ where: { companyId } });
    await prisma.leaveType.deleteMany();

    console.log("Cleared old records. Seeding departments, schedules, and employees...");

    const engineering = await prisma.department.create({ data: { companyId, name: "Engineering", description: "Product engineering and platform delivery" } });
    const operations = await prisma.department.create({ data: { companyId, name: "Operations", description: "Business operations and customer success" } });
    const fullTimeSchedule = await prisma.workingSchedule.create({ data: { companyId, name: "Full-time - 9 to 5", type: "Full-time", weeklyHours: 40 } });
    const partTimeSchedule = await prisma.workingSchedule.create({ data: { companyId, name: "Part-time - 9 to 1", type: "Part-time", weeklyHours: 20 } });

    // Create 2 Real Employees
    const emp1 = await prisma.employee.create({
      data: {
        companyId,
        userId: user.id, // Linking to the admin user for simplicity
        employeeCode: "EMP-001",
        firstName: "Amit",
        lastName: "Sharma",
        workEmail: "amit.sharma@nexahr.com",
        designation: "Regional Manager",
        joiningDate: new Date("2023-01-15"),
        status: "ACTIVE",
        departmentId: operations.id,
        workingScheduleId: fullTimeSchedule.id
      }
    });

    // Create a dummy user record for emp2 so we can satisfy userId unique constraint
    const user2 = await prisma.user.upsert({
      where: { email: "vikram.singh@nexahr.com" },
      update: { companyId, role: "EMPLOYEE", isActive: true },
      create: {
        email: "vikram.singh@nexahr.com",
        companyId,
        role: "EMPLOYEE"
      }
    });

    const emp2 = await prisma.employee.create({
      data: {
        companyId,
        userId: user2.id,
        employeeCode: "EMP-002",
        firstName: "Vikram",
        lastName: "Singh",
        workEmail: "vikram.singh@nexahr.com",
        designation: "Assistant to the Regional Manager",
        joiningDate: new Date("2023-02-01"),
        status: "ACTIVE",
        departmentId: engineering.id,
        workingScheduleId: partTimeSchedule.id
      }
    });

    const leaveType = await prisma.leaveType.create({
      data: {
        companyId,
        name: "Annual Leave",
        annualQuota: 20,
        isPaid: true
      }
    });

    const salaryStructure = await prisma.salaryStructure.create({
      data: {
        companyId,
        name: "Demo Monthly Salary",
        isActive: true,
        rules: {
          create: [
            { code: "BASIC", name: "Basic salary", category: "BASIC", sequence: 1, amountType: "FIXED", appearsOnPayslip: true },
            { code: "HRA", name: "Housing allowance", category: "ALLOWANCE", sequence: 2, amountType: "FIXED", amount: 2000, appearsOnPayslip: true },
            { code: "TAX", name: "Tax deduction", category: "DEDUCTION", sequence: 3, amountType: "FIXED", amount: 1000, appearsOnPayslip: true }
          ]
        }
      },
      include: { rules: { orderBy: { sequence: "asc" } } }
    });

    await prisma.contract.createMany({
      data: [
        { companyId, employeeId: emp1.id, startDate: new Date("2023-01-15"), wage: 8000, departmentId: operations.id, jobPosition: "Regional Manager", salaryStructureId: salaryStructure.id, status: "RUNNING", isActive: true },
        { companyId, employeeId: emp2.id, startDate: new Date("2023-02-01"), wage: 5000, departmentId: engineering.id, jobPosition: "Operations Associate", salaryStructureId: salaryStructure.id, status: "RUNNING", isActive: true }
      ]
    });

    const contracts = await prisma.contract.findMany({ where: { companyId }, orderBy: { wage: "desc" } });
    const contractByEmployee = new Map(contracts.map(contract => [contract.employeeId, contract]));
    const today = new Date();
    today.setHours(9, 0, 0, 0);

    await prisma.leaveAllocation.createMany({
      data: [
        { employeeId: emp1.id, leaveTypeId: leaveType.id, numberOfDays: 20, takenDays: 2, remainingDays: 18, dateFrom: new Date(today.getFullYear(), 0, 1), dateTo: new Date(today.getFullYear(), 11, 31), status: "APPROVED" },
        { employeeId: emp2.id, leaveTypeId: leaveType.id, numberOfDays: 20, takenDays: 0, remainingDays: 20, dateFrom: new Date(today.getFullYear(), 0, 1), dateTo: new Date(today.getFullYear(), 11, 31), status: "APPROVED" }
      ]
    });

    console.log("Seeding Attendance...");
    for (let day = 1; day <= Math.min(today.getDate(), 10); day += 1) {
      for (const [index, employeeId] of [emp1.id, emp2.id].entries()) {
        const date = new Date(today.getFullYear(), today.getMonth(), day, 9, 0, 0, 0);
        const status = day === 4 && index === 1 ? "LATE" : day === 6 && index === 0 ? "HALF_DAY" : "PRESENT";
        await prisma.attendance.create({ data: { employeeId, date, status, checkInTime: date, totalHours: status === "HALF_DAY" ? 4 : 8, ipAddress: `192.168.1.${index + 1}` } });
      }
    }

    console.log("Seeding Leaves...");
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    await prisma.leaveRequest.create({
      data: {
        companyId,
        employeeId: emp1.id,
        leaveTypeId: leaveType.id,
        startDate: tomorrow,
        endDate: tomorrow,
        totalDays: 1,
        reason: "Dentist appointment",
        status: "PENDING"
      }
    });
    await prisma.leaveRequest.create({
      data: {
        companyId,
        employeeId: emp2.id,
        leaveTypeId: leaveType.id,
        startDate: new Date(today.getFullYear(), today.getMonth(), Math.max(1, today.getDate() - 3)),
        endDate: new Date(today.getFullYear(), today.getMonth(), Math.max(1, today.getDate() - 2)),
        totalDays: 2,
        reason: "Personal time",
        status: "APPROVED",
        approvedById: user.id
      }
    });

    console.log("Seeding Jobs & Candidates...");
    const job = await prisma.job.create({
      data: {
        companyId,
        title: "Senior Developer",
        department: "Engineering",
        location: "Remote",
        type: "Full-time",
        description: "Looking for a senior dev.",
        requirements: "React, Node.js",
        isActive: true
      }
    });

    await prisma.candidate.create({
      data: {
        jobId: job.id,
        firstName: "Karan",
        lastName: "Patel",
        email: "karan@example.com",
        status: "INTERVIEW_SCHEDULED",
        aiMatchScore: 85.5
      }
    });

    console.log("Seeding Documents...");
    await prisma.document.create({
      data: {
        employeeId: emp1.id,
        title: "Employment Contract",
        type: "CONTRACT",
        fileUrl: "https://example.com/contract.pdf",
        isVerified: true
      }
    });

    console.log("Seeding Payroll...");
    const periodStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const periodEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
    const payroll = await prisma.payrollRun.create({
      data: {
        companyId,
        month: today.getMonth() + 1,
        year: today.getFullYear(),
        periodStart,
        periodEnd,
        salaryStructureId: salaryStructure.id,
        status: "PAID",
        totalAmount: 15000
      }
    });

    for (const [index, employeeId] of [emp1.id, emp2.id].entries()) {
      const contract = contractByEmployee.get(employeeId);
      const basicSalary = contract?.wage || (index === 0 ? 8000 : 5000);
      const allowances = index === 0 ? 2000 : 1500;
      const deductions = index === 0 ? 1000 : 500;
      const payslip = await prisma.payslip.create({ data: { payrollRunId: payroll.id, employeeId, contractId: contract?.id, structureId: salaryStructure.id, workedDays: 20, totalWorkingDays: 22, basicSalary, allowances, deductions, netSalary: basicSalary + allowances - deductions } });
      await prisma.payslipLine.createMany({ data: [
        { payslipId: payslip.id, code: "BASIC", name: "Basic salary", category: "BASIC", amount: basicSalary, sequence: 1 },
        { payslipId: payslip.id, code: "HRA", name: "Housing allowance", category: "ALLOWANCE", amount: allowances, sequence: 2 },
        { payslipId: payslip.id, code: "TAX", name: "Tax deduction", category: "DEDUCTION", amount: deductions, sequence: 3 }
      ] });
    }

    console.log("Successfully seeded demo HR, attendance, leave, and paid payroll data. Downloadable payslips are available from the payroll run.");
  } catch (error) {
    console.error("Failed to seed data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
