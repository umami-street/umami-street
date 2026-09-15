import { createClient } from "@/lib/supabase-server";
import { ShoppingBag, FileText, Camera, UtensilsCrossed } from "lucide-react";
import Link from "next/link";

export const runtime = "edge";

async function getStats() {
  try {
    const supabase = await createClient();
    const [orders, posts, gallery, menu] = await Promise.all([
      supabase.from("orders").select("id, status, created_at").order("created_at", { ascending: false }).limit(10),
      supabase.from("blog_posts").select("id").eq("is_published", true),
      supabase.from("gallery_images").select("id"),
      supabase.from("menu_items").select("id"),
    ]);
    return {
      orders: orders.data ?? [],
      postsCount: posts.data?.length ?? 0,
      galleryCount: gallery.data?.length ?? 0,
      menuCount: menu.data?.length ?? 0,
    };
  } catch {
    return { orders: [], postsCount: 0, galleryCount: 0, menuCount: 0 };
  }
}

const statusColor: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  confirmed: "bg-yellow-100 text-yellow-700",
  preparing: "bg-orange-100 text-orange-700",
  ready: "bg-green-100 text-green-700",
  completed: "bg-stone/20 text-stone",
  cancelled: "bg-red-100 text-red-600",
};

export default async function AdminDashboard() {
  const { orders, postsCount, galleryCount, menuCount } = await getStats();
  const newOrders = orders.filter((o: { status: string }) => o.status === "new").length;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1
          className="text-3xl font-bold text-charcoal"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Dashboard
        </h1>
        <p className="text-stone mt-1">Welcome back. Here&apos;s what&apos;s happening at Umami Street.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {[
          { label: "New Orders", value: newOrders, icon: ShoppingBag, color: "bg-maroon", href: "/admin/orders" },
          { label: "Blog Posts", value: postsCount, icon: FileText, color: "bg-tan", href: "/admin/blogs" },
          { label: "Gallery Images", value: galleryCount, icon: Camera, color: "bg-stone", href: "/admin/gallery" },
          { label: "Menu Items", value: menuCount, icon: UtensilsCrossed, color: "bg-charcoal", href: "/admin/menu" },
        ].map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} href={href}>
            <div className="bg-white p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className={`w-10 h-10 ${color} flex items-center justify-center mb-4`}>
                <Icon size={18} className="text-cream" />
              </div>
              <p className="text-3xl font-bold text-charcoal">{value}</p>
              <p className="text-stone text-sm mt-1">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white shadow-sm">
        <div className="flex items-center justify-between p-6 border-b border-stone/10">
          <h2
            className="text-lg font-bold text-charcoal"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Recent Orders
          </h2>
          <Link href="/admin/orders" className="text-maroon text-sm font-medium hover:underline">
            View all →
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="p-12 text-center text-stone">
            <ShoppingBag size={40} className="mx-auto mb-3 opacity-30" />
            <p>No orders yet. Orders will appear here once customers place them.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cream/50">
                  <th className="text-left px-6 py-3 text-xs uppercase tracking-wide text-stone font-semibold">Customer</th>
                  <th className="text-left px-6 py-3 text-xs uppercase tracking-wide text-stone font-semibold">Status</th>
                  <th className="text-left px-6 py-3 text-xs uppercase tracking-wide text-stone font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order: { id: string; customer_name?: string; status: string; created_at: string }) => (
                  <tr key={order.id} className="border-t border-stone/10 hover:bg-cream/30">
                    <td className="px-6 py-4 font-medium text-charcoal">{order.customer_name || "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColor[order.status] || "bg-stone/20"}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-stone">
                      {new Date(order.created_at).toLocaleDateString("en-PH", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Manage Menu", href: "/admin/menu" },
          { label: "Upload Gallery Photos", href: "/admin/gallery" },
          { label: "Write a Blog Post", href: "/admin/blogs" },
          { label: "Replace Site Images", href: "/admin/images" },
          { label: "View Orders", href: "/admin/orders" },
          { label: "View Website", href: "/" },
        ].map(({ label, href }) => (
          <Link
            key={label}
            href={href}
            className="border border-stone/30 bg-white px-5 py-4 text-sm font-medium text-charcoal hover:border-maroon hover:text-maroon transition-colors text-center"
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
