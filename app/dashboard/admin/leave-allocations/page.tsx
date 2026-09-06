import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AllocationsClient } from "./AllocationsClient";

export default async function AdminLeaveAllocationsPage({ searchParams }: { searchParams: Promise<{ employee?: string }> }) {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user) {
    redirect('/login');
  }

  let dbUser = null;
  let allocations: any[] = [];
  let employees: any[] = [];
  let leaveTypes: any[] = [];
  const { employee: employeeId } = await searchParams;

  try {
    dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { companyId: true, role: true }
    });

    const userRole = dbUser?.role || "EMPLOYEE";
    if (userRole === "EMPLOYEE") {
      redirect("/dashboard/employee");
    }

    const companyId = dbUser?.companyId;
    const isSuperAdmin = userRole === "SUPER_ADMIN";

    if (companyId || isSuperAdmin) {
      allocations = await prisma.leaveAllocation.findMany({
        where: isSuperAdmin ? (employeeId ? { employeeId } : {}) : { employee: { companyId, ...(employeeId ? { id: employeeId } : {}) } },
        include: {
          employee: true,
          leaveType: true,
        },
        orderBy: { createdAt: 'desc' }
      });

      employees = await prisma.employee.findMany({
        where: { ...(isSuperAdmin ? {} : { companyId }), deletedAt: null },
        select: { id: true, firstName: true, lastName: true, designation: true }
      });

      leaveTypes = await prisma.leaveType.findMany({
        where: isSuperAdmin ? {} : { companyId },
        select: { id: true, name: true, isPaid: true }
      });
    }
  } catch (error) {
    console.error("Failed to fetch allocations data:", error);
  }

  return (
    <AllocationsClient 
      initialAllocations={allocations} 
      employees={employees}
      leaveTypes={leaveTypes}
    />
  );
}

