import { NextResponse } from "next/server";

const g = globalThis as any;
if (!g.__t) {
  g.__t = [
    { id: "1", title: "Recruitment Pipeline Review", description: "Review open roles", status: "open", priority: "Medium", owner: "HR", createdAt: new Date().toISOString(), completedAt: null, taskNumber: 1 },
    { id: "2", title: "New Employee Onboarding", description: "Prepare onboarding docs", status: "open", priority: "High", owner: "HR", createdAt: new Date().toISOString(), completedAt: null, taskNumber: 2 },
    { id: "3", title: "Payroll Verification", description: "Verify payroll details", status: "progress", priority: "High", owner: "HR", createdAt: new Date().toISOString(), completedAt: null, taskNumber: 3 },
    { id: "4", title: "Policy Review", description: "Review HR policy", status: "review", priority: "Medium", owner: "HR", createdAt: new Date().toISOString(), completedAt: null, taskNumber: 4 },
    { id: "5", title: "Offboarding Complete", description: "Offboarding checklist done", status: "done", priority: "Low", owner: "HR", createdAt: new Date().toISOString(), completedAt: new Date().toISOString(), taskNumber: 5 },
  ];
  g.__n = 6;
}

export async function GET() { return NextResponse.json(g.__t); }

export async function POST(req: Request) {
  const body = await req.json();
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (body._action === "patch" && id) {
    const idx = g.__t.findIndex((t: any) => t.id === id);
    if (idx >= 0) { g.__t[idx].status = body.updates.status; g.__t[idx].completedAt = body.updates.status === "done" ? new Date().toISOString() : null; }
    return NextResponse.json({ message: "Updated" });
  }
  if (body._action === "delete" && id) {
    g.__t = g.__t.filter((t: any) => t.id !== id);
    return NextResponse.json({ message: "Deleted" });
  }
  if (!body.title) return NextResponse.json({ error: "Title required" }, { status: 400 });
  const task = { id: String(g.__n++), title: body.title, description: body.description || "", status: "open", priority: body.priority || "Medium", owner: "HR", createdAt: new Date().toISOString(), completedAt: null, taskNumber: g.__t.length + 1 };
  g.__t.push(task);
  return NextResponse.json(task, { status: 201 });
}

export async function DELETE() { g.__t = []; return NextResponse.json({ message: "Deleted" }); }