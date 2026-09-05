require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const DEPARTMENTS = ['Engineering','Human Resources','Finance & Accounting','Sales & Marketing'];
const EMPLOYEES_DATA = [
  { firstName:'Arjun', lastName:'Sharma', email:'arjun.sharma@technova.com', designation:'Senior Engineer', dept:'Engineering', baseSalary:90000, status:'ACTIVE' },
  { firstName:'Priya', lastName:'Patel', email:'priya.patel@technova.com', designation:'Full Stack Developer', dept:'Engineering', baseSalary:75000, status:'ACTIVE' },
  { firstName:'Ravi', lastName:'Kumar', email:'ravi.kumar@technova.com', designation:'DevOps Engineer', dept:'Engineering', baseSalary:80000, status:'ACTIVE' },
  { firstName:'Sneha', lastName:'Reddy', email:'sneha.reddy@technova.com', designation:'HR Manager', dept:'Human Resources', baseSalary:65000, status:'ACTIVE' },
  { firstName:'Mohammed', lastName:'Ali', email:'mohammed.ali@technova.com', designation:'HR Executive', dept:'Human Resources', baseSalary:42000, status:'ACTIVE' },
  { firstName:'Ananya', lastName:'Singh', email:'ananya.singh@technova.com', designation:'Finance Manager', dept:'Finance & Accounting', baseSalary:70000, status:'ACTIVE' },
  { firstName:'Vikram', lastName:'Mehta', email:'vikram.mehta@technova.com', designation:'Accountant', dept:'Finance & Accounting', baseSalary:45000, status:'ACTIVE' },
  { firstName:'Kavita', lastName:'Nair', email:'kavita.nair@technova.com', designation:'Sales Manager', dept:'Sales & Marketing', baseSalary:75000, status:'ACTIVE' },
  { firstName:'Rohit', lastName:'Gupta', email:'rohit.gupta@technova.com', designation:'Sales Executive', dept:'Sales & Marketing', baseSalary:40000, status:'ACTIVE' },
  { firstName:'Deepika', lastName:'Joshi', email:'deepika.joshi@technova.com', designation:'QA Engineer', dept:'Engineering', baseSalary:60000, status:'ACTIVE' },
  { firstName:'Suresh', lastName:'Iyer', email:'suresh.iyer@technova.com', designation:'Backend Developer', dept:'Engineering', baseSalary:72000, status:'ACTIVE' },
  { firstName:'Pooja', lastName:'Sharma', email:'pooja.sharma@technova.com', designation:'Payroll Specialist', dept:'Human Resources', baseSalary:48000, status:'ACTIVE' },
  { firstName:'Aarav', lastName:'Patel', email:'aarav.patel@technova.com', designation:'Frontend Developer', dept:'Engineering', baseSalary:68000, status:'PROBATION' },
  { firstName:'Neha', lastName:'Gupta', email:'neha.gupta@technova.com', designation:'Marketing Executive', dept:'Sales & Marketing', baseSalary:38000, status:'PROBATION' },
  { firstName:'Dinesh', lastName:'Rao', email:'dinesh.rao@technova.com', designation:'Junior Accountant', dept:'Finance & Accounting', baseSalary:35000, status:'NOTICE_PERIOD' },
];

function daysAgo(n) { const d = new Date(); d.setDate(d.getDate() - n); return d; }
function randomBetween(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
function addHours(date, h) { return new Date(date.getTime() + h * 3600000); }

async function main() {
  console.log('🚀 Seeding TechNova Solutions...\n');

  // Hash passwords
  const adminHash = await bcrypt.hash('Admin@123', 10);
  const empHash = await bcrypt.hash('Employee@123', 10);

  // Check existing
  const existingCompany = await prisma.company.findFirst({ where: { name: 'TechNova Solutions' } });
  if (existingCompany) {
    console.log('⚠️  Company already exists. Deleting for fresh seed...');
    await prisma.company.delete({ where: { id: existingCompany.id } });
  }

  // 1. Company
  const company = await prisma.company.create({
    data: { name: 'TechNova Solutions', industry: 'Information Technology', website: 'https://technova.com', employeeCount: 15, timezone: 'Asia/Kolkata', currency: 'INR', isActive: true }
  });
  console.log(`✅ Created company: ${company.name}`);

  // 2. Admin User
  const adminUser = await prisma.user.create({
    data: { email: 'admin@technova.com', password: adminHash, companyId: company.id, role: 'COMPANY_ADMIN', isActive: true }
  });
  console.log(`✅ Created admin: ${adminUser.email}`);

  // 3. Departments
  const deptMap = {};
  for (const deptName of DEPARTMENTS) {
    const dept = await prisma.department.create({ data: { companyId: company.id, name: deptName, description: `${deptName} department` } });
    deptMap[deptName] = dept;
  }
  console.log(`✅ Created ${DEPARTMENTS.length} departments`);

  // 4. Working Schedule
  const schedule = await prisma.workingSchedule.create({
    data: {
      companyId: company.id, name: 'Standard 5-Day Week', type: 'FIXED', weeklyHours: 40,
      lines: { create: [
        { dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '18:00', breakMinutes: 60 },
        { dayOfWeek: 'TUESDAY', startTime: '09:00', endTime: '18:00', breakMinutes: 60 },
        { dayOfWeek: 'WEDNESDAY', startTime: '09:00', endTime: '18:00', breakMinutes: 60 },
        { dayOfWeek: 'THURSDAY', startTime: '09:00', endTime: '18:00', breakMinutes: 60 },
        { dayOfWeek: 'FRIDAY', startTime: '09:00', endTime: '18:00', breakMinutes: 60 },
      ]}
    }
  });
  console.log('✅ Created working schedule');

  // 5. Salary Structures
  const engineerStruct = await prisma.salaryStructure.create({
    data: {
      companyId: company.id, name: 'Engineer Salary Structure', isActive: true,
      rules: { create: [
        { code:'BASIC', name:'Basic Salary', category:'BASIC', sequence:1, amountType:'FIXED', amount:50000, appearsOnPayslip:true },
        { code:'HRA', name:'House Rent Allowance', category:'ALLOWANCE', sequence:2, amountType:'PERCENTAGE', percentage:40, appearsOnPayslip:true },
        { code:'TRANSPORT', name:'Transport Allowance', category:'ALLOWANCE', sequence:3, amountType:'FIXED', amount:2000, appearsOnPayslip:true },
        { code:'PT', name:'Professional Tax', category:'DEDUCTION', sequence:4, amountType:'FIXED', amount:200, appearsOnPayslip:true },
        { code:'PF', name:'Provident Fund', category:'DEDUCTION', sequence:5, amountType:'PERCENTAGE', percentage:12, appearsOnPayslip:true },
      ]}
    }
  });
  const staffStruct = await prisma.salaryStructure.create({
    data: {
      companyId: company.id, name: 'Staff Salary Structure', isActive: true,
      rules: { create: [
        { code:'BASIC', name:'Basic Salary', category:'BASIC', sequence:1, amountType:'FIXED', amount:35000, appearsOnPayslip:true },
        { code:'HRA', name:'House Rent Allowance', category:'ALLOWANCE', sequence:2, amountType:'PERCENTAGE', percentage:40, appearsOnPayslip:true },
        { code:'TRANSPORT', name:'Transport Allowance', category:'ALLOWANCE', sequence:3, amountType:'FIXED', amount:1500, appearsOnPayslip:true },
        { code:'PT', name:'Professional Tax', category:'DEDUCTION', sequence:4, amountType:'FIXED', amount:200, appearsOnPayslip:true },
        { code:'PF', name:'Provident Fund', category:'DEDUCTION', sequence:5, amountType:'PERCENTAGE', percentage:12, appearsOnPayslip:true },
      ]}
    }
  });
  console.log('✅ Created salary structures');

  // 6. Leave Types
  const leaveTypes = await Promise.all([
    prisma.leaveType.create({ data: { companyId: company.id, name: 'Casual Leave', annualQuota: 12, carryForwardAllowed: false, isPaid: true } }),
    prisma.leaveType.create({ data: { companyId: company.id, name: 'Sick Leave', annualQuota: 12, carryForwardAllowed: false, isPaid: true } }),
    prisma.leaveType.create({ data: { companyId: company.id, name: 'Earned Leave', annualQuota: 15, carryForwardAllowed: true, isPaid: true } }),
  ]);
  console.log('✅ Created leave types');

  // 7. Employees
  const employees = [];
  const yearStart = new Date(new Date().getFullYear(), 0, 1);
  const yearEnd = new Date(new Date().getFullYear(), 11, 31);

  for (let i = 0; i < EMPLOYEES_DATA.length; i++) {
    const ed = EMPLOYEES_DATA[i];
    const isEngineering = ed.dept === 'Engineering';
    const struct = isEngineering ? engineerStruct : staffStruct;
    const dept = deptMap[ed.dept];
    const code = `EMP${String(i+1).padStart(3,'0')}`;
    const joiningDate = daysAgo(randomBetween(90, 730));

    const user = await prisma.user.create({
      data: { email: ed.email, password: empHash, companyId: company.id, role: 'EMPLOYEE', isActive: true }
    });

    const emp = await prisma.employee.create({
      data: {
        companyId: company.id, userId: user.id, departmentId: dept.id,
        employeeCode: code, firstName: ed.firstName, lastName: ed.lastName,
        designation: ed.designation, joiningDate, status: ed.status,
        workEmail: ed.email, baseSalary: ed.baseSalary,
        allowancePercent: 40, deductionPercent: 12,
        workingScheduleId: schedule.id,
      }
    });

    // Contract
    await prisma.contract.create({
      data: {
        companyId: company.id, employeeId: emp.id, departmentId: dept.id,
        startDate: joiningDate, endDate: new Date(new Date().getFullYear() + 1, 11, 31),
        wage: ed.baseSalary, jobPosition: ed.designation,
        salaryStructureId: struct.id, status: 'RUNNING', isActive: true,
      }
    });

    // Leave allocations
    for (const lt of leaveTypes) {
      await prisma.leaveAllocation.create({
        data: {
          employeeId: emp.id, leaveTypeId: lt.id, companyId: company.id,
          numberOfDays: lt.annualQuota, takenDays: 0, remainingDays: lt.annualQuota,
          dateFrom: yearStart, dateTo: yearEnd, status: 'APPROVED',
        }
      });
    }

    employees.push({ ...ed, id: emp.id, userId: user.id });
  }
  console.log(`✅ Created ${employees.length} employees with contracts and leave allocations`);

  // 8. Attendance (last 60 days)
  const activeEmployees = employees.filter(e => ['ACTIVE','PROBATION'].includes(e.status));
  const statuses = ['PRESENT','PRESENT','PRESENT','PRESENT','PRESENT','PRESENT','PRESENT','LATE','LATE','HALF_DAY','WORK_FROM_HOME','WORK_FROM_HOME','ABSENT'];
  let attendanceCount = 0;

  for (const emp of activeEmployees) {
    for (let d = 60; d >= 1; d--) {
      const date = daysAgo(d);
      const dow = date.getDay();
      if (dow === 0 || dow === 6) continue; // skip weekends
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const checkIn = new Date(date); checkIn.setHours(8 + randomBetween(0,1), randomBetween(45,60), 0, 0);
      const hours = status === 'HALF_DAY' ? randomBetween(4,5) : status === 'ABSENT' ? 0 : randomBetween(8,10);
      const checkOut = hours > 0 ? addHours(checkIn, hours) : null;
      await prisma.attendance.create({
        data: {
          employeeId: emp.id, date, status,
          checkInTime: status !== 'ABSENT' ? checkIn : null,
          checkOutTime: checkOut, totalHours: hours > 0 ? hours : null,
        }
      });
      attendanceCount++;
    }
  }
  console.log(`📊 Created ${attendanceCount} attendance records`);

  // 9. Leave Requests
  const leaveStatuses = [
    ...Array(10).fill('APPROVED'),
    ...Array(8).fill('PENDING'),
    ...Array(5).fill('REJECTED'),
    ...Array(7).fill('APPROVED'),
  ];
  let leaveCount = 0;
  for (let i = 0; i < Math.min(leaveStatuses.length, employees.length * 2); i++) {
    const emp = employees[i % employees.length];
    const lt = leaveTypes[i % leaveTypes.length];
    const daysFromNow = randomBetween(-60, 30);
    const startDate = daysAgo(-daysFromNow);
    startDate.setHours(0,0,0,0);
    const totalDays = randomBetween(1, 5);
    const endDate = new Date(startDate); endDate.setDate(endDate.getDate() + totalDays - 1);
    const status = leaveStatuses[i];
    await prisma.leaveRequest.create({
      data: {
        companyId: company.id, employeeId: emp.id, leaveTypeId: lt.id,
        startDate, endDate, totalDays, status,
        reason: `${lt.name} request for personal reasons`,
        approvedById: status !== 'PENDING' ? adminUser.id : null,
        managerApprovalStatus: status === 'APPROVED' ? 'APPROVED' : status === 'REJECTED' ? 'REJECTED' : 'PENDING',
        hrApprovalStatus: status === 'APPROVED' ? 'APPROVED' : status === 'REJECTED' ? 'REJECTED' : 'PENDING',
        rejectionReason: status === 'REJECTED' ? 'Insufficient leave balance or staffing constraints.' : null,
      }
    });
    leaveCount++;
  }
  console.log(`🏖️  Created ${leaveCount} leave requests`);

  // 10. Payroll Runs (last 3 months)
  let payrunCount = 0;
  for (let m = 3; m >= 1; m--) {
    const d = new Date(); d.setMonth(d.getMonth() - m);
    const month = d.getMonth() + 1; const year = d.getFullYear();
    const periodStart = new Date(year, month-1, 1); const periodEnd = new Date(year, month, 0);
    let totalAmount = 0;
    const payrun = await prisma.payrollRun.create({
      data: { companyId: company.id, month, year, periodStart, periodEnd, status: 'PAID', totalAmount: 0, salaryStructureId: engineerStruct.id }
    });
    for (const emp of activeEmployees) {
      const basic = emp.baseSalary; const hra = basic * 0.4; const transport = emp.dept === 'Engineering' ? 2000 : 1500;
      const pf = basic * 0.12; const pt = 200;
      const allowances = hra + transport; const deductions = pf + pt; const net = basic + allowances - deductions;
      const workedDays = randomBetween(20, 24);
      const payslip = await prisma.payslip.create({
        data: {
          payrollRunId: payrun.id, employeeId: emp.id, workedDays, totalWorkingDays: 26,
          basicSalary: basic, allowances, deductions, netSalary: net,
          lines: { create: [
            { code:'BASIC', name:'Basic Salary', category:'BASIC', sequence:1, amount:basic, appearsOnPayslip:true },
            { code:'HRA', name:'House Rent Allowance', category:'ALLOWANCE', sequence:2, amount:hra, appearsOnPayslip:true },
            { code:'TRANSPORT', name:'Transport Allowance', category:'ALLOWANCE', sequence:3, amount:transport, appearsOnPayslip:true },
            { code:'PT', name:'Professional Tax', category:'DEDUCTION', sequence:4, amount:pt, appearsOnPayslip:true },
            { code:'PF', name:'Provident Fund', category:'DEDUCTION', sequence:5, amount:pf, appearsOnPayslip:true },
          ]}
        }
      });
      totalAmount += net;
    }
    await prisma.payrollRun.update({ where: { id: payrun.id }, data: { totalAmount } });
    payrunCount++;
  }
  console.log(`💰 Created ${payrunCount} payroll runs with payslips`);

  // 11. Notifications
  for (let i = 0; i < 5; i++) {
    const emp = employees[i];
    await prisma.notification.create({
      data: {
        companyId: company.id, userId: emp.userId,
        title: i % 2 === 0 ? 'Your payslip is ready 💰' : 'Leave request approved ✅',
        message: i % 2 === 0 ? 'Your payslip for the current month is available.' : 'Your leave request has been approved.',
        type: i % 2 === 0 ? 'PAYROLL_UPDATE' : 'LEAVE_REQUEST', isRead: false,
        link: i % 2 === 0 ? '/dashboard/employee/payroll' : '/dashboard/employee/leaves',
      }
    });
  }
  console.log('🔔 Created sample notifications');

  // 12. Audit Logs
  for (let i = 0; i < 10; i++) {
    const emp = employees[i % employees.length];
    const actions = ['CREATE','UPDATE','APPROVE','REJECT'];
    const modules = ['EMPLOYEE','LEAVE','PAYROLL','CONTRACT'];
    await prisma.auditLog.create({
      data: {
        companyId: company.id, userId: adminUser.id,
        module: modules[i % modules.length], action: actions[i % actions.length],
        recordId: emp.id,
        oldData: i % 2 === 0 ? { status: 'PENDING' } : null,
        newData: i % 2 === 0 ? { status: 'APPROVED' } : { created: true },
        ipAddress: '127.0.0.1',
      }
    });
  }
  console.log('📋 Created sample audit logs');

  console.log('\n════════════════════════════════════');
  console.log('       SEED COMPLETE ✨');
  console.log('════════════════════════════════════');
  console.log(`Company:    TechNova Solutions`);
  console.log(`Admin:      admin@technova.com / Admin@123`);
  console.log(`Employees:  15 (password: Employee@123)`);
  console.log(`Payroll:    ${payrunCount} months`);
  console.log(`Leaves:     ${leaveCount} requests`);
  console.log(`Attendance: ${attendanceCount} records`);
  console.log('════════════════════════════════════\n');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
