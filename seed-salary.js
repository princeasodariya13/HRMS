require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Seeding Salary Structures for all companies...');
    const allCompanies = await prisma.company.findMany();

    if (allCompanies.length === 0) {
      console.log('No companies found. Create a company first.');
      return;
    }

    const defaultRules = [
      { name: 'Basic Salary', code: 'BASIC', category: 'BASIC', sequence: 1, amountType: 'FIXED', amount: 0, percentage: null, formula: null },
      { name: 'House Rent Allowance', code: 'HRA', category: 'ALLOWANCE', sequence: 2, amountType: 'PERCENTAGE', percentage: 40, amount: null, formula: null },
      { name: 'Conveyance', code: 'CONVEYANCE', category: 'ALLOWANCE', sequence: 3, amountType: 'FIXED', amount: 1600, percentage: null, formula: null },
      { name: 'Special Allowance', code: 'SPECIAL_ALLOWANCE', category: 'ALLOWANCE', sequence: 4, amountType: 'PERCENTAGE', percentage: 10, amount: null, formula: null },
      { name: 'Gross Salary', code: 'GROSS', category: 'GROSS', sequence: 5, amountType: 'FORMULA', formula: 'BASIC + ALLOWANCES', amount: null, percentage: null },
      { name: 'Provident Fund', code: 'PF', category: 'DEDUCTION', sequence: 6, amountType: 'PERCENTAGE', percentage: 12, amount: null, formula: null },
      { name: 'Professional Tax', code: 'PROFESSIONAL_TAX', category: 'DEDUCTION', sequence: 7, amountType: 'FIXED', amount: 200, percentage: null, formula: null },
      { name: 'Net Salary', code: 'NET', category: 'NET', sequence: 8, amountType: 'FORMULA', formula: 'GROSS - DEDUCTIONS', amount: null, percentage: null },
    ];

    for (const comp of allCompanies) {
      let structure = await prisma.salaryStructure.findFirst({
        where: { name: 'Regular Salary', companyId: comp.id }
      });

      if (!structure) {
        structure = await prisma.salaryStructure.create({
          data: {
            name: 'Regular Salary',
            companyId: comp.id,
            isActive: true
          }
        });
        console.log(`Created structure for company ${comp.name}`);
      } else {
        console.log(`Structure already exists for company ${comp.name}, updating rules...`);
      }

      for (const rule of defaultRules) {
        const existing = await prisma.salaryRule.findFirst({
          where: { structureId: structure.id, code: rule.code }
        });

        if (existing) {
          await prisma.salaryRule.update({
            where: { id: existing.id },
            data: rule
          });
        } else {
          await prisma.salaryRule.create({
            data: { ...rule, structureId: structure.id }
          });
        }
      }
    }
    
    console.log('Successfully seeded Regular Salary structures and rules!');
  } catch (error) {
    console.error('Failed to seed salary structures:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
