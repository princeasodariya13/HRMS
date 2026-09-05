import { Briefcase, Users, UserPlus, CheckCircle, Bot, AlertCircle } from "lucide-react";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { CreateJobModal } from "./CreateJobModal";

export default async function RecruitmentPage() {
  const session = await getServerSession(authOptions);
    const user = session?.user;

  if (!user) {
    redirect('/login');
  }

  // Get user's company
  let dbUser = null;
  // Initialize stats
  let openJobs = 0;
  let totalCandidates = 0;
  let interviewing = 0;
  let hired = 0;
  let recentJobs: any[] = [];
  let aiCandidates: any[] = [];
  let isDemo = true;

  try {
    dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { companyId: true }
    });

    const companyId = dbUser?.companyId;

    if (companyId) {
      const [jobsCount, fetchedJobs] = await Promise.all([
        prisma.job.count({ where: { companyId, isActive: true } }),
        prisma.job.findMany({
          where: { companyId, isActive: true },
          include: { _count: { select: { candidates: true } } },
          orderBy: { createdAt: 'desc' },
          take: 5
        })
      ]);

      // Get candidate stats through the Job relation
      const allCandidates = await prisma.candidate.findMany({
        where: { job: { companyId } },
        include: { job: true },
        orderBy: { createdAt: 'desc' }
      });

      const interviewStatuses = ['INTERVIEW_SCHEDULED', 'INTERVIEWED'];
      
      openJobs = jobsCount;
      totalCandidates = allCandidates.length;
      interviewing = allCandidates.filter(c => interviewStatuses.includes(c.status)).length;
      hired = allCandidates.filter(c => c.status === 'HIRED').length;

      recentJobs = fetchedJobs.map(job => ({
        id: job.id,
        title: job.title,
        department: job.department,
        candidateCount: job._count.candidates
      }));

      // Get AI-scored candidates
      aiCandidates = allCandidates
        .filter(c => c.aiMatchScore !== null)
        .sort((a, b) => Number(b.aiMatchScore || 0) - Number(a.aiMatchScore || 0))
        .slice(0, 3)
        .map(c => ({
          id: c.id,
          firstName: c.firstName,
          lastName: c.lastName,
          jobTitle: c.job?.title || 'Unknown Role',
          aiMatchScore: Number(c.aiMatchScore || 0),
        }));

      // Check if the DB is actually populated or empty
      if (jobsCount > 0 || allCandidates.length > 0) {
        isDemo = false;
      }
    }
  } catch (error) {
    console.warn("Prisma Database connection failed in Recruitment:. Next.js Dev overlay suppressed.");
  }

  // Fallback demo data if DB is completely empty
  if (isDemo) {
    // Rely strictly on real database data and show empty state
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] dark:text-[#F3F4F6]">Recruitment Dashboard</h1>
          <p className="text-[#6B7280] dark:text-[#9CA3AF] dark:text-[#6B7280] text-sm">Manage job postings, candidates, and interview pipelines.</p>
        </div>
        <div className="flex items-center gap-3">
          <CreateJobModal />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#6B7280] dark:text-[#9CA3AF] dark:text-[#6B7280]">Open Jobs</h3>
            <div className="w-8 h-8 rounded-full bg-[#F3F4F6] dark:bg-[#1E293B] flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-[#111827] dark:text-[#F3F4F6]" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[#111827] dark:text-[#F3F4F6]">{openJobs}</p>
        </div>
        
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#6B7280] dark:text-[#9CA3AF] dark:text-[#6B7280]">Total Candidates</h3>
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[#111827] dark:text-[#F3F4F6]">{totalCandidates}</p>
        </div>

        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#6B7280] dark:text-[#9CA3AF] dark:text-[#6B7280]">Interviews Scheduled</h3>
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[#111827] dark:text-[#F3F4F6]">{interviewing}</p>
        </div>

        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#6B7280] dark:text-[#9CA3AF] dark:text-[#6B7280]">Offers Accepted</h3>
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[#111827] dark:text-[#F3F4F6]">{hired}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Active Jobs Table */}
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-[#E5E7EB] dark:border-[#1E293B] flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#111827] dark:text-[#F3F4F6]">Active Job Postings</h3>
            <button className="text-sm font-semibold text-[#111827] dark:text-[#F3F4F6] hover:underline">View All</button>
          </div>
          <div className="flex-1 overflow-x-auto min-h-[250px]">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#F8FAFC] dark:bg-[#1E293B] border-b border-[#E5E7EB] dark:border-[#1E293B] text-[#6B7280] dark:text-[#9CA3AF] dark:text-[#6B7280]">
                <tr>
                  <th className="px-6 py-3 font-semibold">Job Title</th>
                  <th className="px-6 py-3 font-semibold">Department</th>
                  <th className="px-6 py-3 font-semibold text-right">Applicants</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#1E293B]">
                {recentJobs.map((job: any) => (
                  <tr key={job.id} className="hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/50 dark:bg-[#1E293B] transition-colors">
                    <td className="px-6 py-4 font-medium text-[#111827] dark:text-[#F3F4F6]">{job.title}</td>
                    <td className="px-6 py-4 text-[#6B7280] dark:text-[#9CA3AF] dark:text-[#6B7280]">{job.department}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="bg-[#F1F5F9] dark:bg-[#1E293B] text-[#111827] dark:text-[#F3F4F6] px-2.5 py-1 rounded-md text-xs font-semibold">
                        {job.candidateCount || 0}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentJobs.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-[#6B7280] dark:text-[#9CA3AF] dark:text-[#6B7280]">
                      No active job postings.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
