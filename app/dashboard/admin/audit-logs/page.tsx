import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { canViewAuditLogs } from '@/lib/permissions';
import { Suspense } from 'react';
import { AuditLogClient } from './AuditLogClient';
import { Shield } from 'lucide-react';

export default function AuditLogsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] dark:text-[#F3F4F6]">Audit Logs</h1>
          <p className="text-[#6B7280] dark:text-[#9CA3AF] text-sm">Complete activity trail — who did what and when.</p>
        </div>
      </div>
      <Suspense fallback={<div className="animate-pulse space-y-3">{[...Array(8)].map((_,i)=><div key={i} className="h-12 bg-[#F3F4F6] dark:bg-[#1E293B] rounded-xl"/>)}</div>}>
        <AuditData />
      </Suspense>
    </div>
  );
}

async function AuditData() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');
  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!dbUser || !canViewAuditLogs(dbUser.role)) redirect('/dashboard/admin');
  const logs = await prisma.auditLog.findMany({
    where: { companyId: dbUser.companyId },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
  const userIds = [...new Set(logs.map(l => l.userId).filter(Boolean))] as string[];
  const users = userIds.length ? await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, email: true } }) : [];
  const userMap: Record<string, string> = {};
  users.forEach(u => { userMap[u.id] = u.email; });
  const serialized = logs.map(l => ({
    id: l.id, module: l.module, action: l.action, recordId: l.recordId,
    userId: l.userId, userEmail: l.userId ? (userMap[l.userId] ?? l.userId.slice(0,8)+'...') : 'System',
    ipAddress: l.ipAddress ?? null,
    oldData: l.oldData ? JSON.stringify(l.oldData).slice(0, 120) : null,
    newData: l.newData ? JSON.stringify(l.newData).slice(0, 120) : null,
    createdAt: l.createdAt.toISOString(),
  }));
  return <AuditLogClient logs={serialized} />;
}
