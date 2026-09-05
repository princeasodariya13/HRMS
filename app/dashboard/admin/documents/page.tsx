import { FileText, Upload, Folder, Shield, AlertCircle, Download, File, User, Calendar } from "lucide-react";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { VerifyDocumentButton } from "./VerifyDocumentButton";
import { UploadDocumentModal } from "./UploadDocumentModal";

export default async function DocumentsPage() {
  const session = await getServerSession(authOptions);
    const user = session?.user;

  if (!user) {
    redirect('/login');
  }

  // Get user's company
  let dbUser = null;
  let totalDocs = 0;
  let policiesCount = 0;
  let contractsCount = 0;
  let recentDocs: any[] = [];
  let isDemo = true;

  try {
    dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { companyId: true, email: true }
    });

    const companyId = dbUser?.companyId;

    if (companyId) {
      const [totalCount, policyCount, contractCount, fetchedDocs] = await Promise.all([
        prisma.document.count({ where: { employee: { companyId } } }),
        prisma.document.count({ where: { employee: { companyId }, type: 'POLICY' } }),
        prisma.document.count({ where: { employee: { companyId }, type: 'CONTRACT' } }),
        prisma.document.findMany({
          where: { employee: { companyId } },
          include: { employee: true },
          orderBy: { createdAt: 'desc' },
          take: 8
        })
      ]);

      totalDocs = totalCount;
      policiesCount = policyCount;
      contractsCount = contractCount;
      recentDocs = fetchedDocs.map(doc => ({
        id: doc.id,
        title: doc.title,
        type: doc.type,
        uploadedBy: 'Admin',
        employeeName: doc.employee ? `${doc.employee.firstName} ${doc.employee.lastName}` : "Company Wide",
        date: format(new Date(doc.createdAt), "MMM dd, yyyy"),
        size: "2.4 MB", // Mock size as we don't store size in DB currently
        isVerified: doc.isVerified,
        fileUrl: doc.fileUrl
      }));

      if (totalCount > 0) isDemo = false;
    }
  } catch (error) {
    console.warn("Prisma Database connection failed in Documents:. Next.js Dev overlay suppressed.");
  }

  // Fallback demo data
  if (isDemo) {
    // Rely strictly on real database data and show empty state
  }

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'POLICY': return <Shield className="w-5 h-5 text-purple-600" />;
      case 'CONTRACT': return <FileText className="w-5 h-5 text-blue-600" />;
      default: return <File className="w-5 h-5 text-slate-600" />;
    }
  };

  const getTypeBg = (type: string) => {
    switch(type) {
      case 'POLICY': return "bg-purple-100";
      case 'CONTRACT': return "bg-blue-100";
      default: return "bg-slate-100";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] dark:text-[#F3F4F6]">Document Center</h1>
          <p className="text-[#6B7280] dark:text-[#9CA3AF] dark:text-[#6B7280] text-sm">Securely manage policies, contracts, and employee records.</p>
        </div>
        <div className="flex items-center gap-3">
          <UploadDocumentModal />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
            <Folder className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-[#6B7280] dark:text-[#9CA3AF] dark:text-[#6B7280] text-sm font-medium">Total Documents</p>
            <p className="text-2xl font-bold text-[#111827] dark:text-[#F3F4F6]">{totalDocs}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center">
            <Shield className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-[#6B7280] dark:text-[#9CA3AF] dark:text-[#6B7280] text-sm font-medium">Active Policies</p>
            <p className="text-2xl font-bold text-[#111827] dark:text-[#F3F4F6]">{policiesCount}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
            <FileText className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-[#6B7280] dark:text-[#9CA3AF] dark:text-[#6B7280] text-sm font-medium">Employee Contracts</p>
            <p className="text-2xl font-bold text-[#111827] dark:text-[#F3F4F6]">{contractsCount}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        <div className="p-6 border-b border-[#E5E7EB] dark:border-[#1E293B] flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#111827] dark:text-[#F3F4F6]">Recent Documents</h3>
        </div>
        <div className="overflow-x-auto flex-1 p-2">
          <table className="w-full text-sm text-left">
            <thead className="bg-transparent text-[#6B7280] dark:text-[#9CA3AF] dark:text-[#6B7280]">
              <tr>
                <th className="px-6 py-3 font-semibold pb-4">Document Name</th>
                <th className="px-6 py-3 font-semibold pb-4">Linked To</th>
                <th className="px-6 py-3 font-semibold pb-4">Uploaded Date</th>
                <th className="px-6 py-3 font-semibold pb-4">Size</th>
                <th className="px-6 py-3 font-semibold text-right pb-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#1E293B]">
              {recentDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/50 dark:bg-[#1E293B] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getTypeBg(doc.type)}`}>
                        {getTypeIcon(doc.type)}
                      </div>
                      <div>
                        <div className="font-semibold text-[#111827] dark:text-[#F3F4F6]">{doc.title}</div>
                        <div className="text-[#6B7280] dark:text-[#9CA3AF] dark:text-[#6B7280] text-xs mt-0.5">{doc.type.replace('_', ' ')}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[#475569]">
                      {doc.employeeName === 'Company Wide' ? <Shield className="w-4 h-4 text-purple-600" /> : <User className="w-4 h-4 text-blue-600" />}
                      <span className="font-medium">{doc.employeeName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[#6B7280] dark:text-[#9CA3AF] dark:text-[#6B7280]">
                      <Calendar className="w-4 h-4" />
                      <span>{doc.date}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#6B7280] dark:text-[#9CA3AF] dark:text-[#6B7280] font-medium">{doc.size}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <VerifyDocumentButton documentId={doc.id} isVerified={doc.isVerified || false} />
                      {doc.fileUrl && doc.fileUrl !== "https://placeholder.url/doc" && (
                        <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="p-2 text-[#6B7280] dark:text-[#9CA3AF] hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                          <Download className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {recentDocs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#6B7280] dark:text-[#9CA3AF] dark:text-[#6B7280]">
                    <div className="flex flex-col items-center justify-center">
                      <Folder className="w-12 h-12 text-[#E5E7EB] mb-4" />
                      <p className="font-semibold text-[#111827] dark:text-[#F3F4F6]">No documents uploaded yet</p>
                      <p className="text-sm mt-1">Upload your first company policy or contract.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
