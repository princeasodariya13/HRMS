require('dotenv').config({ path: '.env' });
const { PrismaClient: PostgresClient } = require('@prisma/client');
const { PrismaClient: MongoClient } = require('../prisma/generated/mongo-client');

const pg = new PostgresClient();
const mongo = new MongoClient();

async function migrate() {
  console.log("Starting Data Migration from PostgreSQL to MongoDB...");

  try {
    // 1. Migrate Companies
    console.log("Migrating Companies...");
    const companies = await pg.company.findMany();
    for (const company of companies) {
      await mongo.company.create({
        data: {
          ...company,
          // Convert Decimal/other types if necessary
        }
      });
    }
    console.log(`Successfully migrated ${companies.length} companies.`);

    // 2. Migrate Users
    console.log("Migrating Users...");
    const users = await pg.user.findMany();
    for (const user of users) {
      // In MongoDB, we use NextAuth layout, so we need to set password to a default if they used Supabase
      await mongo.user.create({
        data: {
          id: user.id, // Keeping the same UUID for relations
          email: user.email,
          companyId: user.companyId,
          role: user.role,
          isActive: user.isActive,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          // Set a default temp password hash because Supabase Auth hashes are not exportable easily
          // bcrypt hash of "password123" -> $2a$10$X... (Replace in real usage)
          password: "NEEDS_RESET", 
          emailVerified: user.createdAt, // Mark as verified if they were in Postgres
        }
      });
    }
    console.log(`Successfully migrated ${users.length} users.`);

    // 3. Migrate Departments
    console.log("Migrating Departments...");
    const departments = await pg.department.findMany();
    for (const dept of departments) {
      await mongo.department.create({
        data: dept
      });
    }
    console.log(`Successfully migrated ${departments.length} departments.`);

    // 4. Migrate Employees
    console.log("Migrating Employees...");
    const employees = await pg.employee.findMany();
    for (const emp of employees) {
      await mongo.employee.create({
        data: emp
      });
    }
    console.log(`Successfully migrated ${employees.length} employees.`);

    // 5. Migrate Attendances
    console.log("Migrating Attendances...");
    const attendances = await pg.attendance.findMany();
    for (const att of attendances) {
      await mongo.attendance.create({
        data: {
          ...att,
          totalHours: att.totalHours ? parseFloat(att.totalHours.toString()) : null
        }
      });
    }
    console.log(`Successfully migrated ${attendances.length} attendance records.`);

    // 6. Migrate Leaves
    console.log("Migrating Leaves...");
    const leaves = await pg.leaveRequest.findMany();
    for (const leave of leaves) {
      await mongo.leaveRequest.create({
        data: {
          ...leave,
          totalDays: parseFloat(leave.totalDays.toString())
        }
      });
    }
    console.log(`Successfully migrated ${leaves.length} leave requests.`);

    // 7. Migrate Payrolls and Payslips
    console.log("Migrating Payrolls...");
    const payrolls = await pg.payrollRun.findMany();
    for (const payroll of payrolls) {
      await mongo.payrollRun.create({
        data: {
          ...payroll,
          totalAmount: parseFloat(payroll.totalAmount.toString())
        }
      });
    }
    
    console.log("Migrating Payslips...");
    const payslips = await pg.payslip.findMany();
    for (const payslip of payslips) {
      await mongo.payslip.create({
        data: {
          ...payslip,
          basicSalary: parseFloat(payslip.basicSalary.toString()),
          allowances: parseFloat(payslip.allowances.toString()),
          deductions: parseFloat(payslip.deductions.toString()),
          netSalary: parseFloat(payslip.netSalary.toString()),
        }
      });
    }
    console.log(`Successfully migrated payrolls and payslips.`);

    console.log("\n✅ Migration completed successfully!");

  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await pg.$disconnect();
    await mongo.$disconnect();
  }
}

migrate();
