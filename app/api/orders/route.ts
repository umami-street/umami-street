import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer_name, customer_email, customer_phone, items, subtotal, notes } = body;

    if (!customer_name || !customer_email || !items?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newOrder = {
      id: crypto.randomUUID(),
      customer_name,
      customer_email,
      customer_phone,
      items,
      subtotal,
      notes,
      status: "new",
      created_at: new Date().toISOString(),
    };

    const supabase = await createClient();
    const { error } = await supabase.from("orders").insert(newOrder);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Order API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("orders")
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
    await supabase.from("orders").update({ status }).eq("id", id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
