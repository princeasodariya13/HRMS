'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function updateCompanySettings(data: { name: string; website: string }) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;
    if (!user) throw new Error("Unauthorized")

    const dbUser = await prisma.user.findUnique({ 
      where: { id: user.id },
      select: { companyId: true }
    })

    if (!dbUser || !dbUser.companyId) {
      throw new Error("Company not found for the user.")
    }

    await prisma.company.update({
      where: { id: dbUser.companyId },
      data: {
        name: data.name,
        website: data.website || null
      }
    })

    revalidatePath('/dashboard/admin/settings')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Failed to update company settings" }
  }
}

export async function updateAdminProfile(data: { firstName: string; lastName: string }) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;
    if (!user) throw new Error("Unauthorized")

    const dbUser = await prisma.user.findUnique({ 
      where: { id: user.id },
      include: { employee: true }
    })

    if (!dbUser) throw new Error("User not found")

    if (dbUser.employee) {
      await prisma.employee.update({
        where: { id: dbUser.employee.id },
        data: {
          firstName: data.firstName,
          lastName: data.lastName
        }
      })
    } else {
      // Create employee record for the admin if it doesn't exist
      await prisma.employee.create({
        data: {
          companyId: dbUser.companyId!,
          userId: dbUser.id,
          firstName: data.firstName,
          lastName: data.lastName,
          workEmail: dbUser.email,
          employeeCode: `ADM-${Math.floor(Math.random() * 9000) + 1000}`,
          joiningDate: new Date(),
          status: 'ACTIVE',
          designation: 'Administrator'
        }
      })
    }

    revalidatePath('/dashboard/admin/settings')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Failed to update profile settings" }
  }
}

export async function createLeaveType(data: { name: string, annualQuota: number, isPaid: boolean }) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;
    if (!user) throw new Error("Unauthorized");

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser || !dbUser.companyId) throw new Error("Company not found");

    await prisma.leaveType.create({
      data: {
        companyId: dbUser.companyId,
        name: data.name,
        annualQuota: data.annualQuota,
        isPaid: data.isPaid
      }
    });

    revalidatePath('/dashboard/admin/settings');
    revalidatePath('/dashboard/employee/leaves'); // Revalidate employee leaves UI
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to create leave type" };
  }
}

export async function deleteLeaveType(id: string) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;
    if (!user) throw new Error("Unauthorized");

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser || !dbUser.companyId) throw new Error("Company not found");

    await prisma.leaveType.delete({
      where: {
        id,
        companyId: dbUser.companyId // Ensure we only delete our own
      }
    });

    revalidatePath('/dashboard/admin/settings');
    revalidatePath('/dashboard/employee/leaves');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete leave type" };
  }
}

export async function seedDefaultLeaveTypes() {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;
    if (!user) throw new Error("Unauthorized");

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser || !dbUser.companyId) throw new Error("Company not found");

    const existingCount = await prisma.leaveType.count({
      where: { companyId: dbUser.companyId }
    });

    if (existingCount > 0) return { success: true, message: "Leave types already exist" };

    await prisma.leaveType.createMany({
      data: [
        { companyId: dbUser.companyId, name: "Casual Leave", annualQuota: 10, isPaid: true },
        { companyId: dbUser.companyId, name: "Sick Leave", annualQuota: 8, isPaid: true },
        { companyId: dbUser.companyId, name: "Earned Leave", annualQuota: 12, isPaid: true }
      ]
    });

    revalidatePath('/dashboard/admin/settings');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to seed leave types" };
  }
}
