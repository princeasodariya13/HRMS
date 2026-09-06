const { PrismaClient } = require('@prisma/client');
const { PrismaAdapter } = require('@auth/prisma-adapter');
const prisma = new PrismaClient();
const adapter = PrismaAdapter(prisma);

async function main() {
  const user = await adapter.getUserByAccount({
    providerAccountId: "114949883588485549178",
    provider: "google"
  });
  console.log("User found by account:", user);
}
main().catch(console.error).finally(() => prisma.$disconnect());