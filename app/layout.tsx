import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import ChatWidget from "@/components/ChatWidget";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Umami Street — Where Flavors Meet",
  description:
    "Discover bold flavors and unforgettable meals at Umami Street. Explore our menu, view our gallery, and order online.",
  keywords: "Umami Street, restaurant, Filipino food, Asian street food, Naic Cavite",
  openGraph: {
    title: "Umami Street — Where Flavors Meet",
    description: "Bold flavors. Unforgettable meals.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="antialiased" suppressHydrationWarning>
        <div id="root" suppressHydrationWarning>
          {children}
          <ChatWidget />
        </div>
      </body>
    </html>
  );
}
