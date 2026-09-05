import { EmployeeTable } from "@/components/dashboard/tables/EmployeeTable";
import { AddEmployeeModal } from "./AddEmployeeModal";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default function EmployeesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] dark:text-[#F3F4F6]">Employee Directory</h1>
          <p className="text-[#6B7280] dark:text-[#9CA3AF] text-sm">Manage your workforce, roles, and access.</p>
        </div>
        <div className="flex items-center gap-3">
          <AddEmployeeModal />
        </div>
      </div>

      <Suspense fallback={
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm p-6 h-96 flex items-center justify-center animate-pulse">
          <div className="text-[#9CA3AF] dark:text-[#6B7280]">Loading employee directory...</div>
        </div>
      }>
        <EmployeesData />
      </Suspense>
    </div>
  );
}

async function EmployeesData() {
  const session = await getServerSession(authOptions);
    const user = session?.user;

  if (!user) {
    redirect('/login');
  }

  // Get user's company
  let dbUser = null;
  let employees: any[] = [];
  
  try {
    dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { companyId: true, role: true }
    });

    const companyId = dbUser?.companyId;
    const isSuperAdmin = dbUser?.role === "SUPER_ADMIN";

    // Fetch employees
    if (companyId || isSuperAdmin) {
      const rawEmployees = await prisma.employee.findMany({
        where: isSuperAdmin ? {} : { companyId },
        include: { department: true },
        orderBy: { createdAt: 'desc' }
      });

      employees = rawEmployees.map(emp => ({
        id: emp.id,
        code: emp.employeeCode,
        name: `${emp.firstName} ${emp.lastName}`,
        email: emp.workEmail || "",
        role: emp.designation || 'Employee',
        department: emp.department?.name || 'General',
        status: emp.status,
      }));
    }
  } catch (error) {
    console.warn("Prisma Database connection failed in Employees:. Next.js Dev overlay suppressed.");
  }

  return <EmployeeTable employees={employees} />;
}
