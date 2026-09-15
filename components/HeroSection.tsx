"use client";
import Image from "next/image";
import { useState, useEffect } from "react";

const slides = [
  {
    src: "/images/IMG_8414.JPG",
    headline: "Where Flavors Meet",
    sub: "Bold Asian street food crafted with passion and served with heart.",
  },
  {
    src: "/images/IMG_8524.JPG",
    headline: "Taste the Street",
    sub: "From crispy grills to hearty rice meals — every bite tells a story.",
  },
  {
    src: "/images/IMG_8831.JPG",
    headline: "Fresh. Bold. Umami.",
    sub: "Discover our rotating menu of street-inspired creations.",
  },
];

export default function HeroSection() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="hero" className="relative h-screen min-h-[600px] overflow-hidden">
      {/* Slides */}
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={slide.src}
            alt={slide.headline}
            fill
            className="object-cover"
            priority={i === 0}
          />
        </div>
      ))}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal/75 via-charcoal/65 to-charcoal/85 z-10" />

      {/* Content */}
      <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-6">
        <p className="label-tag text-cream/80 mb-4">Asian Street Food • Naic, Cavite</p>
        <h1
          className="section-heading text-cream mb-6 max-w-3xl"
          style={{ textShadow: "0 2px 16px rgba(25,22,18,0.7), 0 1px 4px rgba(25,22,18,0.9)" }}
        >
          {slides[current].headline}
        </h1>
        <p
          className="text-cream text-lg max-w-xl mb-10 leading-relaxed"
          style={{ textShadow: "0 1px 8px rgba(25,22,18,0.8)" }}
        >
          {slides[current].sub}
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a href="#menu" className="btn-primary">
            Explore the Menu
          </a>
          <a href="#order" className="btn-outline border-cream text-cream hover:bg-cream hover:text-charcoal">
            Order Now
          </a>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-8 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === current ? "bg-maroon w-6" : "bg-cream/40"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
