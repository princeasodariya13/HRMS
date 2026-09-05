import { Sparkles } from "lucide-react";
import { AiChatClient } from "./AiChatClient";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function AIAssistantPage() {
  const session = await getServerSession(authOptions);
    const user = session?.user;

  if (!user) {
    redirect('/login');
  }

  // Get user's name from Prisma
  let dbUser = null;
  try {
    dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { email: true }
    });
  } catch (error) {
    console.warn("Prisma Database connection failed in AI Assistant:. Next.js Dev overlay suppressed.");
  }

  const userName = dbUser?.email?.split('@')[0] || "User";

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] dark:text-[#F3F4F6] flex items-center gap-2">
            AI Copilot <Sparkles className="w-5 h-5 text-[#111827] dark:text-[#F3F4F6]" />
          </h1>
          <p className="text-[#6B7280] dark:text-[#9CA3AF] dark:text-[#6B7280] text-sm">Ask anything about HR policies, employee data, or analytics.</p>
        </div>
      </div>

      <AiChatClient userName={userName} />
    </div>
  );
}
