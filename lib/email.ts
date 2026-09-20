const RESEND_KEY = process.env.RESEND_API_KEY;
const FROM = "Umami Street <noreply@umamistreet.ph>";

export async function sendEmail(
  to: string | string[],
  subject: string,
  html: string
): Promise<void> {
  if (!RESEND_KEY) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
      }),
    });
  } catch {
    // email never crashes the main flow
  }
}

export function orderAdminHtml(o: {
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  items: { name: string; price: number; qty: number }[];
  subtotal: number;
  notes?: string;
  payment_method: string;
  payment_reference: string;
}) {
  const rows = o.items
    .map(
      (i) =>
        `<tr><td style="padding:5px">${i.name}</td><td style="padding:5px;text-align:center">×${i.qty}</td><td style="padding:5px;text-align:right">₱${i.price * i.qty}</td></tr>`
    )
    .join("");

  return `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#333">
  <div style="background:#7B2D2D;padding:20px;text-align:center">
    <h1 style="color:#fff;margin:0;font-size:22px">New Order Received</h1>
    <p style="color:#f5c8c8;margin:6px 0 0;font-size:14px">Order #${o.order_number}</p>
  </div>
  <div style="padding:24px;background:#fff">
    <h2 style="font-size:15px;border-bottom:1px solid #eee;padding-bottom:6px">Customer</h2>
    <p><strong>Name:</strong> ${o.customer_name}</p>
    <p><strong>Email:</strong> ${o.customer_email}</p>
    <p><strong>Phone:</strong> ${o.customer_phone || "—"}</p>
    <p><strong>Address / Notes:</strong> ${o.notes || "—"}</p>
    <h2 style="font-size:15px;border-bottom:1px solid #eee;padding-bottom:6px;margin-top:20px">Items</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <thead><tr style="background:#f5f5f5"><th style="padding:6px;text-align:left">Item</th><th style="padding:6px">Qty</th><th style="padding:6px;text-align:right">Price</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr><td colspan="2" style="padding:8px;font-weight:bold;border-top:2px solid #eee">Subtotal</td><td style="padding:8px;font-weight:bold;color:#7B2D2D;text-align:right;border-top:2px solid #eee">₱${o.subtotal}</td></tr></tfoot>
    </table>
    <h2 style="font-size:15px;border-bottom:1px solid #eee;padding-bottom:6px;margin-top:20px">Payment</h2>
    <p><strong>Method:</strong> ${o.payment_method === "gcash" ? "GCash" : "Bank Transfer"}</p>
    <p><strong>Reference #:</strong> <span style="color:#7B2D2D;font-weight:bold">${o.payment_reference}</span></p>
    <div style="background:#FFF8E7;border-left:4px solid #E8A020;padding:12px;margin-top:16px;font-size:14px">
      <strong>Action Required:</strong> Verify the payment reference above, then update this order's status in the admin panel.
    </div>
  </div>
  <div style="padding:14px;background:#f5f5f5;text-align:center;font-size:12px;color:#888">Umami Street · hello.umamistreet@gmail.com</div>
</div>`;
}

export function orderCustomerHtml(o: {
  order_number: string;
  customer_name: string;
  items: { name: string; price: number; qty: number }[];
  subtotal: number;
  payment_method: string;
  payment_reference: string;
}) {
  const rows = o.items
    .map(
      (i) =>
        `<tr><td style="padding:4px">${i.name}</td><td style="padding:4px;text-align:center">×${i.qty}</td><td style="padding:4px;text-align:right">₱${i.price * i.qty}</td></tr>`
    )
    .join("");

  return `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#333">
  <div style="background:#7B2D2D;padding:24px;text-align:center">
    <h1 style="color:#fff;margin:0;font-size:22px">Order Received!</h1>
    <p style="color:#f5c8c8;margin:4px 0 0">Thank you, ${o.customer_name}!</p>
  </div>
  <div style="padding:24px;background:#fff">
    <p style="font-size:14px">We've received your order and payment reference. Our team will verify your payment and confirm your order shortly.</p>
    <div style="background:#f9f9f9;border:1px solid #eee;padding:16px;text-align:center;margin:20px 0">
      <p style="margin:0;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px">Your Order Number</p>
      <p style="margin:8px 0 0;font-size:28px;font-weight:bold;color:#7B2D2D;letter-spacing:3px">${o.order_number}</p>
      <p style="margin:10px 0 0;font-size:12px;color:#888">Track your order at <a href="https://umamistreet.ph/track-order" style="color:#7B2D2D">umamistreet.ph/track-order</a></p>
    </div>
    <h2 style="font-size:15px;border-bottom:1px solid #eee;padding-bottom:6px">Order Summary</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tbody>${rows}</tbody>
      <tfoot><tr><td colspan="2" style="padding:8px;font-weight:bold;border-top:2px solid #eee">Subtotal</td><td style="padding:8px;font-weight:bold;color:#7B2D2D;text-align:right;border-top:2px solid #eee">₱${o.subtotal}</td></tr></tfoot>
    </table>
    <p style="font-size:12px;color:#888;margin-top:4px">+ Delivery fee will be confirmed upon processing.</p>
    <h2 style="font-size:15px;border-bottom:1px solid #eee;padding-bottom:6px;margin-top:20px">Payment Submitted</h2>
    <p><strong>Method:</strong> ${o.payment_method === "gcash" ? "GCash" : "Bank Transfer"}</p>
    <p><strong>Reference #:</strong> ${o.payment_reference}</p>
    <p style="font-size:13px;margin-top:20px;color:#666">Questions? Email <a href="mailto:hello.umamistreet@gmail.com" style="color:#7B2D2D">hello.umamistreet@gmail.com</a> or call <a href="tel:+639910079097" style="color:#7B2D2D">0991 007 9097</a>.</p>
  </div>
  <div style="padding:14px;background:#f5f5f5;text-align:center;font-size:12px;color:#888">Umami Street · Naic, Cavite</div>
</div>`;
}

export function cateringAdminHtml(i: {
  name: string;
  email: string;
  phone?: string;
  event_type?: string;
  event_date?: string;
  location?: string;
  guest_count?: string;
  menu_notes?: string;
  message?: string;
}) {
  return `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#333">
  <div style="background:#7B2D2D;padding:20px;text-align:center">
    <h1 style="color:#fff;margin:0;font-size:22px">New Catering Inquiry</h1>
  </div>
  <div style="padding:24px;background:#fff">
    <p><strong>Name:</strong> ${i.name}</p>
    <p><strong>Email:</strong> ${i.email}</p>
    <p><strong>Phone:</strong> ${i.phone || "—"}</p>
    <p><strong>Event Type:</strong> ${i.event_type || "—"}</p>
    <p><strong>Event Date:</strong> ${i.event_date || "—"}</p>
    <p><strong>Location:</strong> ${i.location || "—"}</p>
    <p><strong>Estimated Guests:</strong> ${i.guest_count || "—"}</p>
    <p><strong>Preferred Menu:</strong> ${i.menu_notes || "—"}</p>
    <p><strong>Message:</strong> ${i.message || "—"}</p>
  </div>
  <div style="padding:14px;background:#f5f5f5;text-align:center;font-size:12px;color:#888">Umami Street · admin@umamistreet.ph</div>
</div>`;
}

export function cateringCustomerHtml(name: string, email: string) {
  return `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#333">
  <div style="background:#7B2D2D;padding:24px;text-align:center">
    <h1 style="color:#fff;margin:0;font-size:22px">Inquiry Received!</h1>
    <p style="color:#f5c8c8;margin:4px 0 0">Thank you, ${name}!</p>
  </div>
  <div style="padding:24px;background:#fff">
    <p style="font-size:14px">We've received your catering inquiry and will reach out to <strong>${email}</strong> with a custom quotation within 1–2 business days.</p>
    <p style="font-size:13px;color:#666">For urgent inquiries, call us at <a href="tel:+639910079097" style="color:#7B2D2D">0991 007 9097</a>.</p>
  </div>
  <div style="padding:14px;background:#f5f5f5;text-align:center;font-size:12px;color:#888">Umami Street · Naic, Cavite</div>
</div>`;
}

export function chatAdminHtml(s: {
  visitor_name: string;
  visitor_email?: string;
  visitor_contact?: string;
  concern_type?: string;
  concern_background?: string;
}) {
  return `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#333">
  <div style="background:#7B2D2D;padding:20px;text-align:center">
    <h1 style="color:#fff;margin:0;font-size:22px">New Live Chat Started</h1>
  </div>
  <div style="padding:24px;background:#fff">
    <p><strong>Name:</strong> ${s.visitor_name}</p>
    <p><strong>Email:</strong> ${s.visitor_email || "—"}</p>
    <p><strong>Contact:</strong> ${s.visitor_contact || "—"}</p>
    <p><strong>Concern Type:</strong> ${s.concern_type || "—"}</p>
    <p><strong>Background:</strong> ${s.concern_background || "—"}</p>
    <div style="background:#FFF8E7;border-left:4px solid #E8A020;padding:12px;margin-top:16px;font-size:14px">
      Log in to the admin panel to respond to this visitor.
    </div>
  </div>
  <div style="padding:14px;background:#f5f5f5;text-align:center;font-size:12px;color:#888">Umami Street · admin@umamistreet.ph</div>
</div>`;
}
