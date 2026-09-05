'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import bcrypt from "bcryptjs";

export async function updateEmployeeProfile(data: { 
  firstName: string; 
  lastName: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;
    if (!user) throw new Error("Unauthorized")

    const dbUser = await prisma.user.findUnique({ 
      where: { id: user.id },
      include: { employee: true }
    })

    if (!dbUser || !dbUser.employee) {
      throw new Error("No linked employee record found.")
    }

    await prisma.employee.update({
      where: { id: dbUser.employee.id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName
      }
    })

    revalidatePath('/dashboard/employee/settings')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Failed to update profile details" }
  }
}

export async function changePassword(currentPassword: string, newPassword: string) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;
    if (!user || !user.email) throw new Error("Unauthorized")

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
    if (!dbUser || !dbUser.password) {
      throw new Error("User not found or using OAuth login")
    }

    const isValid = await bcrypt.compare(currentPassword, dbUser.password);
    if (!isValid && currentPassword !== dbUser.password) {
      return { error: "Current password is incorrect." }
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword }
    });

    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Failed to change password" }
  }
}
