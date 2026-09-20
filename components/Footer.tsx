import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-charcoal border-t border-stone/20">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/images/umami-logo.webp"
                alt="Umami Street"
                width={44}
                height={44}
                className="rounded-full object-contain"
              />
              <span
                className="text-cream text-xl font-bold"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Umami Street
              </span>
            </div>
            <p className="text-cream/50 text-sm leading-relaxed max-w-xs">
              Asian street food, comfort meals, snacks, and drinks made for everyday
              cravings and shared moments. Naic, Cavite.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <p className="text-cream text-xs font-bold uppercase tracking-widest mb-5">
              Quick Links
            </p>
            <ul className="space-y-3">
              {[
                ["Home", "hero"],
                ["About", "about"],
                ["Menu", "menu"],
                ["Gallery", "gallery"],
                ["Blog", "blog"],
                ["Contact", "contact"],
              ].map(([label, section]) => (
                <li key={label}>
                  <button
                    onClick={() => document.getElementById(section)?.scrollIntoView({ behavior: "smooth" })}
                    className="text-cream/50 hover:text-cream text-sm transition-colors"
                  >
                    {label}
                  </button>
                </li>
              ))}
              <li>
                <Link href="/track-order" className="text-cream/50 hover:text-cream text-sm transition-colors">
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-cream text-xs font-bold uppercase tracking-widest mb-5">
              Contact
            </p>
            <ul className="space-y-3 text-cream/50 text-sm">
              <li>Naic, Cavite, Philippines</li>
              <li>
                <a href="tel:+639910079097" className="hover:text-cream transition-colors">
                  0991 007 9097
                </a>
              </li>
              <li>
                <a href="mailto:hello.umamistreet@gmail.com" className="hover:text-cream transition-colors">
                  hello.umamistreet@gmail.com
                </a>
              </li>
            </ul>
            <div className="flex gap-3 mt-6">
              <a
                href="https://facebook.com/umamistreet"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cream/40 hover:text-cream text-xs uppercase tracking-wide transition-colors"
              >
                Facebook
              </a>
              <span className="text-cream/20">|</span>
              <a
                href="https://instagram.com/umamistreet.ph"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cream/40 hover:text-cream text-xs uppercase tracking-wide transition-colors"
              >
                Instagram
              </a>
              <span className="text-cream/20">|</span>
              <a
                href="https://tiktok.com/@umamistreet"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cream/40 hover:text-cream text-xs uppercase tracking-wide transition-colors"
              >
                TikTok
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-stone/20 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-cream/30 text-xs">
              © {new Date().getFullYear()} Umami Street. All rights reserved.
            </p>
            <p className="text-cream/20 text-xs mt-1">
              A brand of Ameerah &amp; Aariz Food Services
            </p>
          </div>
          <Link
            href="/login"
            className="text-cream/20 hover:text-cream/50 text-xs transition-colors"
          >
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
