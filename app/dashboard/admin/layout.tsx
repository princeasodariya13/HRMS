import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
    const user = session?.user;

  if (!user) {
    redirect("/login");
  }

  let dbUser = null;
  try {
    dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true }
    });
  } catch (err) {
    console.warn("Prisma connection pool timeout in admin layout. Suppressing crash.");
  }

  // Redirect employees trying to access admin pages.
  // princeasodariya13@gmail.com can bypass this for testing.
  if (dbUser?.role === "EMPLOYEE" && user.email !== "princeasodariya13@gmail.com") {
    redirect("/dashboard/employee");
  }

  return <>{children}</>;
}
