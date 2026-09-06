import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ContractsClient } from "./ContractsClient";

export default async function AdminContractsPage({
  searchParams,
}: {
  searchParams: Promise<{ employee?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user) {
    redirect('/login');
  }

  let dbUser = null;
  let contracts: any[] = [];
  let employees: any[] = [];
  let salaryStructures: any[] = [];
  const resolvedParams = await searchParams;

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
      const whereClause: any = isSuperAdmin ? {} : { companyId };
      
      if (resolvedParams.employee) {
        whereClause.employeeId = resolvedParams.employee;
      }

      contracts = await prisma.contract.findMany({
        where: whereClause,
        include: {
          employee: true,
          salaryStructure: true
        },
        orderBy: { createdAt: 'desc' }
      });

      employees = await prisma.employee.findMany({
        where: isSuperAdmin ? { deletedAt: null } : { companyId, deletedAt: null },
        select: { id: true, firstName: true, lastName: true, designation: true }
      });

      salaryStructures = await prisma.salaryStructure.findMany({
        where: isSuperAdmin ? {} : { companyId },
        select: { id: true, name: true }
      });
    }
  } catch (error) {
    console.error("Failed to fetch contracts data:", error);
  }

  return (
    <ContractsClient 
      initialContracts={contracts} 
      employees={employees}
      salaryStructures={salaryStructures}
      selectedEmployeeId={resolvedParams.employee}
    />
  );
}
