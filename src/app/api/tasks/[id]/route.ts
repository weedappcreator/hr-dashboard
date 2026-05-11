import { NextResponse } from "next/server";
import { getTasks, setTasks } from "../store";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const task = getTasks().find(t => t.id === id);
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
  return NextResponse.json(task);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  let tasks = getTasks();
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  const task = { ...tasks[idx] };
  if (body.title !== undefined) task.title = body.title;
  if (body.description !== undefined) task.description = body.description;
  if (body.status !== undefined) { task.status = body.status; task.completedAt = body.status === "done" ? new Date().toISOString() : null; }
  if (body.priority !== undefined) task.priority = body.priority;
  if (body.owner !== undefined) task.owner = body.owner;

  tasks[idx] = task;
  setTasks(tasks);
  return NextResponse.json(task);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const tasks = getTasks().filter(t => t.id !== id);
  setTasks(tasks);
  return NextResponse.json({ message: "Task deleted" });
}