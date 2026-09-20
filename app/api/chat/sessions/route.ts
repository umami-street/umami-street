import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { sendEmail, chatAdminHtml } from "@/lib/email";

export const runtime = "edge";

export async function GET() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("chat_sessions")
    .select("*")
    .order("updated_at", { ascending: false });
  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const now = new Date().toISOString();
  const session = {
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

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("chat_sessions")
    .insert(session)
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  sendEmail(
    "admin@umamistreet.ph",
    `New Live Chat – ${session.visitor_name}`,
    chatAdminHtml({
      visitor_name: session.visitor_name,
      visitor_email: session.visitor_email,
      visitor_contact: session.visitor_contact,
      concern_type: session.concern_type,
      concern_background: session.concern_background,
    })
  );

  return NextResponse.json({ sessionId: data.id });
}
