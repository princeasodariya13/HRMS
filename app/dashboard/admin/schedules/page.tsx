import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SchedulesClient } from "./SchedulesClient";

export default async function AdminSchedulesPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user) {
    redirect('/login');
  }

  let dbUser = null;
  let schedules: any[] = [];

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
      schedules = await prisma.workingSchedule.findMany({
        where: isSuperAdmin ? {} : { companyId },
        include: {
          lines: {
            orderBy: { dayOfWeek: 'asc' }
          },
          _count: {
            select: { employees: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    }
  } catch (error) {
    console.error("Failed to fetch schedules data:", error);
  }

  return (
    <SchedulesClient initialSchedules={schedules} />
  );
}

