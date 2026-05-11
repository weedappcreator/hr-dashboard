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

    if (!title || title.trim().length === 0) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (title.length > 200) {
      return NextResponse.json({ error: "Title too long (max 200 chars)" }, { status: 400 });
    }

    const validStatuses = ['open', 'progress', 'review', 'done'];
    const validPriorities = ['High', 'Medium', 'Low'];
    
    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    
    if (body.priority && !validPriorities.includes(body.priority)) {
      return NextResponse.json({ error: "Invalid priority" }, { status: 400 });
    }

    const count = await prisma.task.count();
    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : "",
        priority: priority || "Medium",
        owner: owner || "HR",
        status: status || "open",
      },
    });

    return NextResponse.json({ ...task, taskNumber: count + 1 }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const authHeader = request.headers.get('x-hr-password');
    const validPassword = process.env.HR_PASSWORD || 'FelixHR2026';
    
    if (authHeader !== validPassword) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    await prisma.task.deleteMany();
    return NextResponse.json({ message: "All tasks deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete all tasks" }, { status: 500 });
  }
}