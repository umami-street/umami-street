import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, event_type, event_date, location, guest_count, menu_notes, message } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const inquiry = {
      id: crypto.randomUUID(),
      name,
      email,
      phone: phone || "",
      event_type: event_type || "",
      event_date: event_date || "",
      location: location || "",
      guest_count: guest_count || "",
      menu_notes: menu_notes || "",
      message: message || "",
      status: "new",
      created_at: new Date().toISOString(),
    };

    const supabase = await createClient();
    const { error } = await supabase.from("catering_inquiries").insert(inquiry);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Catering API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("catering_inquiries")
      .select("*")
      .order("created_at", { ascending: false });
    return NextResponse.json(data ?? []);
  } catch {
    return NextResponse.json([]);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, status } = await request.json();
    const supabase = await createClient();
    await supabase.from("catering_inquiries").update({ status }).eq("id", id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
