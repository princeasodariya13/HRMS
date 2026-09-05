import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
    const user = session?.user;

  if (!user) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true }
  });

  // Redirect admins trying to access employee pages,
  // unless they are princeasodariya13@gmail.com which can access both.
  if (dbUser?.role !== "EMPLOYEE" && user.email !== "princeasodariya13@gmail.com") {
    redirect("/dashboard/admin");
  }

  return <>{children}</>;
}
