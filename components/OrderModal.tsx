"use client";
import { useState, useEffect } from "react";
import { X, Plus, Minus, ShoppingBag, User, Building2, ArrowLeft } from "lucide-react";

type Step = "type" | "select" | "details" | "done" | "catering" | "catering-done";

type OrderItem = {
  name: string;
  price: number;
  qty: number;
};

const MENU_FOR_ORDER = [
  { name: "Umami Signature Bowl", price: 159 },
  { name: "Street Grilled Liempo", price: 179 },
  { name: "Crispy Chicken Cutlet", price: 149 },
  { name: "Gawa-Gawa Sisig", price: 155 },
  { name: "Charcoal Grilled Chicken", price: 189 },
  { name: "BBQ Pork Skewers (5 pcs)", price: 135 },
  { name: "Chicken Inasal", price: 169 },
  { name: "Garlic Fried Rice Combo", price: 129 },
  { name: "Adobo Rice Bowl", price: 139 },
  { name: "Sinigang na Hipon Set", price: 185 },
  { name: "Calamansi Soda", price: 69 },
  { name: "Mango Shake", price: 79 },
  { name: "Umami Street Tacos (3 pcs)", price: 169 },
  { name: "Crispy Tokwa't Baboy", price: 125 },
  { name: "Loaded Fries", price: 115 },
];

export default function OrderModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState<Step>("type");
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Catering form state
  const [cName, setCName] = useState("");
  const [cEmail, setCEmail] = useState("");
  const [cPhone, setCPhone] = useState("");
  const [cEventType, setCEventType] = useState("");
  const [cEventDate, setCEventDate] = useState("");
  const [cLocation, setCLocation] = useState("");
  const [cGuests, setCGuests] = useState("");
  const [cMenuNotes, setCMenuNotes] = useState("");
  const [cMessage, setCMessage] = useState("");
  const [cLoading, setCLoading] = useState(false);
  const [cError, setCError] = useState("");

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  const addItem = (item: { name: string; price: number }) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.name === item.name);
      if (existing) {
        return prev.map((c) =>
          c.name === item.name ? { ...c, qty: c.qty + 1 } : c
        );
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeItem = (itemName: string) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.name === itemName);
      if (!existing) return prev;
      if (existing.qty === 1) return prev.filter((c) => c.name !== itemName);
      return prev.map((c) => (c.name === itemName ? { ...c, qty: c.qty - 1 } : c));
    });
  };

  const getQty = (itemName: string) =>
    cart.find((c) => c.name === itemName)?.qty ?? 0;

  const handleSubmit = async () => {
    if (!name || !email) {
      setError("Name and email are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: name,
          customer_email: email,
          customer_phone: phone,
          items: cart,
          subtotal: total,
          notes,
        }),
      });
      if (!res.ok) throw new Error("Failed to place order");
      setStep("done");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCateringSubmit = async () => {
    if (!cName || !cEmail) {
      setCError("Name and email are required.");
      return;
    }
    setCLoading(true);
    setCError("");
    try {
      const res = await fetch("/api/catering-inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cName,
          email: cEmail,
          phone: cPhone,
          event_type: cEventType,
          event_date: cEventDate,
          location: cLocation,
          guest_count: cGuests,
          menu_notes: cMenuNotes,
          message: cMessage,
        }),
      });
      if (!res.ok) throw new Error("Failed to submit");
      setStep("catering-done");
    } catch {
      setCError("Something went wrong. Please try again.");
    } finally {
      setCLoading(false);
    }
  };

  const reset = () => {
    setStep("type");
    setCart([]);
    setName(""); setEmail(""); setPhone(""); setNotes(""); setError("");
    setCName(""); setCEmail(""); setCPhone(""); setCEventType("");
    setCEventDate(""); setCLocation(""); setCGuests(""); setCMenuNotes("");
    setCMessage(""); setCError("");
    onClose();
  };

  const stepTitle = {
    type: "How Can We Help You?",
    select: "Build Your Order",
    details: "Your Details",
    done: "Order Placed!",
    catering: "Events & Catering",
    "catering-done": "Inquiry Received!",
  }[step];

  return (
    <div className="fixed inset-0 z-50 bg-charcoal/80 flex items-center justify-center p-4">
      <div className="bg-cream w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        {/* Header */}
        <div className="sticky top-0 bg-charcoal text-cream px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <ShoppingBag size={20} className="text-maroon" />
            <span className="font-bold" style={{ fontFamily: "var(--font-playfair)" }}>
              {stepTitle}
            </span>
          </div>
          <button onClick={reset} className="text-cream/60 hover:text-cream">
            <X size={22} />
          </button>
        </div>

        <div className="p-6">

          {/* Step 0: Choose customer type */}
          {step === "type" && (
            <>
              <p className="text-stone text-sm mb-6 text-center">
                Let us know what you&apos;re looking for so we can point you in the right direction.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                {/* Customer card */}
                <button
                  onClick={() => setStep("select")}
                  className="group text-left p-6 border-2 border-stone/30 bg-white hover:border-maroon hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 bg-maroon/10 group-hover:bg-maroon flex items-center justify-center mb-4 transition-colors">
                    <User size={24} className="text-maroon group-hover:text-cream transition-colors" />
                  </div>
                  <h3 className="font-bold text-charcoal text-lg mb-2" style={{ fontFamily: "var(--font-playfair)" }}>
                    I&apos;m a Customer
                  </h3>
                  <p className="text-stone text-sm leading-relaxed">
                    I want to place a food order for delivery or pick-up.
                  </p>
                </button>

                {/* B2B / Catering card */}
                <button
                  onClick={() => setStep("catering")}
                  className="group text-left p-6 border-2 border-stone/30 bg-white hover:border-maroon hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 bg-maroon/10 group-hover:bg-maroon flex items-center justify-center mb-4 transition-colors">
                    <Building2 size={24} className="text-maroon group-hover:text-cream transition-colors" />
                  </div>
                  <h3 className="font-bold text-charcoal text-lg mb-2" style={{ fontFamily: "var(--font-playfair)" }}>
                    Events & Catering
                  </h3>
                  <p className="text-stone text-sm leading-relaxed">
                    I&apos;m planning an event, bulk order, corporate meal, or catering setup.
                  </p>
                </button>
              </div>

              {/* Delivery disclaimer */}
              <div className="bg-stone/10 border border-stone/20 px-4 py-3 text-stone text-xs leading-relaxed text-center">
                <span className="font-semibold text-charcoal">Note:</span> Delivery fee may apply depending on your location. Final amount will be confirmed upon order processing.
              </div>
            </>
          )}

          {/* Step 1: Select Items */}
          {step === "select" && (
            <>
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={() => setStep("type")}
                  className="text-stone hover:text-maroon flex items-center gap-1 text-sm transition-colors"
                >
                  <ArrowLeft size={15} /> Back
                </button>
              </div>
              <p className="text-stone text-sm mb-2">
                Select items from our menu and adjust quantities.
              </p>
              <div className="bg-stone/10 border border-stone/20 px-4 py-2 text-stone text-xs mb-5 leading-relaxed">
                Delivery fee may apply depending on your location.
              </div>
              <div className="space-y-3 mb-6">
                {MENU_FOR_ORDER.map((item) => {
                  const qty = getQty(item.name);
                  return (
                    <div
                      key={item.name}
                      className="flex items-center justify-between p-3 bg-white border border-stone/20"
                    >
                      <div>
                        <p className="font-semibold text-charcoal text-sm">{item.name}</p>
                        <p className="text-maroon text-xs font-bold">₱{item.price}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {qty > 0 && (
                          <>
                            <button
                              onClick={() => removeItem(item.name)}
                              className="w-7 h-7 bg-stone/20 hover:bg-maroon hover:text-cream flex items-center justify-center transition-colors"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="font-bold text-charcoal w-4 text-center text-sm">
                              {qty}
                            </span>
                          </>
                        )}
                        <button
                          onClick={() => addItem(item)}
                          className="w-7 h-7 bg-maroon text-cream hover:bg-tan flex items-center justify-center transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {cart.length > 0 && (
                <div className="border-t border-stone/30 pt-4 mb-6">
                  <div className="flex justify-between font-bold text-charcoal">
                    <span>Subtotal</span>
                    <span className="text-maroon">₱{total}</span>
                  </div>
                  <p className="text-stone text-xs mt-1">
                    {cart.reduce((s, i) => s + i.qty, 0)} item(s) selected • Delivery fee not yet included
                  </p>
                </div>
              )}

              <button
                onClick={() => setStep("details")}
                disabled={cart.length === 0}
                className="btn-primary w-full text-center disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue to Details →
              </button>
            </>
          )}

          {/* Step 2: Customer Details */}
          {step === "details" && (
            <>
              <p className="text-stone text-sm mb-6">
                We&apos;ll confirm your order and reach out with the delivery fee for your area.
              </p>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-charcoal uppercase tracking-wide mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-stone/40 px-4 py-3 text-sm bg-white"
                    placeholder="Juan dela Cruz"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal uppercase tracking-wide mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-stone/40 px-4 py-3 text-sm bg-white"
                    placeholder="juan@email.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal uppercase tracking-wide mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-stone/40 px-4 py-3 text-sm bg-white"
                    placeholder="+63 912 345 6789"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal uppercase tracking-wide mb-1">
                    Delivery Address
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full border border-stone/40 px-4 py-3 text-sm bg-white resize-none"
                    placeholder="Street, Barangay, City — or add any special requests here"
                  />
                </div>
              </div>

              <div className="bg-white border border-stone/20 p-4 mb-4">
                <p className="font-semibold text-charcoal text-sm mb-3">Order Summary</p>
                {cart.map((item) => (
                  <div key={item.name} className="flex justify-between text-xs text-stone mb-1">
                    <span>{item.name} × {item.qty}</span>
                    <span>₱{item.price * item.qty}</span>
                  </div>
                ))}
                <div className="border-t border-stone/20 mt-3 pt-3 flex justify-between font-bold text-charcoal">
                  <span>Subtotal</span>
                  <span className="text-maroon">₱{total}</span>
                </div>
                <p className="text-stone/60 text-xs mt-1">+ Delivery fee (to be confirmed)</p>
              </div>

              {error && <p className="text-maroon text-sm mb-4">{error}</p>}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep("select")}
                  className="btn-outline flex-1 text-center"
                >
                  ← Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn-primary flex-1 text-center disabled:opacity-50"
                >
                  {loading ? "Placing Order..." : "Place Order"}
                </button>
              </div>
            </>
          )}

          {/* Done */}
          {step === "done" && (
            <div className="text-center py-10">
              <div className="text-6xl mb-6">🎉</div>
              <h3
                className="text-2xl font-bold text-charcoal mb-3"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Order Received!
              </h3>
              <p className="text-stone mb-2">
                Thank you, <strong>{name}</strong>! Your order has been placed.
              </p>
              <p className="text-stone text-sm mb-4">
                We&apos;ve sent a confirmation to <strong>{email}</strong>. Our team will reach out to confirm your delivery fee and estimated time.
              </p>
              <button onClick={reset} className="btn-primary">
                Close
              </button>
            </div>
          )}

          {/* Catering / B2B — Form */}
          {step === "catering" && (
            <>
              <button
                onClick={() => setStep("type")}
                className="text-stone hover:text-maroon flex items-center gap-1 text-sm transition-colors mb-5"
              >
                <ArrowLeft size={15} /> Back
              </button>

              <p className="text-stone text-sm mb-5 leading-relaxed">
                Fill in the details below and we&apos;ll prepare a custom quotation for your event. We accept corporate orders, office events, private gatherings, bulk orders, packed meals, and catering setups.
              </p>

              <div className="space-y-4 mb-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal uppercase tracking-wide mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={cName}
                      onChange={(e) => setCName(e.target.value)}
                      className="w-full border border-stone/40 px-4 py-3 text-sm bg-white"
                      placeholder="Juan dela Cruz"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-charcoal uppercase tracking-wide mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={cEmail}
                      onChange={(e) => setCEmail(e.target.value)}
                      className="w-full border border-stone/40 px-4 py-3 text-sm bg-white"
                      placeholder="juan@company.com"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal uppercase tracking-wide mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={cPhone}
                      onChange={(e) => setCPhone(e.target.value)}
                      className="w-full border border-stone/40 px-4 py-3 text-sm bg-white"
                      placeholder="+63 912 345 6789"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-charcoal uppercase tracking-wide mb-1">
                      Type of Event
                    </label>
                    <select
                      value={cEventType}
                      onChange={(e) => setCEventType(e.target.value)}
                      className="w-full border border-stone/40 px-4 py-3 text-sm bg-white"
                    >
                      <option value="">Select type…</option>
                      <option>Corporate / Office Event</option>
                      <option>Private Gathering</option>
                      <option>Media / Press Event</option>
                      <option>Community Event</option>
                      <option>Bulk / Packed Meals</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal uppercase tracking-wide mb-1">
                      Event Date
                    </label>
                    <input
                      type="date"
                      value={cEventDate}
                      onChange={(e) => setCEventDate(e.target.value)}
                      className="w-full border border-stone/40 px-4 py-3 text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-charcoal uppercase tracking-wide mb-1">
                      Estimated No. of Guests
                    </label>
                    <input
                      type="text"
                      value={cGuests}
                      onChange={(e) => setCGuests(e.target.value)}
                      className="w-full border border-stone/40 px-4 py-3 text-sm bg-white"
                      placeholder="e.g. 50 pax"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal uppercase tracking-wide mb-1">
                    Event Location
                  </label>
                  <input
                    type="text"
                    value={cLocation}
                    onChange={(e) => setCLocation(e.target.value)}
                    className="w-full border border-stone/40 px-4 py-3 text-sm bg-white"
                    placeholder="Venue name, address, or city"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal uppercase tracking-wide mb-1">
                    Preferred Menu Items
                  </label>
                  <textarea
                    value={cMenuNotes}
                    onChange={(e) => setCMenuNotes(e.target.value)}
                    rows={2}
                    className="w-full border border-stone/40 px-4 py-3 text-sm bg-white resize-none"
                    placeholder="e.g. Chicken Wings, Rice Meals, Drinks..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal uppercase tracking-wide mb-1">
                    Additional Message
                  </label>
                  <textarea
                    value={cMessage}
                    onChange={(e) => setCMessage(e.target.value)}
                    rows={2}
                    className="w-full border border-stone/40 px-4 py-3 text-sm bg-white resize-none"
                    placeholder="Any other details, special requests, or questions..."
                  />
                </div>
              </div>

              {cError && <p className="text-maroon text-sm mb-4">{cError}</p>}

              <button
                onClick={handleCateringSubmit}
                disabled={cLoading}
                className="btn-primary w-full text-center disabled:opacity-50"
              >
                {cLoading ? "Submitting..." : "Request a Quote"}
              </button>

              <p className="text-stone/50 text-xs text-center mt-4">
                Event pricing is customized based on guest count, menu selection, location, and service requirements.
              </p>
            </>
          )}

          {/* Catering submitted */}
          {step === "catering-done" && (
            <div className="text-center py-10">
              <div className="text-6xl mb-6">🎉</div>
              <h3
                className="text-2xl font-bold text-charcoal mb-3"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Inquiry Received!
              </h3>
              <p className="text-stone mb-2">
                Thank you, <strong>{cName}</strong>! We&apos;ve received your event inquiry.
              </p>
              <p className="text-stone text-sm mb-8">
                Our team will review your details and reach out to <strong>{cEmail}</strong> with a custom quotation.
              </p>
              <button onClick={reset} className="btn-primary">
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
