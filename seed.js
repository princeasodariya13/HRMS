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
    await prisma.payslip.deleteMany();
    await prisma.payrollRun.deleteMany();
    await prisma.attendance.deleteMany();
    await prisma.leaveRequest.deleteMany();
    await prisma.goal.deleteMany();
    await prisma.candidate.deleteMany();
    await prisma.job.deleteMany();
    await prisma.document.deleteMany();
    await prisma.employee.deleteMany();
    await prisma.leaveType.deleteMany();

    console.log("Cleared old records. Seeding 2 real employees...");

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
        status: "ACTIVE"
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
        status: "ACTIVE"
      }
    });

    console.log("Seeding Attendance...");
    const today = new Date();
    today.setHours(9, 0, 0, 0);
    
    await prisma.attendance.createMany({
      data: [
        { employeeId: emp1.id, date: today, status: "PRESENT", checkInTime: today, ipAddress: "192.168.1.1" },
        { employeeId: emp2.id, date: today, status: "PRESENT", checkInTime: today, ipAddress: "192.168.1.2" }
      ]
    });

    console.log("Seeding Leaves...");
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    const leaveType = await prisma.leaveType.create({
      data: {
        companyId,
        name: "Annual Leave",
        annualQuota: 20,
        isPaid: true
      }
    });

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
    const payroll = await prisma.payrollRun.create({
      data: {
        companyId,
        month: today.getMonth() + 1,
        year: today.getFullYear(),
        status: "APPROVED",
        totalAmount: 15000
      }
    });

    await prisma.payslip.createMany({
      data: [
        { payrollRunId: payroll.id, employeeId: emp1.id, basicSalary: 8000, allowances: 2000, deductions: 1000, netSalary: 9000 },
        { payrollRunId: payroll.id, employeeId: emp2.id, basicSalary: 5000, allowances: 1500, deductions: 500, netSalary: 6000 }
      ]
    });

    console.log("Successfully seeded 2 real data records across all dashboard modules!");
  } catch (error) {
    console.error("Failed to seed data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
