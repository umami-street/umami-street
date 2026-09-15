"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Home", href: "#hero" },
  { label: "About", href: "#discover" },
  { label: "Menu", href: "#menu" },
  { label: "Gallery", href: "#gallery" },
  { label: "Blog", href: "#blog" },
  { label: "Contact", href: "#location" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-charcoal shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">
        {/* Logo */}
        <Link href="#hero" className="flex items-center gap-3">
          <Image
            src="/images/umami-logo.webp"
            alt="Umami Street Logo"
            width={48}
            height={48}
            className="object-contain rounded-full"
          />
          <span
            className="text-cream font-bold text-xl hidden sm:block"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Umami Street
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-cream/80 hover:text-cream text-sm font-medium tracking-wide uppercase transition-colors"
            >
              {link.label}
            </a>
          ))}
          <a href="#order" className="btn-primary text-sm !py-2 !px-5">
            Order Now
          </a>
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-cream p-2"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-charcoal border-t border-stone/20 px-6 py-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-cream/80 hover:text-cream text-sm font-medium tracking-wide uppercase transition-colors py-2"
            >
              {link.label}
            </a>
          ))}
          <a href="#order" onClick={() => setOpen(false)} className="btn-primary text-center text-sm">
            Order Now
          </a>
        </div>
      )}
    </header>
  );
}
