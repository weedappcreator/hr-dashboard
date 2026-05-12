import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const g = globalThis as any;

async function sb() {
  const client = supabase();
  if (!client) return null;

  if (!g.__sbReady) {
    const { count, error } = await client.from("tasks").select("*", { count: "exact", head: true });
    if (error) return null;
    g.__sbReady = true;
  }

  return client;
}

export async function GET() {
  const client = await sb();
  if (client) {
    const { data, error } = await client.from("tasks").select("*").order("created_at", { ascending: true });
    if (!error && data) {
      return NextResponse.json(data.map((t: any, i: number) => ({
        id: t.id, title: t.title, description: t.description || "", status: t.status,
        priority: t.priority, owner: t.owner || "HR", createdAt: t.created_at, completedAt: t.completed_at,
        taskNumber: i + 1,
      })));
    }
  }

  if (!g.__t) {
    g.__t = [
      { id: "1", title: "Recruitment Pipeline Review", description: "Review open roles", status: "open", priority: "Medium", owner: "HR", createdAt: "", completedAt: null, taskNumber: 1 },
      { id: "2", title: "New Employee Onboarding", description: "Prepare onboarding docs", status: "open", priority: "High", owner: "HR", createdAt: "", completedAt: null, taskNumber: 2 },
      { id: "3", title: "Payroll Verification", description: "Verify payroll details", status: "progress", priority: "High", owner: "HR", createdAt: "", completedAt: null, taskNumber: 3 },
      { id: "4", title: "Policy Review", description: "Review HR policy", status: "review", priority: "Medium", owner: "HR", createdAt: "", completedAt: null, taskNumber: 4 },
      { id: "5", title: "Offboarding Complete", description: "Offboarding checklist done", status: "done", priority: "Low", owner: "HR", createdAt: "", completedAt: "", taskNumber: 5 },
    ];
  }
  return NextResponse.json(g.__t);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const client = await sb();

    if (body._action === "patch" && id) {
      if (client) {
        const updates: any = { ...body.updates };
        if (updates.status === "done") updates.completed_at = new Date().toISOString();
        else if (updates.status) updates.completed_at = null;
        await client.from("tasks").update(updates).eq("id", id);
      }
      return NextResponse.json({ message: "Updated" });
    }

    if (body._action === "delete" && id) {
      if (client) await client.from("tasks").delete().eq("id", id);
      return NextResponse.json({ message: "Deleted" });
    }

    if (!body.title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 });

    const task = { title: body.title.trim(), description: body.description?.trim() || "", status: "open", priority: body.priority || "Medium", owner: body.owner || "HR" };

    if (client) {
      const { data } = await client.from("tasks").insert(task).select().single();
      if (data) return NextResponse.json({
        id: data.id, title: data.title, description: data.description || "", status: data.status,
        priority: data.priority, owner: data.owner || "HR", createdAt: data.created_at, completedAt: data.completed_at,
        taskNumber: 0,
      }, { status: 201 });
    }

    const now = new Date().toISOString();
    const memTask: any = { id: String(g.__n++ || 6), ...task, createdAt: now, completedAt: null, taskNumber: (g.__t || []).length + 1 };
    if (!g.__t) g.__t = [];
    g.__t.push(memTask);
    return NextResponse.json(memTask, { status: 201 });
  } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }
}

export async function DELETE(request: Request) {
  const auth = request.headers.get("x-auth");
  const expected = process.env.HR_PASSWORD || "FelixHR2026";
  if (auth !== expected) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await sb();
  if (client) await client.from("tasks").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  g.__t = [];
  return NextResponse.json({ message: "Deleted" });
}