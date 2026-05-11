import { NextResponse } from "next/server";
import { getTasks, setTasks } from "./store";

export async function GET() {
  return NextResponse.json(getTasks());
}

export async function POST(request: Request) {
  const body = await request.json();
  const { title, description, priority, owner, status } = body;
  if (!title || !title.trim()) return NextResponse.json({ error: "Title is required" }, { status: 400 });

  const tasks = getTasks();
  const task = {
    id: String(tasks.length + 1),
    title: title.trim(),
    description: description?.trim() || "",
    status: status || "open",
    priority: priority || "Medium",
    owner: owner || "HR",
    createdAt: new Date().toISOString(),
    completedAt: null,
    taskNumber: tasks.length + 1,
  };
  setTasks([...tasks, task]);
  return NextResponse.json(task, { status: 201 });
}

export async function DELETE(request: Request) {
  const authHeader = request.headers.get('x-hr-password');
  if (authHeader !== (process.env.HR_PASSWORD || "FelixHR2026")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  setTasks([]);
  return NextResponse.json({ message: "All tasks deleted" });
}