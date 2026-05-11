import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, priority, owner, status } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

const count = await prisma.task.count();
      const task = await prisma.task.create({
        data: {
          title,
          description: description || "",
          priority: priority || "Medium",
          owner: owner || "HR",
          status: status || "open",
        },
      });
      (task as Record<string, unknown>).taskNumber = count + 1;

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await prisma.task.deleteMany();
    return NextResponse.json({ message: "All tasks deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete all tasks" }, { status: 500 });
  }
}