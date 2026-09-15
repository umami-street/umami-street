"use client";
import { useState } from "react";
import OrderModal from "./OrderModal";
import Image from "next/image";

export default function CTASection() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <section id="order" className="relative py-28 overflow-hidden bg-charcoal">
        <div className="absolute inset-0">
          <Image
            src="/images/IMG_8829.JPG"
            alt="Order background"
            fill
            className="object-cover opacity-20"
          />
        </div>
        <div className="absolute inset-0 bg-charcoal/80" />

        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <p className="label-tag text-maroon mb-4">Order Online</p>
          <h2
            className="text-cream mb-6"
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              lineHeight: 1.1,
            }}
          >
            Craving Something Bold?
          </h2>
          <p className="text-cream/70 text-lg mb-10 leading-relaxed max-w-xl mx-auto">
            Regular delivery? Events and catering? We&apos;ve got you covered.
            Tell us what you need and we&apos;ll make it happen.
          </p>
          <button
            onClick={() => setOpen(true)}
            className="btn-primary text-base px-10 py-4"
          >
            Order Now
          </button>
          <p className="text-cream/40 text-xs mt-6">
            Delivery fee may apply depending on your location.
          </p>
        </div>
      </section>

      <OrderModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
