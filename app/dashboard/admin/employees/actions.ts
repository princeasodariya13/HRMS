'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import bcrypt from "bcryptjs";
import { EmployeeStatus } from '@prisma/client'
import { headers } from 'next/headers'
import { logAudit } from '@/lib/auditLog';

async function getAppUrl() {
  try {
    const headersList = await headers();
    const origin = headersList.get('origin');
    if (origin) return origin;
  } catch (e) { }

  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

export async function updateEmployeeRole(employeeId: string, newRole: string) {
  if (employeeId.length < 10) return { error: "Cannot modify demo data." }

  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;
    if (!user) throw new Error("Unauthorized")

    // Security check: verify this employee belongs to the user's company
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
    if (!dbUser) throw new Error("User not found in database")

    const employeeToUpdate = await prisma.employee.findUnique({ where: { id: employeeId } });
    const isSuperAdmin = dbUser.role === "SUPER_ADMIN";

    if (!employeeToUpdate || (!isSuperAdmin && employeeToUpdate.companyId !== dbUser.companyId)) {
      throw new Error("Employee not found or access denied.");
    }

    await prisma.employee.update({
      where: { id: employeeId },
      data: { designation: newRole }
    })

    await logAudit({
      companyId: dbUser.companyId,
      userId: user.id,
      module: 'EMPLOYEE',
      action: 'UPDATE',
      recordId: employeeId,
      oldData: { designation: employeeToUpdate.designation },
      newData: { designation: newRole },
    });

    revalidatePath('/dashboard/admin/employees')
    return { success: true }
  } catch (error: any) {
    console.error("Update Role Error:", error)
    const errorMsg = error.message || "";
    if (errorMsg === "Unauthorized") return { error: "Your login session has expired. Please refresh the page to log in again." }
    return { error: errorMsg || "Failed to update role" }
  }
}

export async function updateEmployeeStatus(employeeId: string, status: string) {
  if (employeeId.length < 10) return { error: "Cannot modify demo data." }

  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;
    if (!user) throw new Error("Unauthorized")

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
    if (!dbUser) throw new Error("User not found in database")

    const employeeToUpdate = await prisma.employee.findUnique({ where: { id: employeeId } });
    const isSuperAdmin = dbUser.role === "SUPER_ADMIN";

    if (!employeeToUpdate || (!isSuperAdmin && employeeToUpdate.companyId !== dbUser.companyId)) {
      throw new Error("Employee not found or access denied.");
    }

    await prisma.employee.update({
      where: { id: employeeId },
      data: { status: status as EmployeeStatus }
    })

    await logAudit({
      companyId: dbUser.companyId,
      userId: user.id,
      module: 'EMPLOYEE',
      action: 'UPDATE',
      recordId: employeeId,
      oldData: { status: employeeToUpdate.status },
      newData: { status },
    });

    revalidatePath('/dashboard/admin/employees')
    return { success: true }
  } catch (error: any) {
    console.error("Update Status Error:", error)
    const errorMsg = error.message || "";
    if (errorMsg === "Unauthorized") return { error: "Your login session has expired. Please refresh the page to log in again." }
    return { error: errorMsg || "Failed to update status" }
  }
}

import { sendEmployeeWelcomeEmail } from '@/lib/mail';

import { z } from "zod";

const createEmployeeSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  email: z.string().email("Invalid email format"),
  jobTitle: z.string().min(1, "Job title is required").max(100),
  baseSalary: z.number().min(0).optional(),
  loginUrl: z.string().url().optional(),
});

export async function createEmployee(rawData: {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  baseSalary?: number;
  loginUrl?: string;
}) {
  try {
    const parsed = createEmployeeSchema.safeParse(rawData);
    if (!parsed.success) {
      return { error: parsed.error.issues[0].message };
    }
    const data = parsed.data;
    const session = await getServerSession(authOptions);
    const user = session?.user;
    if (!user) throw new Error("Unauthorized")

    let dbUser = await prisma.user.findUnique({ where: { id: user.id } })

    // Auto-provision if the user signed up before the Prisma schema was fully integrated
    if (!dbUser) {
      const company = await prisma.company.create({
        data: {
          name: "NexaHR Company",
          website: user.email?.split('@')[1] || "company.com"
        }
      })

      dbUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email!,
          companyId: company.id,
          role: "SUPER_ADMIN"
        }
      })
    }

    const empCount = await prisma.employee.count({ where: { companyId: dbUser.companyId } });

    // Generate a unique employee code robustly
    const lastEmployee = await prisma.employee.findFirst({
      where: { companyId: dbUser.companyId, employeeCode: { startsWith: 'EMP-' } },
      orderBy: { employeeCode: 'desc' }
    });

    let nextNumber = 1;
    if (lastEmployee) {
      const lastNumber = parseInt(lastEmployee.employeeCode.replace('EMP-', ''), 10);
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      } else {
        // Fallback if parsing fails
        nextNumber = empCount + 100; // Jump ahead to avoid collisions
      }
    }
    const employeeCode = `EMP-${nextNumber.toString().padStart(3, '0')}`

    // Check if employee already exists
    let employeeUser = await prisma.user.findUnique({
      where: { email: data.email },
      include: { employee: true }
    })

    if (employeeUser && employeeUser.employee) {
      return { error: "An employee with this email address already exists in the system." }
    }

    let targetUserId = employeeUser?.id;

    if (!targetUserId) {
      const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase() + "!";
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      const newUser = await prisma.user.upsert({
        where: { email: data.email },
        update: {
          companyId: dbUser.companyId,
          role: "EMPLOYEE",
          password: hashedPassword
        },
        create: {
          email: data.email,
          companyId: dbUser.companyId,
          role: "EMPLOYEE",
          password: hashedPassword
        }
      })
      targetUserId = newUser.id;
      data.loginUrl = tempPassword; // pass the password down
    } else {
      // If targetUserId already existed (User record exists but no Employee record)
      const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase() + "!";
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      await prisma.user.update({
        where: { id: targetUserId },
        data: { password: hashedPassword }
      });
      data.loginUrl = tempPassword;
    }

    // 2. Create the Employee record
    const createdEmployee = await prisma.employee.create({
      data: {
        companyId: dbUser.companyId,
        userId: targetUserId,
        firstName: data.firstName,
        lastName: data.lastName,
        workEmail: data.email,
        designation: data.jobTitle,
        employeeCode: employeeCode,
        joiningDate: new Date(),
        status: 'ACTIVE',
        baseSalary: data.baseSalary ?? null,
      }
    })

    await logAudit({
      companyId: dbUser.companyId,
      userId: user.id,
      module: 'EMPLOYEE',
      action: 'CREATE',
      recordId: createdEmployee.id,
      newData: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,        // work email — not a password
        jobTitle: data.jobTitle,
        employeeCode,
      },
    });

    let emailSent = false;
    if (data.loginUrl) { // loginUrl currently holds the temp password
      const appUrl = await getAppUrl();
      emailSent = await sendEmployeeWelcomeEmail(
        data.email,
        data.firstName,
        data.loginUrl, // tempPassword
        `${appUrl}/login`
      );
    } else {
      console.warn("No temporary password was generated to send to the employee.");
    }

    revalidatePath('/dashboard/admin')
    revalidatePath('/dashboard/admin/employees')
    return { success: true, emailSent }
  } catch (error: any) {
    console.error("Create Employee Error:", error)
    const errorMsg = error.message || "";
    if (errorMsg === "Unauthorized") {
      return { error: "Your login session has expired. Please refresh the page to log in again." }
    }
    if (errorMsg.includes("Can't reach database server") || errorMsg.includes("timed out") || errorMsg.includes("connection")) {
      return { error: "DEMO_MODE_OFFLINE" }
    }
    return { error: errorMsg || "Failed to create employee" }
  }
}

export async function deleteEmployee(employeeId: string) {
  if (employeeId.length < 10) return { error: "Cannot modify demo data." }

  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;
    if (!user) throw new Error("Unauthorized")

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
    if (!dbUser) throw new Error("User not found in database")

    const employeeToDelete = await prisma.employee.findUnique({
      where: { id: employeeId }
    })

    const isSuperAdmin = dbUser.role === "SUPER_ADMIN";

    if (!employeeToDelete || (!isSuperAdmin && employeeToDelete.companyId !== dbUser.companyId)) {
      return { error: "Employee not found or you don't have permission to delete them." }
    }


    // Manually delete related records in a fast transaction to avoid timeouts
    await prisma.$transaction([
      prisma.payslip.deleteMany({ where: { employeeId: employeeId } }),
      prisma.attendance.deleteMany({ where: { employeeId: employeeId } }),
      prisma.leaveRequest.deleteMany({ where: { employeeId: employeeId } }),
      prisma.document.deleteMany({ where: { employeeId: employeeId } }),
      prisma.goal.deleteMany({ where: { employeeId: employeeId } }),
      prisma.employee.delete({ where: { id: employeeId } })
    ]);

    await logAudit({
      companyId: dbUser.companyId,
      userId: user.id,
      module: 'EMPLOYEE',
      action: 'DELETE',
      recordId: employeeId,
      oldData: {
        firstName: employeeToDelete.firstName,
        lastName: employeeToDelete.lastName,
        employeeCode: employeeToDelete.employeeCode,
        status: employeeToDelete.status,
      },
    });

    if (employeeToDelete.userId) {
      try {
        // Delete associated user, accounts, and sessions in a single transaction
        await prisma.$transaction([
          prisma.account.deleteMany({ where: { userId: employeeToDelete.userId } }),
          prisma.session.deleteMany({ where: { userId: employeeToDelete.userId } }),
          prisma.user.delete({ where: { id: employeeToDelete.userId } })
        ]);
      } catch (e) {
        console.warn("Could not delete user record, it might be referenced elsewhere.");
      }
    }

    revalidatePath('/dashboard/admin')
    revalidatePath('/dashboard/admin/employees')
    return { success: true }
  } catch (error: any) {
    console.error("Delete Employee Error:", error)
    const errorMsg = error.message || "";
    if (errorMsg === "Unauthorized") return { error: "Your login session has expired. Please refresh the page to log in again." }
    return { error: errorMsg || "Failed to delete employee" }
  }
}
