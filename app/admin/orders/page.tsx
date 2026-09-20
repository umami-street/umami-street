"use client";
import { useState, useEffect } from "react";
import { ShoppingBag, ChevronDown, Lock, Smartphone, Landmark } from "lucide-react";

export const runtime = "edge";

type OrderItem = { name: string; qty: number; price: number };
type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  items: OrderItem[];
  subtotal: number;
  notes: string;
  payment_method: string;
  payment_reference: string;
  status: string;
  created_at: string;
  updated_at: string;
};

const STATUSES = [
  "pending_payment",
  "confirmed",
  "preparing",
  "ready_for_pickup",
  "delivered",
  "cancelled",
];

const STATUS_LABEL: Record<string, string> = {
  pending_payment: "Pending Payment",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready_for_pickup: "Ready / Out",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const statusColor: Record<string, string> = {
  pending_payment: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  preparing: "bg-orange-100 text-orange-700",
  ready_for_pickup: "bg-green-100 text-green-700",
  delivered: "bg-stone/20 text-stone",
  cancelled: "bg-red-100 text-red-600",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(data);
    } catch {
      setOrders([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string, hasPaymentRef: boolean) => {
    if (status === "confirmed" && !hasPaymentRef) return; // gate
    await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
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
        <p className="text-stone mt-1">Manage customer orders. Orders require a payment reference before they can be confirmed.</p>
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
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wide border transition-colors ${
                filter === s ? "bg-maroon text-cream border-maroon" : "border-stone/30 text-stone hover:border-maroon hover:text-maroon"
              }`}
            >
              {STATUS_LABEL[s]} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white p-12 text-center text-stone shadow-sm">
          <ShoppingBag size={40} className="mx-auto mb-3 opacity-30" />
          <p>No orders {filter !== "all" ? `with status "${STATUS_LABEL[filter] ?? filter}"` : "yet"}.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const hasRef = !!order.payment_reference?.trim();
            return (
              <div key={order.id} className="bg-white shadow-sm">
                {/* Order Header */}
                <div
                  className="flex flex-wrap items-center gap-4 p-5 cursor-pointer hover:bg-cream/30 transition-colors"
                  onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 font-semibold rounded-full ${statusColor[order.status] ?? "bg-stone/10 text-stone"}`}>
                        {STATUS_LABEL[order.status] ?? order.status}
                      </span>
                      {order.order_number && (
                        <span className="text-stone text-xs font-mono font-semibold">{order.order_number}</span>
                      )}
                      {!hasRef && order.status === "pending_payment" && (
                        <span className="text-xs text-yellow-600 flex items-center gap-1">
                          <Lock size={11} /> Awaiting ref
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-charcoal">{order.customer_name}</p>
                    <p className="text-stone text-xs">{order.customer_email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-maroon">₱{order.subtotal}</p>
                    <p className="text-stone text-xs">
                      {new Date(order.created_at).toLocaleDateString("en-PH", {
                        month: "short", day: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`text-stone shrink-0 transition-transform ${expanded === order.id ? "rotate-180" : ""}`}
                  />
                </div>

                {/* Expanded */}
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
                              <td colSpan={2} className="pt-3 font-bold text-charcoal">Subtotal</td>
                              <td className="pt-3 font-bold text-maroon text-right">₱{order.subtotal}</td>
                            </tr>
                          </tfoot>
                        </table>
                        {order.notes && (
                          <div className="mt-4 bg-white p-3 text-sm text-stone">
                            <p className="font-semibold text-charcoal text-xs mb-1">Delivery Notes:</p>
                            {order.notes}
                          </div>
                        )}
                      </div>

                      {/* Customer, Payment & Status */}
                      <div className="space-y-5">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-stone mb-2">Customer</p>
                          <p className="text-sm text-charcoal font-semibold">{order.customer_name}</p>
                          <p className="text-sm text-stone">{order.customer_email}</p>
                          {order.customer_phone && <p className="text-sm text-stone">{order.customer_phone}</p>}
                        </div>

                        {/* Payment */}
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-stone mb-2">Payment</p>
                          <div className="bg-white p-3 border border-stone/20 space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              {order.payment_method === "gcash" ? (
                                <Smartphone size={14} className="text-stone shrink-0" />
                              ) : order.payment_method === "bank" ? (
                                <Landmark size={14} className="text-stone shrink-0" />
                              ) : null}
                              <span className="text-stone capitalize">
                                {order.payment_method === "gcash" ? "GCash" : order.payment_method === "bank" ? "Bank Transfer" : "—"}
                              </span>
                            </div>
                            {hasRef ? (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-stone">Ref #:</span>
                                <span className="font-bold text-charcoal">{order.payment_reference}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-yellow-700">
                                <Lock size={13} />
                                <span className="text-xs font-semibold">No payment reference yet</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Status actions */}
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-stone mb-2">Update Status</p>
                          <div className="flex flex-wrap gap-2">
                            {STATUSES.map((s) => {
                              const isConfirmGate = s === "confirmed" && !hasRef;
                              return (
                                <button
                                  key={s}
                                  onClick={() => updateStatus(order.id, s, hasRef)}
                                  disabled={isConfirmGate}
                                  title={isConfirmGate ? "Cannot confirm — no payment reference on file" : undefined}
                                  className={`px-3 py-1.5 text-xs font-semibold border transition-colors ${
                                    order.status === s
                                      ? "bg-charcoal text-cream border-charcoal"
                                      : isConfirmGate
                                      ? "border-stone/20 text-stone/30 cursor-not-allowed"
                                      : "border-stone/30 text-stone hover:border-maroon hover:text-maroon"
                                  }`}
                                >
                                  {isConfirmGate && <Lock size={10} className="inline mr-1" />}
                                  {STATUS_LABEL[s]}
                                </button>
                              );
                            })}
                          </div>
                          {!hasRef && (
                            <p className="text-xs text-yellow-700 mt-2 flex items-center gap-1">
                              <Lock size={11} /> &ldquo;Confirmed&rdquo; is locked until a payment reference is recorded.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
