const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const companyId = '4d8811f6-c7ee-461d-b68c-02b8287ab739';
  const isSuperAdmin = true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const last7DaysDate = new Date();
  last7DaysDate.setHours(0, 0, 0, 0);
  last7DaysDate.setDate(last7DaysDate.getDate() - 6);

  try {
    const results = await Promise.all([
      prisma.employee.count({ where: isSuperAdmin ? { status: 'ACTIVE' } : { companyId, status: 'ACTIVE' } }),
      prisma.attendance.count({ where: isSuperAdmin ? { date: { gte: today }, status: 'PRESENT' } : { employee: { companyId }, date: { gte: today }, status: 'PRESENT' } }),
      prisma.leaveRequest.count({ where: isSuperAdmin ? { status: 'PENDING' } : { companyId, status: 'PENDING' } }),
      prisma.payrollRun.aggregate({
        _sum: { totalAmount: true },
        where: isSuperAdmin ? { month: new Date().getMonth() + 1, year: new Date().getFullYear() } : { companyId, month: new Date().getMonth() + 1, year: new Date().getFullYear() }
      }),
      prisma.attendance.findMany({
        where: isSuperAdmin ? { date: { gte: last7DaysDate } } : { employee: { companyId }, date: { gte: last7DaysDate } },
        select: { date: true, status: true }
      })
    ]);
    console.log("Success:", results.map(r => typeof r === 'object' ? JSON.stringify(r).substring(0, 20) : r));
  } catch (e) {
    console.error("Error:", e);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());