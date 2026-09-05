import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { SettingsClient } from "./SettingsClient";

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions);
    const user = session?.user;

  if (!user) {
    redirect('/login');
  }

  let company = null;
  let employee = null;
  let leaveTypes: any[] = [];

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        company: {
          include: { leaveTypes: true }
        },
        employee: true
      }
    });

    if (dbUser) {
      company = dbUser.company ? {
        name: dbUser.company.name,
        website: dbUser.company.website
      } : null;
      
      employee = dbUser.employee ? {
        firstName: dbUser.employee.firstName,
        lastName: dbUser.employee.lastName
      } : null;

      if (dbUser.company?.leaveTypes) {
        leaveTypes = dbUser.company.leaveTypes;
      }
    }
  } catch (err) {
    console.error("Prisma Database fetching failed in Admin Settings:", err);
  }

  return (
    <SettingsClient company={company} employee={employee} leaveTypes={leaveTypes} />
  );
}
