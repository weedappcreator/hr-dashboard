import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  const tasks = [
    { title: 'Recruitment Pipeline Review', description: 'Review open roles and candidate stages', status: 'open', priority: 'Medium' },
    { title: 'New Employee Onboarding', description: 'Prepare onboarding documents and access', status: 'open', priority: 'High' },
    { title: 'Payroll Verification', description: 'Verify payroll details and approvals', status: 'progress', priority: 'High' },
    { title: 'Policy Review', description: 'Review HR policy for employee requests', status: 'review', priority: 'Medium' },
    { title: 'Offboarding Complete', description: 'Employee offboarding checklist completed', status: 'done', priority: 'Low' },
  ];

  for (const task of tasks) {
    await prisma.task.create({ data: task });
  }

  console.log('Seeded 5 tasks');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());