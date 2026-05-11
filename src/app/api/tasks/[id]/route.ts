import { NextResponse } from "next/server";

export async function GET() { return NextResponse.json({ error: "Use /api/tasks?id=..." }, { status: 400 }); }
export async function PATCH() { return NextResponse.json({ error: "Use POST /api/tasks with _action:patch" }, { status: 400 }); }
export async function DELETE() { return NextResponse.json({ error: "Use POST /api/tasks with _action:delete" }, { status: 400 }); }