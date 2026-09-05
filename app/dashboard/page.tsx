import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function DashboardIndexPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
  }

  let role = "EMPLOYEE";
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });
    if (dbUser) {
      role = dbUser.role;
    }
  } catch (e) {
    console.warn("DB offline, defaulting to EMPLOYEE role");
  }

  const isAdminRole = role === 'SUPER_ADMIN' || role === 'COMPANY_ADMIN' || role === 'HR_MANAGER';

  if (isAdminRole) {
    redirect("/dashboard/admin");
  } else {
    redirect("/dashboard/employee");
  }
}
