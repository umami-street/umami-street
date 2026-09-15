import { NextRequest, NextResponse } from "next/server";
import {
  readSessions,
  writeSessions,
  readMessages,
  writeMessages,
  type ChatMessage,
} from "../_utils";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { session_id, sender, message, agent_name } = body;
  if (!session_id || !message) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const msg: ChatMessage = {
    id: crypto.randomUUID(),
    session_id,
    sender: sender || "visitor",
    agent_name: agent_name || undefined,
    message,
    created_at: new Date().toISOString(),
  };

  const messages = readMessages();
  messages.push(msg);
  writeMessages(messages);

  const sessions = readSessions();
  const updated = sessions.map((s) => {
    if (s.id !== session_id) return s;
    return {
      ...s,
      last_message: message.slice(0, 80),
      updated_at: new Date().toISOString(),
      unread_count:
        sender === "visitor" ? (s.unread_count || 0) + 1 : s.unread_count,
    };
  });
  writeSessions(updated);

  return NextResponse.json({ success: true, message: msg });
}
