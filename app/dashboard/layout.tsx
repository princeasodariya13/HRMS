import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/layout/Sidebar";
import { TopNavbar } from "@/components/dashboard/layout/TopNavbar";
import { RealtimeProvider } from "@/components/RealtimeProvider";
import prisma from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
  }

  let role = "EMPLOYEE";
  let companyId = undefined;
  let userName = "";
  
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        role: true, 
        companyId: true,
        employee: { select: { firstName: true, lastName: true } }
      }
    });
    if (dbUser) {
      role = dbUser.role;
      companyId = dbUser.companyId;
      if (dbUser.employee) {
        userName = `${dbUser.employee.firstName} ${dbUser.employee.lastName}`;
      }
    }
  } catch (e) {
    console.warn("DB offline, defaulting to EMPLOYEE role");
  }

  // Fallback to email username if no employee record exists
  if (!userName && session.user.email) {
    userName = session.user.email.split('@')[0].replace(/[._-]/g, ' ');
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-[#1E293B]">
      <RealtimeProvider companyId={companyId} />
      <Sidebar role={role} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar userEmail={session.user.email || ""} role={role} userName={userName} />
        
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
