import { NextRequest, NextResponse } from "next/server";
import { readSessions, writeSessions, readMessages } from "../../_utils";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sessions = readSessions();
  const session = sessions.find((s) => s.id === id);
  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = sessions.map((s) =>
    s.id === id ? { ...s, unread_count: 0 } : s
  );
  writeSessions(updated);

  const allMessages = readMessages();
  const messages = allMessages.filter((m) => m.session_id === id);
  return NextResponse.json({ session: { ...session, unread_count: 0 }, messages });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const sessions = readSessions();
  const updated = sessions.map((s) =>
    s.id === id ? { ...s, ...body, updated_at: new Date().toISOString() } : s
  );
  writeSessions(updated);
  return NextResponse.json({ success: true });
}
