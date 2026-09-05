import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
      // Only request standard profile scopes — drive.file caused silent rejection
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile"
        }
      }
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Invalid login credentials");
        }

        if (user.password === "NEEDS_RESET") {
          // Seamless Migration: Capture their first login attempt password, hash it, and save it.
          const hashedPassword = await bcrypt.hash(credentials.password, 10);
          await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
          });
        } else {
          // Standard password verification
          const isCorrectPassword = await bcrypt.compare(credentials.password, user.password);
          if (!isCorrectPassword) {
            throw new Error("Invalid login credentials");
          }
        }

        return user as any;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    // Auto-provision a Company for new Google OAuth users who don't have one yet
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
            select: { id: true, companyId: true }
          });

          if (dbUser && !dbUser.companyId) {
            // New OAuth user — create a company and link it
            const company = await prisma.company.create({
              data: {
                name: `${user.name ?? user.email}'s Company`,
                website: user.email?.split("@")[1] ?? "company.com",
              }
            });
            await prisma.user.update({
              where: { id: dbUser.id },
              data: { companyId: company.id, role: "SUPER_ADMIN" }
            });
          }
        } catch (e) {
          console.error("signIn callback provisioning error:", e);
          // Don't block the sign-in; the dashboard layout will handle missing company
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.companyId = (user as any).companyId;
      }
      // Re-fetch role/companyId on each token refresh in case it was just provisioned
      if (token.id && !token.companyId) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { role: true, companyId: true }
          });
          if (dbUser) {
            token.role = dbUser.role;
            token.companyId = dbUser.companyId;
          }
        } catch (_) {}
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).companyId = token.companyId;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
