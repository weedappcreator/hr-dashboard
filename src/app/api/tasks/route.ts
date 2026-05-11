import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";

const g = globalThis as any;

let db: any = null;
try {
  if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
    db = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    console.log("Connected to Turso database");
  }
} catch (e) {
  console.log("Turso not available, using in-memory:", e);
}

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

async function getTasksDB() {
  if (!db) return null;
  try {
    const result = await db.execute("SELECT * FROM Task ORDER BY createdAt ASC");
    return result.rows.map((r: any, i: number) => ({
      id: r.id, title: r.title, description: r.description || "", status: r.status,
      priority: r.priority, owner: r.owner || "HR", createdAt: r.createdAt, completedAt: r.completedAt,
      taskNumber: i + 1,
    }));
  } catch { return null; }
}

async function createTaskDB(task: any) {
  if (!db) return false;
  try {
    await db.execute({
      sql: "INSERT INTO Task (id, title, description, status, priority, owner, createdAt, completedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      args: [task.id, task.title, task.description, task.status, task.priority, task.owner, task.createdAt, task.completedAt],
    });
    return true;
  } catch { return false; }
}

async function updateTaskDB(id: string, updates: any) {
  if (!db) return false;
  try {
    const sets: string[] = [];
    const args: any[] = [];
    for (const [k, v] of Object.entries(updates)) {
      sets.push(`${k} = ?`);
      args.push(v);
    }
    args.push(id);
    await db.execute({ sql: `UPDATE Task SET ${sets.join(", ")} WHERE id = ?`, args });
    return true;
  } catch { return false; }
}

async function deleteTaskDB(id: string) {
  if (!db) return false;
  try { await db.execute({ sql: "DELETE FROM Task WHERE id = ?", args: [id] }); return true; }
  catch { return false; }
}

async function deleteAllDB() {
  if (!db) return false;
  try { await db.execute("DELETE FROM Task"); return true; }
  catch { return false; }
}

export async function GET() {
  if (db) {
    const tasks = await getTasksDB();
    if (tasks) return NextResponse.json(tasks);
  }
  return NextResponse.json(g.__t);
}

export async function POST(req: Request) {
  const body = await req.json();
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (body._action === "patch" && id) {
    if (db) { await updateTaskDB(id, { status: body.updates.status, completedAt: body.updates.status === "done" ? new Date().toISOString() : null }); }
    const idx = g.__t.findIndex((t: any) => t.id === id);
    if (idx >= 0) {
      g.__t[idx].status = body.updates.status;
      g.__t[idx].completedAt = body.updates.status === "done" ? new Date().toISOString() : null;
    }
    return NextResponse.json({ message: "Updated" });
  }

  if (body._action === "delete" && id) {
    if (db) await deleteTaskDB(id);
    g.__t = g.__t.filter((t: any) => t.id !== id);
    return NextResponse.json({ message: "Deleted" });
  }

  if (!body.title) return NextResponse.json({ error: "Title required" }, { status: 400 });
  const now = new Date().toISOString();
  const task = { id: String(g.__n++), title: body.title, description: body.description || "", status: "open", priority: body.priority || "Medium", owner: "HR", createdAt: now, completedAt: null, taskNumber: g.__t.length + 1 };

  if (!(await createTaskDB(task))) g.__t.push(task);
  return NextResponse.json(task, { status: 201 });
}

export async function DELETE() {
  if (db) await deleteAllDB();
  g.__t = [];
  return NextResponse.json({ message: "Deleted" });
}