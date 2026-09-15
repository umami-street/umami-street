import { NextRequest, NextResponse } from "next/server";
import { readSessions, writeSessions, type ChatSession } from "../_utils";

export async function GET() {
  const sessions = readSessions();
  return NextResponse.json(
    sessions.sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const now = new Date().toISOString();
  const session: ChatSession = {
    id: crypto.randomUUID(),
    visitor_name: body.visitor_name || "Visitor",
    visitor_email: body.visitor_email || "",
    visitor_contact: body.visitor_contact || "",
    concern_type: body.concern_type || "other",
    concern_background: body.concern_background || "",
    status: "open",
    unread_count: 0,
    last_message: "",
    created_at: now,
    updated_at: now,
  };
  const sessions = readSessions();
  sessions.unshift(session);
  writeSessions(sessions);
  return NextResponse.json({ sessionId: session.id });
}
