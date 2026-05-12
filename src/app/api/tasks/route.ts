import { NextResponse } from "next/server";
import postgres from "postgres";

const g = globalThis as any;
if (!g.__sql && process.env.DATABASE_URL) {
  g.__sql = postgres(process.env.DATABASE_URL, { max: 5 });
}

function sql() { return g.__sql as ReturnType<typeof postgres> | null; }

if (!g.__t) {
  g.__t = [
    { id: "1", title: "Recruitment Pipeline Review", description: "Review open roles", status: "open", priority: "Medium", owner: "HR", createdAt: "", completedAt: null, taskNumber: 1 },
    { id: "2", title: "New Employee Onboarding", description: "Prepare onboarding docs", status: "open", priority: "High", owner: "HR", createdAt: "", completedAt: null, taskNumber: 2 },
    { id: "3", title: "Payroll Verification", description: "Verify payroll details", status: "progress", priority: "High", owner: "HR", createdAt: "", completedAt: null, taskNumber: 3 },
    { id: "4", title: "Policy Review", description: "Review HR policy", status: "review", priority: "Medium", owner: "HR", createdAt: "", completedAt: null, taskNumber: 4 },
    { id: "5", title: "Offboarding Complete", description: "Offboarding checklist done", status: "done", priority: "Low", owner: "HR", createdAt: "", completedAt: "", taskNumber: 5 },
  ];
}

export async function GET() {
  const db = sql();
  if (db) {
    try {
      const rows = await db`SELECT * FROM tasks ORDER BY created_at ASC`;
      if (rows && rows.length > 0) {
        return NextResponse.json(rows.map((t: any, i: number) => ({
          id: t.id, title: t.title, description: t.description || "", status: t.status,
          priority: t.priority, owner: t.owner || "HR", createdAt: t.created_at, completedAt: t.completed_at,
          taskNumber: i + 1,
        })));
      }
    } catch {}
  }
  return NextResponse.json(g.__t);
}

export async function POST(req: Request) {
  const body = await req.json();
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const db = sql();

  if (body._action === "patch" && id) {
    if (db) await db`UPDATE tasks SET status = ${body.updates.status}, completed_at = ${body.updates.status === "done" ? new Date().toISOString() : null} WHERE id = ${id}`;
    const idx = g.__t.findIndex((t: any) => t.id === id);
    if (idx >= 0) { Object.assign(g.__t[idx], body.updates); if (body.updates?.status === "done") g.__t[idx].completedAt = new Date().toISOString(); }
    return NextResponse.json({ message: "Updated" });
  }
  if (body._action === "delete" && id) {
    if (db) await db`DELETE FROM tasks WHERE id = ${id}`;
    g.__t = g.__t.filter((t: any) => t.id !== id);
    return NextResponse.json({ message: "Deleted" });
  }
  if (!body.title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 });

  if (db) {
    const rows = await db`INSERT INTO tasks (title, description, status, priority, owner) VALUES (${body.title.trim()}, ${body.description?.trim() || ""}, 'open', ${body.priority || "Medium"}, ${body.owner || "HR"}) RETURNING *`;
    if (rows[0]) {
      const t = rows[0];
      return NextResponse.json({ id: t.id, title: t.title, description: t.description || "", status: t.status, priority: t.priority, owner: t.owner || "HR", createdAt: t.created_at, completedAt: t.completed_at, taskNumber: 0 }, { status: 201 });
    }
  }

  const task: any = { id: String(g.__n++ || (g.__n = g.__t.length + 1)), title: body.title.trim(), description: body.description?.trim() || "", status: "open", priority: body.priority || "Medium", owner: body.owner || "HR", createdAt: new Date().toISOString(), completedAt: null, taskNumber: g.__t.length + 1 };
  g.__t.push(task);
  return NextResponse.json(task, { status: 201 });
}

export async function DELETE(request: Request) {
  const auth = request.headers.get("x-auth");
  const expected = process.env.HR_PASSWORD || "FelixHR2026";
  if (auth !== expected) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = sql();
  if (db) await db`DELETE FROM tasks`;
  g.__t = [];
  return NextResponse.json({ message: "Deleted" });
}