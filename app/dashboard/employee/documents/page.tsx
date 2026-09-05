import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { UploadDocumentForm } from "./UploadDocumentForm";
import { DeleteDocumentButton } from "./DeleteDocumentButton";
import { 
  FileText, 
  Upload,
  CheckCircle2,
  AlertCircle,
  FileBadge,
  FileSignature,
  FileStack,
  Eye,
  Download
} from "lucide-react";

export default async function EmployeeDocumentsPage() {
  const session = await getServerSession(authOptions);
    const user = session?.user;

  if (!user) {
    redirect("/login");
  }

  let employee = null;
  let documents: any[] = [];
  
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { employee: true }
    });

    if (dbUser && dbUser.employee) {
      employee = dbUser.employee;
      
      documents = await prisma.document.findMany({
        where: { employeeId: employee.id },
        orderBy: { createdAt: 'desc' }
      });
    }
  } catch (error) {
    console.error("Database connection issue.", error);
  }

  const getIconForType = (type: string) => {
    switch (type) {
      case 'IDENTITY': return <FileBadge className="w-5 h-5 text-blue-500" />;
      case 'CONTRACT': return <FileSignature className="w-5 h-5 text-emerald-500" />;
      case 'POLICY': return <FileText className="w-5 h-5 text-purple-500" />;
      case 'CERTIFICATE': return <FileStack className="w-5 h-5 text-amber-500" />;
      default: return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getLabelForType = (type: string) => {
    switch (type) {
      case 'IDENTITY': return "Identity Proof";
      case 'CONTRACT': return "Contract / Agreement";
      case 'POLICY': return "Policy Document";
      case 'CERTIFICATE': return "Certificate / Degree";
      default: return "Other Document";
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] dark:text-[#F3F4F6]">My Documents</h1>
          <p className="text-gray-500 mt-1">Upload and manage your official employment documents securely.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Upload Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-6 border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm">
            <h2 className="text-lg font-bold text-[#111827] dark:text-[#F3F4F6] mb-6 flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" />
              Upload New Document
            </h2>
            <UploadDocumentForm />
          </div>

          <div className="bg-blue-50 rounded-3xl p-6 border border-blue-100">
            <h3 className="font-semibold text-blue-900 mb-2">Secure Storage</h3>
            <p className="text-sm text-blue-800/80 leading-relaxed">
              All documents uploaded are encrypted and stored securely in compliance with corporate data protection policies. Only authorized HR personnel can access these files.
            </p>
          </div>
        </div>

        {/* Right Column: Document Vault */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-6 border border-[#E5E7EB] dark:border-[#1E293B] shadow-sm">
            <h2 className="text-lg font-bold text-[#111827] dark:text-[#F3F4F6] mb-6">Document Vault</h2>
            
            {documents.length === 0 ? (
              <div className="text-center py-16 text-gray-500 border-2 border-dashed border-gray-100 rounded-2xl">
                <FileStack className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-1">Your vault is empty</p>
                <p className="text-sm">Upload your first document using the form on the left.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="group flex items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-[#1E293B] hover:border-gray-200 dark:hover:border-slate-700 hover:bg-gray-50/50 dark:hover:bg-[#1E293B]/30 transition-all">
                    
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-[#1E293B]/50 border border-gray-100 dark:border-[#1E293B] flex items-center justify-center shrink-0">
                        {getIconForType(doc.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 line-clamp-1">{doc.title}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs font-medium text-gray-500">
                            {getLabelForType(doc.type)}
                          </span>
                          <span className="text-gray-300">•</span>
                          <span className="text-xs text-gray-400">
                            {new Date(doc.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Verification Status */}
                      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white dark:bg-[#0F172A] border">
                        {doc.isVerified ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-700 border-emerald-200">Verified</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                            <span className="text-amber-700 border-amber-200">Pending Review</span>
                          </>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 border-l border-gray-200 pl-4 ml-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Document">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1E293B] rounded-lg transition-colors" title="Download Document">
                          <Download className="w-4 h-4" />
                        </button>
                        
                        {!doc.isVerified && (
                          <DeleteDocumentButton documentId={doc.id} />
                        )}
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
