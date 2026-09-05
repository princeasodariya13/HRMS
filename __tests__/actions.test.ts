import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { createEmployee } from '@/app/dashboard/admin/employees/actions';
import { updateLeaveStatus } from '@/app/dashboard/admin/leaves/actions';


// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      create: vi.fn(),
    },
    employee: {
      findFirst: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
    },
    company: {
      create: vi.fn(),
    },
    leaveRequest: {
      update: vi.fn(),
    },
    notification: {
      create: vi.fn(),
    },
    payrollRun: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    payslip: {
      createMany: vi.fn(),
    },
    $transaction: vi.fn((cb) => cb(prisma)), // Simple pass-through for transactions
  }
}));

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
  default: vi.fn()
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn()
}));

vi.mock('@/lib/auditLog', () => ({
  logAudit: vi.fn()
}));

vi.mock('@/lib/mail', () => ({
  sendEmployeeWelcomeEmail: vi.fn().mockResolvedValue(true)
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue({ get: () => 'http://localhost:3000' })
}));

describe('Server Actions Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default session mock
    (getServerSession as any).mockResolvedValue({
      user: { id: 'admin-user-id', email: 'admin@test.com' }
    });
  });

  describe('createEmployee', () => {
    it('should reject duplicate email', async () => {
      // Mock that the admin user exists
      (prisma.user.findUnique as any).mockImplementation((args: any) => {
        if (args.where.id === 'admin-user-id') {
          return Promise.resolve({ id: 'admin-user-id', companyId: 'company-1', role: 'SUPER_ADMIN' });
        }
        if (args.where.email === 'duplicate@test.com') {
          return Promise.resolve({ id: 'existing-id', employee: { id: 'emp-1' } });
        }
        return Promise.resolve(null);
      });

      const result = await createEmployee({
        firstName: 'John',
        lastName: 'Doe',
        email: 'duplicate@test.com',
        jobTitle: 'Developer'
      });

      expect(result.error).toBe('An employee with this email address already exists in the system.');
    });

    it('should create an employee successfully', async () => {
      (prisma.user.findUnique as any).mockImplementation((args: any) => {
        if (args.where.id === 'admin-user-id') {
          return Promise.resolve({ id: 'admin-user-id', companyId: 'company-1', role: 'SUPER_ADMIN' });
        }
        return Promise.resolve(null);
      });

      (prisma.employee.findFirst as any).mockResolvedValue(null);
      (prisma.user.upsert as any).mockResolvedValue({ id: 'new-user-id' });
      (prisma.employee.create as any).mockResolvedValue({ id: 'new-emp-id' });

      const result = await createEmployee({
        firstName: 'John',
        lastName: 'Doe',
        email: 'new@test.com',
        jobTitle: 'Developer'
      });

      expect(result.success).toBe(true);
      expect(prisma.employee.create).toHaveBeenCalled();
    });
  });

  describe('updateLeaveStatus', () => {
    it('should approve a leave and trigger notification', async () => {
      (prisma.user.findUnique as any).mockResolvedValue({
        id: 'admin-user-id',
        companyId: 'company-1'
      });

      (prisma.leaveRequest.update as any).mockResolvedValue({
        id: 'leave-1',
        totalDays: 2,
        leaveTypeId: 'type-1',
        employee: { userId: 'emp-user-id' }
      });

      const result = await updateLeaveStatus('valid-leave-id', 'APPROVED');

      expect(result.success).toBe(true);
      expect(prisma.leaveRequest.update).toHaveBeenCalledWith(expect.objectContaining({
        data: { status: 'APPROVED' }
      }));
      expect(prisma.notification.create).toHaveBeenCalled();
    });
  });

});
