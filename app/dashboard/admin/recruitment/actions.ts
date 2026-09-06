'use server'

import prisma from '@/lib/prisma'
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from 'next/cache';
import { logAudit } from '@/lib/auditLog';

export async function createJob(data: {
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;
    if (!user) throw new Error("Unauthorized");

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser || !dbUser.companyId) throw new Error("User or company not found");

    if (dbUser.role !== "SUPER_ADMIN" && dbUser.role !== "COMPANY_ADMIN" && dbUser.role !== "HR_MANAGER") {
      throw new Error("You do not have permission to post jobs.");
    }

    const job = await prisma.job.create({
      data: {
        companyId: dbUser.companyId,
        title: data.title,
        department: data.department,
        location: data.location,
        type: data.type,
        description: data.description,
        requirements: data.requirements,
        isActive: true,
      }
    });

    await logAudit({
      companyId: dbUser.companyId,
      userId: user.id,
      module: 'RECRUITMENT',
      action: 'CREATE',
      recordId: job.id,
      newData: { title: data.title, department: data.department }
    });

    revalidatePath('/dashboard/admin/recruitment');
    return { success: true };
  } catch (error: any) {
    console.error("Create Job Error:", error);
    return { error: error.message || "Failed to create job" };
  }
}
