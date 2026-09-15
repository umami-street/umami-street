import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

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

    // Save to Supabase if configured, otherwise save to local JSON file
    const supabaseConfigured =
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project");

    if (supabaseConfigured) {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        await supabase.from("orders").insert(newOrder);
      } catch (err) {
        console.error("Supabase insert error:", err);
      }
    } else {
      // Fallback: save to local data/orders.json
      const filePath = path.join(process.cwd(), "data", "orders.json");
      const existing = JSON.parse(fs.readFileSync(filePath, "utf8") || "[]");
      existing.unshift(newOrder);
      fs.writeFileSync(filePath, JSON.stringify(existing, null, 2));
    }

    // Send email notification if SMTP configured
    if (
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      !process.env.SMTP_USER.includes("your-gmail")
    ) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        const itemsHtml = items
          .map(
            (item: { name: string; qty: number; price: number }) =>
              `<tr>
                <td style="padding:8px 12px;border-bottom:1px solid #e9dbc3">${item.name}</td>
                <td style="padding:8px 12px;border-bottom:1px solid #e9dbc3;text-align:center">${item.qty}</td>
                <td style="padding:8px 12px;border-bottom:1px solid #e9dbc3;text-align:right">₱${item.price * item.qty}</td>
              </tr>`
          )
          .join("");

        const html = `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #e9dbc3">
            <div style="background:#191612;padding:24px 32px">
              <h1 style="color:#e9dbc3;margin:0;font-size:24px;font-family:Georgia,serif">🍜 New Order — Umami Street</h1>
            </div>
            <div style="padding:32px">
              <div style="background:#f9f4ec;padding:20px;margin-bottom:24px">
                <p style="margin:0 0 8px"><strong>Customer:</strong> ${customer_name}</p>
                <p style="margin:0 0 8px"><strong>Email:</strong> ${customer_email}</p>
                <p style="margin:0 0 8px"><strong>Phone:</strong> ${customer_phone || "—"}</p>
                ${notes ? `<p style="margin:0"><strong>Notes:</strong> ${notes}</p>` : ""}
              </div>

              <table style="width:100%;border-collapse:collapse">
                <thead>
                  <tr style="background:#191612;color:#e9dbc3">
                    <th style="padding:10px 12px;text-align:left">Item</th>
                    <th style="padding:10px 12px;text-align:center">Qty</th>
                    <th style="padding:10px 12px;text-align:right">Price</th>
                  </tr>
                </thead>
                <tbody>${itemsHtml}</tbody>
              </table>

              <div style="text-align:right;margin-top:16px;font-size:18px;font-weight:bold;color:#872715">
                Total: ₱${subtotal}
              </div>

              <div style="margin-top:32px;padding-top:20px;border-top:1px solid #e9dbc3">
                <p style="color:#757065;font-size:12px;margin:0">
                  This order was placed via the Umami Street website. Log into the admin console to manage this order.
                </p>
              </div>
            </div>
          </div>
        `;

        await transporter.sendMail({
          from: `"Umami Street Orders" <${process.env.SMTP_USER}>`,
          to: process.env.EMAIL_TO,
          subject: `🍜 New Order from ${customer_name}`,
          html,
        });
      } catch (err) {
        console.error("Email send error:", err);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Order API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "orders.json");
    const orders = JSON.parse(fs.readFileSync(filePath, "utf8") || "[]");
    return NextResponse.json(orders);
  } catch {
    return NextResponse.json([]);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, status } = await request.json();
    const filePath = path.join(process.cwd(), "data", "orders.json");
    const orders = JSON.parse(fs.readFileSync(filePath, "utf8") || "[]");
    const updated = orders.map((o: { id: string }) =>
      o.id === id ? { ...o, status } : o
    );
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
