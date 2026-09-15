"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { ShoppingBag, ChevronDown } from "lucide-react";

type OrderItem = { name: string; qty: number; price: number };
type Order = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  items: OrderItem[];
  subtotal: number;
  notes: string;
  status: string;
  created_at: string;
};

const STATUSES = ["new", "confirmed", "preparing", "ready", "completed", "cancelled"];

const statusColor: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  confirmed: "bg-yellow-100 text-yellow-700",
  preparing: "bg-orange-100 text-orange-700",
  ready: "bg-green-100 text-green-700",
  completed: "bg-stone/20 text-stone",
  cancelled: "bg-red-100 text-red-600",
};

const isSupabaseConfigured = () =>
  typeof window !== "undefined" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project");

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        const { data } = await supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false });
        setOrders(data ?? []);
      } else {
        // Load from local JSON file via API
        const res = await fetch("/api/orders");
        const data = await res.json();
        setOrders(data);
      }
    } catch {
      setOrders([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      await supabase.from("orders").update({ status }).eq("id", id);
    } else {
      await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
    }
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  if (loading) return <div className="p-8 text-stone">Loading orders...</div>;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-charcoal" style={{ fontFamily: "var(--font-playfair)" }}>
          Orders
        </h1>
        <p className="text-stone mt-1">View and manage customer orders.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wide border transition-colors ${
            filter === "all" ? "bg-charcoal text-cream border-charcoal" : "border-stone/30 text-stone hover:border-charcoal hover:text-charcoal"
          }`}
        >
          All ({orders.length})
        </button>
        {STATUSES.map((s) => {
          const count = orders.filter((o) => o.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wide border transition-colors capitalize ${
                filter === s ? "bg-maroon text-cream border-maroon" : "border-stone/30 text-stone hover:border-maroon hover:text-maroon"
              }`}
            >
              {s} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white p-12 text-center text-stone shadow-sm">
          <ShoppingBag size={40} className="mx-auto mb-3 opacity-30" />
          <p>No orders {filter !== "all" ? `with status "${filter}"` : "yet"}.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <div key={order.id} className="bg-white shadow-sm">
              {/* Order Header */}
              <div
                className="flex flex-wrap items-center gap-4 p-5 cursor-pointer hover:bg-cream/30 transition-colors"
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 font-semibold rounded-full ${statusColor[order.status]}`}>
                      {order.status}
                    </span>
                    <span className="text-stone text-xs font-mono">#{order.id.slice(0, 8)}</span>
                  </div>
                  <p className="font-bold text-charcoal">{order.customer_name}</p>
                  <p className="text-stone text-xs">{order.customer_email}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-maroon">₱{order.subtotal}</p>
                  <p className="text-stone text-xs">
                    {new Date(order.created_at).toLocaleDateString("en-PH", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <ChevronDown
                  size={18}
                  className={`text-stone shrink-0 transition-transform ${expanded === order.id ? "rotate-180" : ""}`}
                />
              </div>

              {/* Expanded Details */}
              {expanded === order.id && (
                <div className="border-t border-stone/10 p-5 bg-cream/30">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Items */}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-stone mb-3">Order Items</p>
                      <table className="w-full text-sm">
                        <tbody>
                          {(order.items || []).map((item, i) => (
                            <tr key={i} className="border-b border-stone/10">
                              <td className="py-2 text-charcoal">{item.name}</td>
                              <td className="py-2 text-stone text-center">×{item.qty}</td>
                              <td className="py-2 text-maroon text-right font-medium">₱{item.price * item.qty}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan={2} className="pt-3 font-bold text-charcoal">Total</td>
                            <td className="pt-3 font-bold text-maroon text-right">₱{order.subtotal}</td>
                          </tr>
                        </tfoot>
                      </table>
                      {order.notes && (
                        <div className="mt-4 bg-white p-3 text-sm text-stone">
                          <p className="font-semibold text-charcoal text-xs mb-1">Notes:</p>
                          {order.notes}
                        </div>
                      )}
                    </div>

                    {/* Customer & Status */}
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-stone mb-2">Customer</p>
                        <p className="text-sm text-charcoal">{order.customer_name}</p>
                        <p className="text-sm text-stone">{order.customer_email}</p>
                        {order.customer_phone && <p className="text-sm text-stone">{order.customer_phone}</p>}
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-stone mb-2">Update Status</p>
                        <div className="flex flex-wrap gap-2">
                          {STATUSES.map((s) => (
                            <button
                              key={s}
                              onClick={() => updateStatus(order.id, s)}
                              className={`px-3 py-1.5 text-xs font-semibold border capitalize transition-colors ${
                                order.status === s
                                  ? "bg-charcoal text-cream border-charcoal"
                                  : "border-stone/30 text-stone hover:border-maroon hover:text-maroon"
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
