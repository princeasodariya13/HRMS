"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

export async function updateProfile(formData: FormData) {
  const session = await getServerSession(authOptions);
    const user = session?.user;

  if (!user) {
    return { error: "Unauthorized" };
  }

  let dbUser = null;
  try {
    dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { employee: true }
    });
  } catch (err) {
    console.error("Prisma error in updateProfile:", err);
    return { error: "Database connection error. Try again later." };
  }

  if (!dbUser || !dbUser.employee) {
    return { error: "Employee record not found" };
  }

  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const designation = formData.get("designation") as string;
  const personalEmail = formData.get("personalEmail") as string;
  const phone = formData.get("phone") as string;

  if (!firstName || !lastName) {
    return { error: "First name and Last name are required" };
  }

  try {
    await prisma.employee.update({
      where: { id: dbUser.employee.id },
      data: {
        firstName,
        lastName,
        designation: designation || null,
        personalEmail: personalEmail || null,
        phone: phone || null,
      }
    });

    revalidatePath("/dashboard/employee/profile");
    revalidatePath("/dashboard/employee");
    
    return { success: true };
  } catch (error: any) {
    console.error("Profile update error:", error);
    return { error: "Failed to update profile" };
  }
}
