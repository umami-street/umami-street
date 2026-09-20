"use client";
import { useState } from "react";
import { Search, Package, CheckCircle, Clock, Truck, XCircle } from "lucide-react";

type OrderStatus = "pending_payment" | "confirmed" | "preparing" | "ready_for_pickup" | "delivered" | "cancelled";

type Order = {
  order_number: string;
  customer_name: string;
  status: OrderStatus;
  items: { name: string; price: number; qty: number }[];
  subtotal: number;
  payment_method: string;
  notes?: string;
  created_at: string;
  updated_at: string;
};

const STATUS_STEPS: { key: OrderStatus; label: string; icon: React.ReactNode }[] = [
  { key: "pending_payment", label: "Awaiting Payment Verification", icon: <Clock size={18} /> },
  { key: "confirmed", label: "Order Confirmed", icon: <CheckCircle size={18} /> },
  { key: "preparing", label: "Preparing Your Order", icon: <Package size={18} /> },
  { key: "ready_for_pickup", label: "Ready / Out for Delivery", icon: <Truck size={18} /> },
  { key: "delivered", label: "Delivered", icon: <CheckCircle size={18} /> },
];

function stepIndex(status: OrderStatus) {
  if (status === "cancelled") return -1;
  return STATUS_STEPS.findIndex((s) => s.key === status);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-PH", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}

export default function OrderTracker() {
  const [orderNum, setOrderNum] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNum.trim() || !email.trim()) {
      setError("Please enter both your order number and email address.");
      return;
    }
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const res = await fetch(
        `/api/orders/track?number=${encodeURIComponent(orderNum.trim().toUpperCase())}&email=${encodeURIComponent(email.trim().toLowerCase())}`
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Order not found.");
        return;
      }
      setOrder(data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const currentStep = order ? stepIndex(order.status) : -1;

  return (
    <div className="min-h-screen bg-cream py-20 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="label-tag mb-3">Order Status</p>
          <h1 className="section-heading text-charcoal mb-4">Track Your Order</h1>
          <p className="section-subheading text-stone mx-auto text-center">
            Enter your order number and the email address you used when placing your order.
          </p>
        </div>

        {/* Search form */}
        <form onSubmit={handleSearch} className="bg-white border border-stone/20 p-6 mb-8">
          <div className="space-y-4 mb-5">
            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase tracking-wide mb-1">
                Order Number
              </label>
              <input
                type="text"
                value={orderNum}
                onChange={(e) => setOrderNum(e.target.value)}
                className="w-full border border-stone/40 px-4 py-3 text-sm bg-cream"
                placeholder="e.g. US-20260920-4821"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase tracking-wide mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-stone/40 px-4 py-3 text-sm bg-cream"
                placeholder="The email you used when ordering"
              />
            </div>
          </div>
          {error && <p className="text-maroon text-sm mb-4">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Search size={16} />
            {loading ? "Searching..." : "Track Order"}
          </button>
        </form>

        {/* Result */}
        {order && (
          <div className="bg-white border border-stone/20">
            {/* Order header */}
            <div className="bg-charcoal text-cream px-6 py-5">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <p className="text-cream/60 text-xs uppercase tracking-wide mb-1">Order Number</p>
                  <p className="text-2xl font-bold tracking-widest text-maroon" style={{ fontFamily: "var(--font-playfair)" }}>
                    {order.order_number}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-cream/60 text-xs mb-1">Placed</p>
                  <p className="text-sm text-cream">{formatDate(order.created_at)}</p>
                </div>
              </div>
              <p className="text-cream/80 text-sm mt-2">{order.customer_name}</p>
            </div>

            <div className="p-6">
              {/* Cancelled state */}
              {order.status === "cancelled" ? (
                <div className="flex items-center gap-3 text-maroon bg-maroon/5 border border-maroon/20 px-4 py-4 mb-6">
                  <XCircle size={22} />
                  <div>
                    <p className="font-semibold">Order Cancelled</p>
                    <p className="text-sm text-stone">Please contact us at hello.umamistreet@gmail.com if you have questions.</p>
                  </div>
                </div>
              ) : (
                /* Status timeline */
                <div className="mb-8">
                  <p className="text-xs font-semibold text-charcoal uppercase tracking-wide mb-5">Order Progress</p>
                  <div className="space-y-0">
                    {STATUS_STEPS.map((s, idx) => {
                      const done = idx < currentStep;
                      const active = idx === currentStep;
                      const pending = idx > currentStep;
                      return (
                        <div key={s.key} className="flex gap-4">
                          {/* Line + dot */}
                          <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                              done ? "bg-maroon text-cream" : active ? "bg-maroon text-cream ring-4 ring-maroon/20" : "bg-stone/20 text-stone/50"
                            }`}>
                              {s.icon}
                            </div>
                            {idx < STATUS_STEPS.length - 1 && (
                              <div className={`w-0.5 h-8 mt-1 ${done ? "bg-maroon" : "bg-stone/20"}`} />
                            )}
                          </div>
                          {/* Label */}
                          <div className="pb-6">
                            <p className={`text-sm font-semibold ${done || active ? "text-charcoal" : "text-stone/50"}`}>
                              {s.label}
                            </p>
                            {active && (
                              <p className="text-xs text-maroon mt-0.5">
                                {s.key === "pending_payment"
                                  ? "Your payment reference is being verified by our team."
                                  : s.key === "confirmed"
                                  ? "Payment verified! Your order is queued for preparation."
                                  : s.key === "preparing"
                                  ? "Our kitchen is working on your order."
                                  : s.key === "ready_for_pickup"
                                  ? "Your order is ready! Delivery is on its way."
                                  : "Your order has been delivered. Enjoy!"}
                              </p>
                            )}
                            {pending && (
                              <p className="text-xs text-stone/40 mt-0.5">Upcoming</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Items */}
              <div className="border-t border-stone/20 pt-5">
                <p className="text-xs font-semibold text-charcoal uppercase tracking-wide mb-3">Items</p>
                <div className="space-y-1">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm text-stone">
                      <span>{item.name} × {item.qty}</span>
                      <span>₱{item.price * item.qty}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-charcoal pt-2 border-t border-stone/20 mt-2">
                    <span>Subtotal</span>
                    <span className="text-maroon">₱{order.subtotal}</span>
                  </div>
                  <p className="text-stone/50 text-xs">+ Delivery fee (confirmed separately)</p>
                </div>
              </div>

              {order.notes && (
                <div className="border-t border-stone/20 pt-4 mt-4">
                  <p className="text-xs font-semibold text-charcoal uppercase tracking-wide mb-1">Delivery Notes</p>
                  <p className="text-sm text-stone">{order.notes}</p>
                </div>
              )}

              <div className="border-t border-stone/20 pt-4 mt-4 text-xs text-stone/50">
                Last updated: {formatDate(order.updated_at)}
              </div>
            </div>
          </div>
        )}

        <div className="text-center mt-8 text-sm text-stone">
          Questions about your order?{" "}
          <a href="mailto:hello.umamistreet@gmail.com" className="text-maroon hover:underline">hello.umamistreet@gmail.com</a>
          {" "}·{" "}
          <a href="tel:+639910079097" className="text-maroon hover:underline">0991 007 9097</a>
        </div>
      </div>
    </div>
  );
}
