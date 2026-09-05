require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
  }

  let company = await prisma.company.findFirst();
  if (!company) {
    company = await prisma.company.create({ data: { name: 'NexaHR' }});
  }
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email },
    update: { password: passwordHash, role: 'SUPER_ADMIN', companyId: company.id, isActive: true },
    create: { email, password: passwordHash, role: 'SUPER_ADMIN', companyId: company.id }
  });

  console.log('Successfully configured the admin user in MongoDB.');
}
createAdmin().catch(console.error).finally(() => prisma.$disconnect());
