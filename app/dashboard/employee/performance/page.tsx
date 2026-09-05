import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { 
  Target, 
  TrendingUp, 
  Award,
  CheckCircle2,
  Clock,
  PauseCircle,
  AlertCircle
} from "lucide-react";

export default async function EmployeePerformancePage() {
  const session = await getServerSession(authOptions);
    const user = session?.user;

  if (!user) {
    redirect("/login");
  }

  let employee = null;
  let goals: any[] = [];
  let stats = {
    total: 0,
    completed: 0,
    inProgress: 0,
    completionRate: 0
  };
  
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { employee: true }
    });

    if (dbUser && dbUser.employee) {
      employee = dbUser.employee;
      
      // Try to fetch goals if the model exists, otherwise fallback to empty array
      try {
        // @ts-ignore
        if (prisma.goal) {
          // @ts-ignore
          goals = await prisma.goal.findMany({
            where: { employeeId: employee.id },
            orderBy: { dueDate: 'asc' }
          });
        }
      } catch (e) {
        console.warn("Goals table not ready yet");
      }
      
      stats.total = goals.length;
      goals.forEach(goal => {
        if (goal.status === 'COMPLETED') stats.completed++;
        if (goal.status === 'IN_PROGRESS') stats.inProgress++;
      });
      
      if (stats.total > 0) {
        stats.completionRate = Math.round((stats.completed / stats.total) * 100);
      }
    }
  } catch (error) {
    console.error("Database connection issue.", error);
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'IN_PROGRESS': return <TrendingUp className="w-5 h-5 text-blue-500" />;
      case 'ON_HOLD': return <PauseCircle className="w-5 h-5 text-amber-500" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED': return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case 'IN_PROGRESS': return "bg-blue-100 text-blue-700 border-blue-200";
      case 'ON_HOLD': return "bg-amber-100 text-amber-700 border-amber-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] dark:text-[#F3F4F6]">Performance & Goals</h1>
          <p className="text-gray-500 mt-1">Track your objectives, milestones, and overall performance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-[#111827] to-[#374151] rounded-3xl p-6 text-white dark:text-[#111827] shadow-lg relative overflow-hidden">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center gap-3 text-gray-300 mb-4">
              <Award className="w-5 h-5 text-yellow-400" />
              <h3 className="font-medium">Completion Rate</h3>
            </div>
            <div>
              <span className="text-4xl font-bold">{stats.completionRate}%</span>
              <p className="text-sm text-gray-300 mt-1">Of total assigned goals</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-6 border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 text-gray-600 mb-4">
            <Target className="w-5 h-5 text-blue-600" />
            <h3 className="font-medium">Total Goals</h3>
          </div>
          <div>
            <span className="text-4xl font-bold text-[#111827] dark:text-[#F3F4F6]">{stats.total}</span>
            <p className="text-sm font-medium text-gray-500 mt-1">Assigned this year</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-6 border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 text-gray-600 mb-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <h3 className="font-medium">Completed</h3>
          </div>
          <div>
            <span className="text-4xl font-bold text-[#111827] dark:text-[#F3F4F6]">{stats.completed}</span>
            <p className="text-sm font-medium text-gray-500 mt-1">Successfully finished</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-6 border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 text-gray-600 mb-4">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            <h3 className="font-medium">In Progress</h3>
          </div>
          <div>
            <span className="text-4xl font-bold text-[#111827] dark:text-[#F3F4F6]">{stats.inProgress}</span>
            <p className="text-sm font-medium text-gray-500 mt-1">Actively working on</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-6 border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm">
        <h2 className="text-lg font-bold text-[#111827] dark:text-[#F3F4F6] mb-6">Current Objectives</h2>
        
        {goals.length === 0 ? (
          <div className="text-center py-16 text-gray-500 border-2 border-dashed border-gray-100 rounded-2xl">
            <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-1">No goals assigned yet</p>
            <p className="text-sm">Your manager will assign performance objectives here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => (
              <div key={goal.id} className="p-5 rounded-2xl border border-gray-100 dark:border-[#1E293B] hover:border-gray-200 dark:hover:border-slate-700 hover:bg-gray-50/50 dark:hover:bg-[#1E293B]/30 transition-all group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 bg-gray-50 dark:bg-[#1E293B]/50 rounded-xl border border-gray-100 dark:border-[#1E293B] shrink-0">
                      {getStatusIcon(goal.status)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">{goal.title}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed max-w-2xl">
                        {goal.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end gap-3 shrink-0 ml-16 md:ml-0">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(goal.status)}`}>
                      {goal.status.replace('_', ' ')}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                      <Clock className="w-4 h-4 text-gray-400" />
                      Due {new Date(goal.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>

                </div>

                {/* Progress Bar */}
                <div className="mt-5 ml-16 pr-4">
                  <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                    <span className="text-gray-500">Progress</span>
                    <span className={goal.progress === 100 ? "text-emerald-600" : "text-blue-600"}>
                      {goal.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-[#1E293B] rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${goal.progress === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
