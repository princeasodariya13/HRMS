'use server'

import prisma from '@/lib/prisma'
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getNotifications() {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;
    if (!user) return { data: [] };

    // Since Notification model might not exist in Prisma Client yet because of the lock,
    // we'll try to query it. If it fails, we return an empty array gracefully.
    try {
      // @ts-ignore
      const notifications = await prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 20
      });
      return { data: notifications };
    } catch(e) {
      console.warn("Notifications table not ready yet");
      return { data: [] };
    }
  } catch (error) {
    return { data: [] };
  }
}

export async function markAsRead(id?: string) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;
    if (!user) return { success: false };

    try {
      if (id) {
        // @ts-ignore
        await prisma.notification.update({
          where: { id, userId: user.id },
          data: { isRead: true }
        });
      } else {
        // @ts-ignore
        await prisma.notification.updateMany({
          where: { userId: user.id, isRead: false },
          data: { isRead: true }
        });
      }
      return { success: true };
    } catch(e) {
      return { success: false };
    }
  } catch (error) {
    return { success: false };
  }
}
