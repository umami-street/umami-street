"use client";
import { useState, useEffect } from "react";
import { CalendarDays, ChevronDown } from "lucide-react";

type Inquiry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  event_type: string;
  event_date: string;
  location: string;
  guest_count: string;
  menu_notes: string;
  message: string;
  status: string;
  created_at: string;
};

const STATUSES = ["new", "contacted", "quoted", "confirmed", "completed", "declined"];

const statusColor: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-yellow-100 text-yellow-700",
  quoted: "bg-purple-100 text-purple-700",
  confirmed: "bg-green-100 text-green-700",
  completed: "bg-stone/20 text-stone",
  declined: "bg-red-100 text-red-600",
};

export default function CateringPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/catering-inquiries");
      const data = await res.json();
      setInquiries(data);
    } catch {
      setInquiries([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await fetch("/api/catering-inquiries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
  };

  const filtered = filter === "all" ? inquiries : inquiries.filter((i) => i.status === filter);

  if (loading) return <div className="p-8 text-stone">Loading inquiries...</div>;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-charcoal" style={{ fontFamily: "var(--font-playfair)" }}>
          Catering & Events
        </h1>
        <p className="text-stone mt-1">Manage business inquiries and event requests.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wide border transition-colors ${
            filter === "all" ? "bg-charcoal text-cream border-charcoal" : "border-stone/30 text-stone hover:border-charcoal hover:text-charcoal"
          }`}
        >
          All ({inquiries.length})
        </button>
        {STATUSES.map((s) => {
          const count = inquiries.filter((i) => i.status === s).length;
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
          <CalendarDays size={40} className="mx-auto mb-3 opacity-30" />
          <p>No catering inquiries {filter !== "all" ? `with status "${filter}"` : "yet"}.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((inquiry) => (
            <div key={inquiry.id} className="bg-white shadow-sm">
              <div
                className="flex flex-wrap items-center gap-4 p-5 cursor-pointer hover:bg-cream/30 transition-colors"
                onClick={() => setExpanded(expanded === inquiry.id ? null : inquiry.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 font-semibold rounded-full ${statusColor[inquiry.status]}`}>
                      {inquiry.status}
                    </span>
                    <span className="text-stone text-xs font-mono">#{inquiry.id.slice(0, 8)}</span>
                  </div>
                  <p className="font-bold text-charcoal">{inquiry.name}</p>
                  <p className="text-stone text-xs">{inquiry.email}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-charcoal text-sm">{inquiry.event_type || "Event Inquiry"}</p>
                  <p className="text-stone text-xs">
                    {inquiry.event_date
                      ? new Date(inquiry.event_date).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })
                      : "Date TBD"}
                  </p>
                  <p className="text-stone text-xs mt-0.5">
                    {new Date(inquiry.created_at).toLocaleDateString("en-PH", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <ChevronDown
                  size={18}
                  className={`text-stone shrink-0 transition-transform ${expanded === inquiry.id ? "rotate-180" : ""}`}
                />
              </div>

              {expanded === inquiry.id && (
                <div className="border-t border-stone/10 p-5 bg-cream/30">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Inquiry Details */}
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-stone mb-3">Event Details</p>
                        <div className="space-y-2 text-sm">
                          {inquiry.event_type && (
                            <div className="flex gap-2">
                              <span className="text-stone min-w-[120px]">Type:</span>
                              <span className="text-charcoal font-medium">{inquiry.event_type}</span>
                            </div>
                          )}
                          {inquiry.event_date && (
                            <div className="flex gap-2">
                              <span className="text-stone min-w-[120px]">Date:</span>
                              <span className="text-charcoal font-medium">{inquiry.event_date}</span>
                            </div>
                          )}
                          {inquiry.location && (
                            <div className="flex gap-2">
                              <span className="text-stone min-w-[120px]">Location:</span>
                              <span className="text-charcoal font-medium">{inquiry.location}</span>
                            </div>
                          )}
                          {inquiry.guest_count && (
                            <div className="flex gap-2">
                              <span className="text-stone min-w-[120px]">Guests:</span>
                              <span className="text-charcoal font-medium">{inquiry.guest_count}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {inquiry.menu_notes && (
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-stone mb-2">Menu Preferences</p>
                          <div className="bg-white p-3 text-sm text-stone">{inquiry.menu_notes}</div>
                        </div>
                      )}

                      {inquiry.message && (
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-stone mb-2">Additional Message</p>
                          <div className="bg-white p-3 text-sm text-stone">{inquiry.message}</div>
                        </div>
                      )}
                    </div>

                    {/* Contact & Status */}
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-stone mb-2">Contact</p>
                        <p className="text-sm text-charcoal font-medium">{inquiry.name}</p>
                        <a href={`mailto:${inquiry.email}`} className="text-sm text-maroon hover:underline block">{inquiry.email}</a>
                        {inquiry.phone && <p className="text-sm text-stone">{inquiry.phone}</p>}
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-stone mb-2">Update Status</p>
                        <div className="flex flex-wrap gap-2">
                          {STATUSES.map((s) => (
                            <button
                              key={s}
                              onClick={() => updateStatus(inquiry.id, s)}
                              className={`px-3 py-1.5 text-xs font-semibold border capitalize transition-colors ${
                                inquiry.status === s
                                  ? "bg-charcoal text-cream border-charcoal"
                                  : "border-stone/30 text-stone hover:border-maroon hover:text-maroon"
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <a
                          href={`mailto:${inquiry.email}?subject=Umami Street — Catering Quotation&body=Hi ${inquiry.name},%0A%0AThank you for your interest in Umami Street for your event!%0A%0AHere is our quotation based on your requirements:%0A%0A...%0A%0ABest regards,%0APrincess Suzainne Dignos%0ADirector — Umami Street`}
                          className="btn-primary text-sm inline-block"
                        >
                          Reply via Email
                        </a>
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
