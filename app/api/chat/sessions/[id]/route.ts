import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export const runtime = "edge";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: session, error } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !session) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await supabase
    .from("chat_sessions")
    .update({ unread_count: 0 })
    .eq("id", id);

  const { data: messages } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("session_id", id)
    .order("created_at", { ascending: true });

  return NextResponse.json({
    session: { ...session, unread_count: 0 },
    messages: messages ?? [],
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const supabase = await createClient();

  await supabase
    .from("chat_sessions")
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq("id", id);

  return NextResponse.json({ success: true });
}
