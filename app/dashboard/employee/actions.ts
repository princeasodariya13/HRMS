"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function checkIn(employeeId: string) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in
    const existing = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: {
          gte: today,
          lte: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
        }
      }
    });

    if (existing) {
      return { success: false, error: "Already checked in today" };
    }

    await prisma.attendance.create({
      data: {
        employeeId,
        date: new Date(),
        checkInTime: new Date(),
        status: "PRESENT",
      }
    });

    revalidatePath('/dashboard', 'layout');
    return { success: true };
  } catch (error: any) {
    console.error("Check-in error:", error);
    return { success: false, error: error.message };
  }
}

export async function checkOut(employeeId: string) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: {
          gte: today,
          lte: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
        }
      }
    });

    if (!existing) {
      return { success: false, error: "Not checked in today" };
    }

    if (existing.checkOutTime) {
      return { success: false, error: "Already checked out today" };
    }

    const checkOutTime = new Date();
    
    // Calculate total hours
    const diffMs = checkOutTime.getTime() - existing.checkInTime!.getTime();
    const totalHours = diffMs / (1000 * 60 * 60);

    await prisma.attendance.update({
      where: { id: existing.id },
      data: {
        checkOutTime,
        totalHours
      }
    });

    revalidatePath('/dashboard', 'layout');
    return { success: true };
  } catch (error: any) {
    console.error("Check-out error:", error);
    return { success: false, error: error.message };
  }
}
