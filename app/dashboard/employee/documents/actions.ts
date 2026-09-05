"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

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

  const title = formData.get("title") as string;
  const type = formData.get("type") as any;
  const file = formData.get("file") as File;

  if (!title || !type || !file) {
    return { error: "Missing required fields" };
  }

  // For this implementation, we will simulate the upload by creating a record with a dummy URL
  // representing the securely stored file.
  const dummyFileUrl = `/secure-storage/${dbUser.companyId}/${dbUser.employee.id}/${file.name}`;

  try {
    await prisma.document.create({
      data: {
        employeeId: dbUser.employee.id,
        title: title,
        type: type,
        fileUrl: dummyFileUrl,
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
