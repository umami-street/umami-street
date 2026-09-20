import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const order_number = searchParams.get("number")?.trim().toUpperCase();
  const email = searchParams.get("email")?.trim().toLowerCase();

  if (!order_number || !email) {
    return NextResponse.json({ error: "Order number and email are required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("order_number, customer_name, status, items, subtotal, payment_method, notes, created_at, updated_at")
    .eq("order_number", order_number)
    .eq("customer_email", email)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Order not found. Please check your order number and email address." }, { status: 404 });
  }

  return NextResponse.json(data);
}
