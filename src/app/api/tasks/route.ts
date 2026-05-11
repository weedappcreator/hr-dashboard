import { NextResponse } from "next/server";

const g = globalThis as any;
if (!g.__tasks) {
  g.__tasks = [
    { id: "1", title: "Recruitment Pipeline Review", description: "Review open roles", status: "open", priority: "Medium", owner: "HR", createdAt: new Date().toISOString(), completedAt: null, taskNumber: 1 },
    { id: "2", title: "New Employee Onboarding", description: "Prepare onboarding docs", status: "open", priority: "High", owner: "HR", createdAt: new Date().toISOString(), completedAt: null, taskNumber: 2 },
    { id: "3", title: "Payroll Verification", description: "Verify payroll details", status: "progress", priority: "High", owner: "HR", createdAt: new Date().toISOString(), completedAt: null, taskNumber: 3 },
    { id: "4", title: "Policy Review", description: "Review HR policy", status: "review", priority: "Medium", owner: "HR", createdAt: new Date().toISOString(), completedAt: null, taskNumber: 4 },
    { id: "5", title: "Offboarding Complete", description: "Offboarding checklist done", status: "done", priority: "Low", owner: "HR", createdAt: new Date().toISOString(), completedAt: new Date().toISOString(), taskNumber: 5 },
  ];
  g.__nextTaskId = 6;
}

function getTasks() { return g.__tasks; }
function saveTasks(t: any[]) { g.__tasks = t; }

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const tasks = getTasks();

  if (id) {
    const task = tasks.find((t: any) => t.id === id);
    return task ? NextResponse.json(task) : NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(tasks);
}

export async function POST(req: Request) {
  const body = await req.json();

  if (body._action === "delete" && body.id) {
    saveTasks(getTasks().filter((t: any) => t.id !== body.id));
    return NextResponse.json({ message: "Deleted" });
  }

  if (body._action === "patch" && body.id) {
    const tasks = getTasks();
    const idx = tasks.findIndex((t: any) => t.id === body.id);
    if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
    Object.assign(tasks[idx], body.updates);
    if (body.updates?.status === "done") tasks[idx].completedAt = new Date().toISOString();
    if (body.updates?.status && body.updates.status !== "done") tasks[idx].completedAt = null;
    saveTasks(tasks);
    return NextResponse.json(tasks[idx]);
  }

  if (!body.title || !body.title.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const tasks = getTasks();
  const id = String(g.__nextTaskId++);
  const task = {
    id, title: body.title.trim(), description: body.description?.trim() || "",
    status: body.status || "open", priority: body.priority || "Medium", owner: "HR",
    createdAt: new Date().toISOString(), completedAt: null, taskNumber: tasks.length + 1,
  };
  tasks.push(task);
  return NextResponse.json(task, { status: 201 });
}

export async function DELETE(req: Request) {
  saveTasks([]);
  return NextResponse.json({ message: "All tasks deleted" });
}