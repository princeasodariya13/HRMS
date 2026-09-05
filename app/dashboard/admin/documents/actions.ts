"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { uploadToGoogleDrive } from "@/lib/googleDrive";
import { logAudit } from "@/lib/auditLog";

export async function verifyDocument(documentId: string) {
  const session = await getServerSession(authOptions);
    const user = session?.user;

  if (!user) throw new Error("Unauthorized");

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { companyId: true, role: true }
    });

    if (!dbUser || dbUser.role === 'EMPLOYEE') {
      throw new Error("Unauthorized to verify documents");
    }

    const doc = await prisma.document.findUnique({
      where: { id: documentId },
      include: { employee: true }
    });

    if (!doc || doc.employee.companyId !== dbUser.companyId) {
      return { error: "Document not found or access denied" };
    }

    await prisma.document.update({
      where: { id: documentId },
      data: { isVerified: true }
    });

    await logAudit({
      companyId: dbUser.companyId,
      userId: user.id,
      module: 'DOCUMENT',
      action: 'UPDATE',
      recordId: documentId,
      oldData: { isVerified: false },
      newData: { isVerified: true },
    });

    revalidatePath("/dashboard", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("Verify document error:", error);
    return { error: "Failed to verify document" };
  }
}

export async function createPolicy(data: { title: string, description: string, category: string, effectiveDate: Date }) {
  const session = await getServerSession(authOptions);
    const user = session?.user;

  if (!user) throw new Error("Unauthorized");

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { companyId: true, role: true }
    });

    if (!dbUser || dbUser.role === 'EMPLOYEE') {
      throw new Error("Unauthorized");
    }

    await prisma.policy.create({
      data: {
        companyId: dbUser.companyId,
        title: data.title,
        description: data.description,
        category: data.category,
        effectiveDate: data.effectiveDate,
        isActive: true
      }
    });

    revalidatePath("/dashboard", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("Create policy error:", error);
    return { error: "Failed to create policy" };
  }
}

export async function uploadAdminDocument(formData: FormData) {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  if (!user) throw new Error("Unauthorized");

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { companyId: true, role: true, id: true, email: true, employee: { select: { id: true } } }
    });

    if (!dbUser || dbUser.role === 'EMPLOYEE') {
      throw new Error("Unauthorized to upload company documents");
    }

    const title = formData.get("title") as string;
    const type = formData.get("type") as any;
    const file = formData.get("file") as File;

    if (!title || !type || !file) {
      throw new Error("Missing required fields");
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error("File size must be less than 5MB for security reasons");
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error("Invalid file type. Only PDF, images, and Word documents are allowed.");
    }

    // --- Resolve a valid employeeId ---
    // The Document model requires a valid employeeId. If admin has no employee record,
    // we must create one to avoid saving an empty string (which breaks the company filter).
    let employeeId = dbUser.employee?.id;

    if (!employeeId) {
      // Check if a record was created between queries
      const existing = await prisma.employee.findUnique({ where: { userId: dbUser.id } });
      if (existing) {
        employeeId = existing.id;
      } else {
        // Create a minimal admin employee record
        const empCount = await prisma.employee.count({ where: { companyId: dbUser.companyId } });
        const newEmp = await prisma.employee.create({
          data: {
            companyId: dbUser.companyId,
            userId: dbUser.id,
            firstName: "Admin",
            lastName: "User",
            workEmail: dbUser.email ?? "",
            employeeCode: `ADM-${(empCount + 1).toString().padStart(3, "0")}`,
            joiningDate: new Date(),
            designation: "Administrator",
            status: "ACTIVE",
          }
        });
        employeeId = newEmp.id;
      }
    }

    let fileUrl = "";

    try {
      const driveRes = await uploadToGoogleDrive(dbUser.companyId, file, title);
      fileUrl = driveRes.webViewLink || driveRes.webContentLink || "";
    } catch (e: any) {
      console.warn("Google Drive upload failed. Falling back to placeholder.", e);
      fileUrl = "https://placeholder.url/doc";
    }

    const createdDoc = await prisma.document.create({
      data: {
        employeeId: employeeId,
        title: title,
        type: type,
        fileUrl: fileUrl,
        isVerified: true,
      }
    });

    await logAudit({
      companyId: dbUser.companyId,
      userId: user.id,
      module: 'DOCUMENT',
      action: 'CREATE',
      recordId: createdDoc.id,
      newData: { title, type, fileUrl, isVerified: true },
    });

    revalidatePath("/dashboard/admin/documents");
    revalidatePath("/dashboard", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("Upload error:", error);
    return { error: error.message || "Failed to upload document" };
  }
}
