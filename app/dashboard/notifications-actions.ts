'use server'
import prisma from '@/lib/prisma'
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getNotifications() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { data: [] };
    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    return { data: notifications };
  } catch (error) {
    console.warn("getNotifications error:", error);
    return { data: [] };
  }
}

export async function markAsRead(id?: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false };
    if (id) {
      await prisma.notification.update({ where: { id, userId: session.user.id }, data: { isRead: true } });
    } else {
      await prisma.notification.updateMany({ where: { userId: session.user.id, isRead: false }, data: { isRead: true } });
    }
    return { success: true };
  } catch (error) {
    console.warn("markAsRead error:", error);
    return { success: false };
  }
}
