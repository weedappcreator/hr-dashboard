import { NextResponse } from "next/server";

const g = globalThis as any;

async function tursoQuery(sql: string, args?: any[]) {
  const url = process.env.TURSO_DATABASE_URL;
  const token = process.env.TURSO_AUTH_TOKEN;
  if (!url || !token) return null;
  try {
    const httpUrl = url.replace("libsql://", "https://");
    const body: any = { requests: [{ type: "execute", stmt: args ? { sql, args } : { sql } }] };
    const res = await fetch(`${httpUrl}/v2/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.results?.[0]?.response?.result?.rows || null;
  } catch { return null; }
}

function rowsToTasks(rows: any[] | null) {
  if (!rows) return null;
  return rows.map((r: any, i: number) => ({
    id: r[0]?.value || "", title: r[1]?.value || "", description: r[2]?.value || "",
    status: r[3]?.value || "open", priority: r[4]?.value || "Medium", owner: r[5]?.value || "HR",
    createdAt: r[6]?.value || "", completedAt: r[7]?.value || null, taskNumber: i + 1,
  }));
}

if (!g.__t) {
  g.__t = [
    { id: "1", title: "Recruitment Pipeline Review", description: "Review open roles", status: "open", priority: "Medium", owner: "HR", createdAt: "", completedAt: null, taskNumber: 1 },
    { id: "2", title: "New Employee Onboarding", description: "Prepare onboarding docs", status: "open", priority: "High", owner: "HR", createdAt: "", completedAt: null, taskNumber: 2 },
    { id: "3", title: "Payroll Verification", description: "Verify payroll details", status: "progress", priority: "High", owner: "HR", createdAt: "", completedAt: null, taskNumber: 3 },
    { id: "4", title: "Policy Review", description: "Review HR policy", status: "review", priority: "Medium", owner: "HR", createdAt: "", completedAt: null, taskNumber: 4 },
    { id: "5", title: "Offboarding Complete", description: "Offboarding checklist done", status: "done", priority: "Low", owner: "HR", createdAt: "", completedAt: "", taskNumber: 5 },
  ];
  g.__n = 6;
}

export async function GET() {
  const rows = await tursoQuery("SELECT * FROM Task ORDER BY rowid ASC");
  return NextResponse.json(rowsToTasks(rows) || g.__t);
}

export async function POST(req: Request) {
  const body = await req.json();
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (body._action === "patch" && id) {
    await tursoQuery("UPDATE Task SET status = ?, completedAt = ? WHERE id = ?", [body.updates.status, body.updates.status === "done" ? new Date().toISOString() : null, id]);
    const idx = g.__t.findIndex((t: any) => t.id === id);
    if (idx >= 0) { g.__t[idx].status = body.updates.status; g.__t[idx].completedAt = body.updates.status === "done" ? new Date().toISOString() : null; }
    return NextResponse.json({ message: "Updated" });
  }

  if (body._action === "delete" && id) {
    await tursoQuery("DELETE FROM Task WHERE id = ?", [id]);
    g.__t = g.__t.filter((t: any) => t.id !== id);
    return NextResponse.json({ message: "Deleted" });
  }

  if (!body.title) return NextResponse.json({ error: "Title required" }, { status: 400 });
  const now = new Date().toISOString();
  const taskId = String(g.__n++);
  const task: any = { id: taskId, title: body.title, description: body.description || "", status: "open", priority: body.priority || "Medium", owner: "HR", createdAt: now, completedAt: null, taskNumber: g.__t.length + 1 };

  const ok = await tursoQuery("INSERT INTO Task (id, title, description, status, priority, owner, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)", [taskId, body.title, body.description || "", "open", body.priority || "Medium", "HR", now]);
  if (!ok) g.__t.push(task);
  return NextResponse.json(task, { status: 201 });
}

export async function DELETE() {
  await tursoQuery("DELETE FROM Task");
  g.__t = [];
  return NextResponse.json({ message: "Deleted" });
}