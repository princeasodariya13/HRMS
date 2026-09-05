"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { uploadToGoogleDrive } from "@/lib/googleDrive";
import type { DocumentType } from "@prisma/client";

export async function uploadDocument(formData: FormData) {
  const session = await getServerSession(authOptions);
    const user = session?.user;

  if (!user) throw new Error("Unauthorized");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { employee: true }
  });

  if (!dbUser || !dbUser.employee) {
    throw new Error("Employee not found");
  }

  const title = (formData.get("title") as string)?.trim();
  const type = formData.get("type") as string;
  const file = formData.get("file") as File;

  if (!title || !type || !(file instanceof File) || file.size === 0) {
    return { error: "Missing required fields" };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { error: "File size must be less than 5MB" };
  }

  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (!allowedTypes.includes(file.type)) {
    return { error: "Invalid file type. Use PDF, JPG, PNG, DOC, or DOCX." };
  }

  const allowedDocumentTypes = ["IDENTITY", "CERTIFICATE", "CONTRACT", "POLICY", "OTHER"];
  if (!allowedDocumentTypes.includes(type)) {
    return { error: "Invalid document type" };
  }
  const documentType = type as DocumentType;

  try {
    const driveRes = await uploadToGoogleDrive(dbUser.companyId, file, title);
    const fileUrl = driveRes.webViewLink || driveRes.webContentLink;

    if (!fileUrl) {
      return { error: "The file was uploaded but no view link was returned." };
    }

    await prisma.document.create({
      data: {
        employeeId: dbUser.employee.id,
        title: title,
        type: documentType,
        fileUrl,
        isVerified: false
      }
    });

    revalidatePath("/dashboard/employee/documents");
    return { success: true };
  } catch (error: any) {
    console.error("Upload error:", error);
    return { error: "Failed to upload document" };
  }
}

export async function deleteDocument(documentId: string) {
  const session = await getServerSession(authOptions);
    const user = session?.user;

  if (!user) throw new Error("Unauthorized");

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { employee: true }
    });

    if (!dbUser?.employee) throw new Error("Employee not found");

    const doc = await prisma.document.findUnique({
      where: { id: documentId }
    });

    if (!doc || doc.employeeId !== dbUser.employee.id) {
      return { error: "Document not found or access denied" };
    }

    await prisma.document.delete({
      where: { id: documentId }
    });

    revalidatePath("/dashboard/employee/documents");
    return { success: true };
  } catch (error: any) {
    console.error("Delete error:", error);
    return { error: "Failed to delete document" };
  }
}
