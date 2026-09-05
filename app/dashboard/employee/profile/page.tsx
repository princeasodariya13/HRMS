import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { ProfileForm } from "./ProfileForm";
import { User, Building, Briefcase, Mail, Calendar, Hash, ShieldCheck } from "lucide-react";

export default async function EmployeeProfilePage() {
  const session = await getServerSession(authOptions);
    const user = session?.user;

  if (!user) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { 
      employee: {
        include: {
          department: true,
          company: true
        }
      } 
    }
  });

  if (!dbUser || !dbUser.employee) {
    redirect("/dashboard");
  }

  const employee = dbUser.employee;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#111827] dark:text-[#F3F4F6]">My Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Read-Only Overview */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-6 border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm relative overflow-hidden">
            {/* Header / Avatar */}
            <div className="flex flex-col items-center text-center pb-6 border-b border-gray-100">
              <div className="w-24 h-24 bg-gradient-to-tr from-[#0F172A] to-slate-600 rounded-full flex items-center justify-center shadow-lg mb-4 text-white dark:text-[#111827] text-3xl font-bold">
                {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
              </div>
              <h2 className="text-xl font-bold text-[#111827] dark:text-[#F3F4F6]">
                {employee.firstName} {employee.lastName}
              </h2>
              <p className="text-sm font-medium text-gray-500 mt-1">
                {employee.designation || "Employee"}
              </p>
              
              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold uppercase tracking-wide">
                <ShieldCheck className="w-3.5 h-3.5" />
                {employee.status}
              </div>
            </div>

            {/* Read-Only Stats */}
            <div className="pt-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-50 dark:bg-[#1E293B]/50 text-gray-400 dark:text-gray-500 rounded-lg shrink-0">
                  <Hash className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Employee ID</p>
                  <p className="text-sm font-semibold text-[#111827] dark:text-[#F3F4F6] mt-0.5">{employee.employeeCode}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-50 dark:bg-[#1E293B]/50 text-gray-400 dark:text-gray-500 rounded-lg shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Work Email</p>
                  <p className="text-sm font-semibold text-[#111827] dark:text-[#F3F4F6] mt-0.5 break-all">{employee.workEmail}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-50 dark:bg-[#1E293B]/50 text-gray-400 dark:text-gray-500 rounded-lg shrink-0">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Company</p>
                  <p className="text-sm font-semibold text-[#111827] dark:text-[#F3F4F6] mt-0.5">{employee.company?.name || "NexaHR"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-50 dark:bg-[#1E293B]/50 text-gray-400 dark:text-gray-500 rounded-lg shrink-0">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Department</p>
                  <p className="text-sm font-semibold text-[#111827] dark:text-[#F3F4F6] mt-0.5">{employee.department?.name || "Not Assigned"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-50 dark:bg-[#1E293B]/50 text-gray-400 dark:text-gray-500 rounded-lg shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Date of Joining</p>
                  <p className="text-sm font-semibold text-[#111827] dark:text-[#F3F4F6] mt-0.5">
                    {new Date(employee.joiningDate).toLocaleDateString(undefined, { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Editable Form */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm">
            <h2 className="text-lg font-bold text-[#111827] dark:text-[#F3F4F6] mb-6 flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </h2>
            <ProfileForm employee={{
              firstName: employee.firstName,
              lastName: employee.lastName,
              designation: employee.designation,
              personalEmail: employee.personalEmail,
              phone: employee.phone
            }} />
          </div>
        </div>

      </div>
    </div>
  );
}
