'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function checkInAction() {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;
    if (!user) throw new Error("Unauthorized")

    const dbUser = await prisma.user.findUnique({ 
      where: { id: user.id },
      include: { employee: true }
    })
    if (!dbUser) throw new Error("User not found")
    if (!dbUser.employee) {
      throw new Error("No Employee record is linked to your administrator user account. Please add your employee profile in the Employee Directory first.")
    }

    const employeeId = dbUser.employee.id
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Check if already checked in
    const existing = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: {
          gte: today,
          lte: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
        }
      }
    })

    if (existing) {
      throw new Error("Already checked in today")
    }

    await prisma.attendance.create({
      data: {
        employeeId,
        date: new Date(),
        checkInTime: new Date(),
        status: "PRESENT",
      }
    })

    revalidatePath('/dashboard/admin/attendance')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Failed to check in" }
  }
}

export async function checkOutAction() {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;
    if (!user) throw new Error("Unauthorized")

    const dbUser = await prisma.user.findUnique({ 
      where: { id: user.id },
      include: { employee: true }
    })
    if (!dbUser) throw new Error("User not found")
    if (!dbUser.employee) {
      throw new Error("No Employee record is linked to your administrator user account.")
    }

    const employeeId = dbUser.employee.id
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const existing = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: {
          gte: today,
          lte: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
        }
      }
    })

    if (!existing) {
      throw new Error("Not checked in today")
    }

    if (existing.checkOutTime) {
      throw new Error("Already checked out today")
    }

    const checkOutTime = new Date()
    const diffMs = checkOutTime.getTime() - existing.checkInTime!.getTime()
    const totalHours = diffMs / (1000 * 60 * 60)

    await prisma.attendance.update({
      where: { id: existing.id },
      data: {
        checkOutTime,
        totalHours
      }
    })

    revalidatePath('/dashboard/admin/attendance')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Failed to check out" }
  }
}
