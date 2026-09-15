"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase";
import {
  LayoutDashboard,
  Image as ImageIcon,
  UtensilsCrossed,
  Camera,
  FileText,
  ShoppingBag,
  CalendarDays,
  MessageSquare,
  LogOut,
  ExternalLink,
} from "lucide-react";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/images", label: "Site Images", icon: ImageIcon },
  { href: "/admin/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/admin/gallery", label: "Gallery", icon: Camera },
  { href: "/admin/blogs", label: "Blog Posts", icon: FileText },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/catering", label: "Catering & Events", icon: CalendarDays },
  { href: "/admin/chat", label: "Live Chat", icon: MessageSquare },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <aside className="w-64 bg-charcoal min-h-screen flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-6 border-b border-stone/20">
        <div className="flex items-center gap-3">
          <Image
            src="/images/umami-logo.png"
            alt="Umami Street"
            width={40}
            height={40}
            className="rounded-full object-contain"
          />
          <div>
            <p
              className="text-cream font-bold text-sm"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Umami Street
            </p>
            <p className="text-stone text-xs">Admin Console</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors rounded-sm ${
              isActive(href, exact)
                ? "bg-maroon text-cream"
                : "text-stone hover:text-cream hover:bg-stone/10"
            }`}
          >
            <Icon size={17} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-stone/20 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-4 py-3 text-sm text-stone hover:text-cream transition-colors"
        >
          <ExternalLink size={17} />
          View Site
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-sm text-stone hover:text-maroon transition-colors w-full"
        >
          <LogOut size={17} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
