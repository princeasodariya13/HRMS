'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

function calculateWeeklyHours(lines: any[]) {
  let totalMinutes = 0;
  for (const line of lines) {
    if (!line.startTime || !line.endTime) continue;
    const [startH, startM] = line.startTime.split(':').map(Number);
    const [endH, endM] = line.endTime.split(':').map(Number);
    const diff = (endH * 60 + endM) - (startH * 60 + startM);
    if (diff > 0) {
      totalMinutes += diff - (line.breakMinutes || 0);
    }
  }
  return Number((totalMinutes / 60).toFixed(2));
}

export async function createSchedule(data: {
  name: string;
  type: string;
  lines: { dayOfWeek: number; startTime: string; endTime: string; breakMinutes: number }[];
}) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;
    if (!user) throw new Error("Unauthorized");

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) throw new Error("User not found");

    const isSuperAdmin = dbUser.role === "SUPER_ADMIN";
    const companyId = dbUser.companyId;
    if (!isSuperAdmin && !companyId) throw new Error("Access denied");

    const weeklyHours = calculateWeeklyHours(data.lines);

    await prisma.workingSchedule.create({
      data: {
        companyId: companyId!,
        name: data.name,
        type: data.type,
        weeklyHours,
        lines: {
          create: data.lines
        }
      }
    });

    revalidatePath('/dashboard/admin/schedules');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateSchedule(id: string, data: {
  name: string;
  type: string;
  lines: { dayOfWeek: number; startTime: string; endTime: string; breakMinutes: number }[];
}) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;
    if (!user) throw new Error("Unauthorized");

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) throw new Error("User not found");

    const isSuperAdmin = dbUser.role === "SUPER_ADMIN";
    const companyId = dbUser.companyId;

    const existing = await prisma.workingSchedule.findUnique({ where: { id } });
    if (!existing || (!isSuperAdmin && existing.companyId !== companyId)) {
      throw new Error("Schedule not found or access denied");
    }

    const weeklyHours = calculateWeeklyHours(data.lines);

    await prisma.workingScheduleLine.deleteMany({ where: { scheduleId: id } });

    await prisma.workingSchedule.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type,
        weeklyHours,
        lines: { create: data.lines }
      }
    });

    revalidatePath('/dashboard/admin/schedules');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteSchedule(id: string) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;
    if (!user) throw new Error("Unauthorized");

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) throw new Error("User not found");

    const isSuperAdmin = dbUser.role === "SUPER_ADMIN";
    const companyId = dbUser.companyId;

    const existing = await prisma.workingSchedule.findUnique({ where: { id } });
    if (!existing || (!isSuperAdmin && existing.companyId !== companyId)) {
      throw new Error("Schedule not found or access denied");
    }

    await prisma.workingSchedule.delete({ where: { id } });

    revalidatePath('/dashboard/admin/schedules');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

