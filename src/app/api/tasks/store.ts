const initialTasks = [
  { id: "1", title: "Recruitment Pipeline Review", description: "Review open roles and candidate stages", status: "open", priority: "Medium", owner: "HR", createdAt: "", completedAt: null, taskNumber: 1 },
  { id: "2", title: "New Employee Onboarding", description: "Prepare onboarding documents and access", status: "open", priority: "High", owner: "HR", createdAt: "", completedAt: null, taskNumber: 2 },
  { id: "3", title: "Payroll Verification", description: "Verify payroll details and approvals", status: "progress", priority: "High", owner: "HR", createdAt: "", completedAt: null, taskNumber: 3 },
  { id: "4", title: "Policy Review", description: "Review HR policy for employee requests", status: "review", priority: "Medium", owner: "HR", createdAt: "", completedAt: null, taskNumber: 4 },
  { id: "5", title: "Offboarding Complete", description: "Employee offboarding checklist completed", status: "done", priority: "Low", owner: "HR", createdAt: "", completedAt: new Date().toISOString(), taskNumber: 5 },
];

const g = globalThis as any;
if (!g.__tasks) {
  g.__tasks = { list: [...initialTasks], nextId: 6 };
}

export function getStore() {
  return g.__tasks;
}