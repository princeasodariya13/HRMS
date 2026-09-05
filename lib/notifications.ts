import prisma from '@/lib/prisma';
import { transporter } from '@/lib/mail';

interface CreateNotificationParams {
  userId: string;
  companyId: string;
  title: string;
  message: string;
  type: string;
  link?: string;
}

export async function createNotification(params: CreateNotificationParams): Promise<void> {
  try {
    await prisma.notification.create({
      data: { userId: params.userId, companyId: params.companyId, title: params.title, message: params.message, type: params.type, isRead: false, link: params.link },
    });
  } catch (err) {
    console.warn('[Notification] Failed to create in-app notification:', err);
  }
}

const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
const fromName = process.env.SMTP_FROM_NAME || 'NexaHR AI';
const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER || '';
function canSendEmail() { return !!(process.env.SMTP_USER && process.env.SMTP_PASS); }

export async function sendLeaveDecisionEmail(params: { toEmail: string; employeeName: string; status: 'APPROVED' | 'REJECTED'; totalDays: number; leaveTypeName?: string; rejectionReason?: string; }): Promise<boolean> {
  if (!canSendEmail()) return false;
  const { toEmail, employeeName, status, totalDays, leaveTypeName = 'Leave', rejectionReason } = params;
  const isApproved = status === 'APPROVED';
  try {
    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: toEmail,
      subject: `${isApproved ? '✅' : '❌'} Your ${leaveTypeName} Request - ${status}`,
      html: `<div style="font-family:Arial,sans-serif;padding:24px"><h2>${isApproved ? '✅' : '❌'} Leave ${status}</h2><p>Hi ${employeeName}, your ${leaveTypeName} for ${totalDays} day(s) has been ${status.toLowerCase()}.${rejectionReason ? ' Reason: ' + rejectionReason : ''}</p><a href="${appUrl}/dashboard/employee/leaves" style="background:#111827;color:#fff;padding:10px 20px;text-decoration:none;border-radius:8px">View Leaves</a></div>`,
    });
    return true;
  } catch (e) { console.error('[Email] leave decision:', e); return false; }
}

export async function sendPayslipReadyEmail(params: { toEmail: string; employeeName: string; period: string; }): Promise<boolean> {
  if (!canSendEmail()) return false;
  const { toEmail, employeeName, period } = params;
  try {
    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: toEmail,
      subject: `💰 Your Payslip for ${period} is Ready`,
      html: `<div style="font-family:Arial,sans-serif;padding:24px"><h2>💰 Payslip Ready</h2><p>Hi ${employeeName}, your payslip for ${period} is now available.</p><a href="${appUrl}/dashboard/employee/payroll" style="background:#111827;color:#fff;padding:10px 20px;text-decoration:none;border-radius:8px">View Payslip</a></div>`,
    });
    return true;
  } catch (e) { console.error('[Email] payslip ready:', e); return false; }
}

export async function sendAttendanceAnomalyEmail(params: { toEmail: string; hrName: string; anomalyReport: string; }): Promise<boolean> {
  if (!canSendEmail()) return false;
  const { toEmail, hrName, anomalyReport } = params;
  try {
    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: toEmail,
      subject: `⚠️ AI Attendance Anomaly Detected`,
      html: `<div style="font-family:Arial,sans-serif;padding:24px"><h2 style="color:#EF4444">⚠️ Attendance Anomaly</h2><p>Hi ${hrName},</p><pre style="background:#FEF2F2;padding:16px;border-radius:8px">${anomalyReport}</pre><a href="${appUrl}/dashboard/admin/attendance" style="background:#111827;color:#fff;padding:10px 20px;text-decoration:none;border-radius:8px">View Attendance</a></div>`,
    });
    return true;
  } catch (e) { console.error('[Email] anomaly:', e); return false; }
}
