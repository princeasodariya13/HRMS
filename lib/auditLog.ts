import prisma from "@/lib/prisma";

interface AuditLogParams {
  companyId: string;
  userId?: string;
  module: string;      // e.g. "EMPLOYEE", "LEAVE", "PAYROLL", "DOCUMENT"
  action: string;      // e.g. "CREATE", "UPDATE", "DELETE", "APPROVE", "REJECT"
  recordId: string;    // ID of the affected record
  oldData?: Record<string, any> | null;
  newData?: Record<string, any> | null;
}

/**
 * Writes a compliance audit log entry to the AuditLog collection.
 *
 * Wrapped in try/catch — a logging failure NEVER propagates to the caller.
 * Safe to call fire-and-forget after any successful DB write.
 *
 * ⚠️  Never pass plaintext passwords in oldData / newData.
 *     Strip sensitive fields before calling this function.
 */
export async function logAudit(params: AuditLogParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        companyId: params.companyId,
        userId:    params.userId   ?? "",
        module:    params.module,
        action:    params.action,
        recordId:  params.recordId,
        oldData:   params.oldData  ?? undefined,
        newData:   params.newData  ?? undefined,
      },
    });
  } catch (err) {
    // Silently swallow — compliance logging must never break business logic
    console.warn(`[AuditLog] Failed to write audit entry (${params.module}/${params.action}):`, err);
  }
}
