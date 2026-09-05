import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { 
  Shield, 
  Search, 
  FileText, 
  BookOpen, 
  Laptop, 
  HeartHandshake,
  Download,
  Calendar,
  Eye,
  Archive
} from "lucide-react";

export default async function EmployeePoliciesPage() {
  const session = await getServerSession(authOptions);
    const user = session?.user;

  if (!user) {
    redirect("/login");
  }

  let policies: any[] = [];
  
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { companyId: true }
    });

    if (dbUser) {
      // @ts-ignore
      if (prisma.policy) {
        // @ts-ignore
        policies = await prisma.policy.findMany({
          where: { 
            companyId: dbUser.companyId,
            isActive: true 
          },
          orderBy: { category: 'asc' }
        });
      }
    }
  } catch (error) {
    console.error("Database connection issue.", error);
  }

  // Define some placeholder policies if database is empty just for production feel
  if (policies.length === 0) {
    policies = [
      {
        id: "1",
        title: "Remote Work & Telecommuting",
        description: "Guidelines and expectations for working remotely, including equipment, hours, and security protocols.",
        category: "HR & Operations",
        effectiveDate: new Date("2024-01-01")
      },
      {
        id: "2",
        title: "Code of Conduct",
        description: "Expected professional behavior, ethics, and anti-harassment policies for all employees.",
        category: "General",
        effectiveDate: new Date("2023-06-15")
      },
      {
        id: "3",
        title: "IT Security & Data Protection",
        description: "Protocols for password management, software installation, and handling sensitive corporate data.",
        category: "IT",
        effectiveDate: new Date("2024-02-10")
      },
      {
        id: "4",
        title: "Leave & Attendance Policy",
        description: "Rules regarding casual leaves, sick leaves, public holidays, and how to properly log your attendance.",
        category: "HR & Operations",
        effectiveDate: new Date("2023-11-01")
      }
    ];
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'IT': return <Laptop className="w-5 h-5 text-blue-500" />;
      case 'HR & Operations': return <HeartHandshake className="w-5 h-5 text-rose-500" />;
      case 'General': return <BookOpen className="w-5 h-5 text-emerald-500" />;
      default: return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] dark:text-[#F3F4F6] flex items-center gap-2">
            Company Policies <Shield className="w-6 h-6 text-emerald-600" />
          </h1>
          <p className="text-gray-500 mt-1">Review official corporate guidelines, procedures, and rules.</p>
        </div>
        <button className="bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] text-[#111827] dark:text-[#F3F4F6] hover:bg-[#F8FAFC] dark:hover:bg-[#334155] shadow-sm rounded-xl px-4 py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-2 w-full md:w-auto">
          <Archive className="w-4 h-4 text-emerald-600" />
          Download All Policies (ZIP)
        </button>
      </div>

      <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-6 border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm">
        {/* Search Bar */}
        <div className="relative max-w-md mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search policies..."
            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-[#1E293B] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:bg-white dark:focus:bg-[#1E293B] focus:ring-2 focus:ring-emerald-500/20 dark:focus:ring-white focus:border-emerald-500 transition-all outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {policies.map((policy) => (
            <div key={policy.id} className="group p-6 rounded-2xl border border-gray-100 dark:border-[#1E293B] hover:border-gray-200 dark:hover:border-slate-700 hover:bg-gray-50/50 dark:hover:bg-[#1E293B]/30 transition-all flex flex-col h-full">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#0F172A] border border-gray-100 shadow-sm flex items-center justify-center shrink-0">
                  {getCategoryIcon(policy.category)}
                </div>
                <div>
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-[#1E293B] text-gray-600 dark:text-gray-400 mb-1.5">
                    {policy.category}
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-[#F3F4F6] text-lg leading-tight group-hover:text-emerald-700 dark:group-hover:text-emerald-500 transition-colors">
                    {policy.title}
                  </h3>
                </div>
              </div>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed flex-1">
                {policy.description}
              </p>

              <div className="mt-6 pt-5 border-t border-gray-100 dark:border-[#1E293B] flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
                  <Calendar className="w-4 h-4" />
                  Effective: {new Date(policy.effectiveDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                </div>
                
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
