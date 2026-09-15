import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

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
        await supabase.from("catering_inquiries").insert(inquiry);
      } catch (err) {
        console.error("Supabase insert error:", err);
      }
    } else {
      const filePath = path.join(process.cwd(), "data", "catering-inquiries.json");
      const existing = JSON.parse(fs.readFileSync(filePath, "utf8") || "[]");
      existing.unshift(inquiry);
      fs.writeFileSync(filePath, JSON.stringify(existing, null, 2));
    }

    // Email notification
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
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        });

        const html = `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #e9dbc3">
            <div style="background:#191612;padding:24px 32px">
              <h1 style="color:#e9dbc3;margin:0;font-size:22px;font-family:Georgia,serif">🎉 New Catering Inquiry — Umami Street</h1>
            </div>
            <div style="padding:32px">
              <div style="background:#f9f4ec;padding:20px;margin-bottom:24px">
                <p style="margin:0 0 8px"><strong>Name:</strong> ${name}</p>
                <p style="margin:0 0 8px"><strong>Email:</strong> ${email}</p>
                <p style="margin:0 0 8px"><strong>Phone:</strong> ${phone || "—"}</p>
                <p style="margin:0 0 8px"><strong>Event Type:</strong> ${event_type || "—"}</p>
                <p style="margin:0 0 8px"><strong>Event Date:</strong> ${event_date || "—"}</p>
                <p style="margin:0 0 8px"><strong>Location:</strong> ${location || "—"}</p>
                <p style="margin:0 0 8px"><strong>Guest Count:</strong> ${guest_count || "—"}</p>
                ${menu_notes ? `<p style="margin:0 0 8px"><strong>Menu Preferences:</strong> ${menu_notes}</p>` : ""}
                ${message ? `<p style="margin:0"><strong>Message:</strong> ${message}</p>` : ""}
              </div>
              <p style="color:#757065;font-size:12px;margin:0">
                Log into the admin console to manage this inquiry and send a quotation.
              </p>
            </div>
          </div>
        `;

        await transporter.sendMail({
          from: `"Umami Street Events" <${process.env.SMTP_USER}>`,
          to: process.env.EMAIL_TO,
          subject: `🎉 Catering Inquiry from ${name}`,
          html,
        });
      } catch (err) {
        console.error("Email send error:", err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Catering API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "catering-inquiries.json");
    const inquiries = JSON.parse(fs.readFileSync(filePath, "utf8") || "[]");
    return NextResponse.json(inquiries);
  } catch {
    return NextResponse.json([]);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, status } = await request.json();
    const filePath = path.join(process.cwd(), "data", "catering-inquiries.json");
    const inquiries = JSON.parse(fs.readFileSync(filePath, "utf8") || "[]");
    const updated = inquiries.map((i: { id: string }) =>
      i.id === id ? { ...i, status } : i
    );
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
