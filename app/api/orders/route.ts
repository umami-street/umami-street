import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { sendEmail, orderAdminHtml, orderCustomerHtml } from "@/lib/email";

export const runtime = "edge";

function generateOrderNumber(): string {
  const d = new Date();
  const date = d.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = String(Math.floor(1000 + Math.random() * 9000));
  return `US-${date}-${rand}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customer_name,
      customer_email,
      customer_phone,
      items,
      subtotal,
      notes,
      payment_method,
      payment_reference,
    } = body;

    if (!customer_name || !customer_email || !items?.length || !payment_method || !payment_reference) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const order_number = generateOrderNumber();
    const now = new Date().toISOString();

    const newOrder = {
      id: crypto.randomUUID(),
      order_number,
      customer_name,
      customer_email,
      customer_phone: customer_phone || "",
      items,
      subtotal,
      notes: notes || "",
      payment_method,
      payment_reference,
      status: "pending_payment",
      created_at: now,
      updated_at: now,
    };

    const supabase = await createClient();
    const { error } = await supabase.from("orders").insert(newOrder);
    if (error) throw error;

    // Fire-and-forget emails
    const emailData = { order_number, customer_name, customer_email, customer_phone, items, subtotal, notes, payment_method, payment_reference };
    sendEmail("hello.umamistreet@gmail.com", `New Order – ${order_number} – ${customer_name}`, orderAdminHtml(emailData));
    sendEmail(customer_email, `Your Umami Street Order ${order_number}`, orderCustomerHtml(emailData));

    return NextResponse.json({ success: true, order_number });
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
    await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
