import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { session_id, sender, message, agent_name } = body;
  if (!session_id || !message) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const msg = {
    session_id,
    sender: sender || "visitor",
    agent_name: agent_name || null,
    message,
    created_at: new Date().toISOString(),
  };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("chat_messages")
    .insert(msg)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, message: data });
}
