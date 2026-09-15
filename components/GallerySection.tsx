"use client";
import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const GALLERY = [
  "/images/IMG_8414.JPG",
  "/images/IMG_8524.JPG",
  "/images/IMG_8525.JPG",
  "/images/IMG_8544.JPG",
  "/images/IMG_8547.JPG",
  "/images/IMG_8766.JPG",
  "/images/IMG_8824.JPG",
  "/images/IMG_8829.JPG",
  "/images/IMG_8831.JPG",
  "/images/IMG_8853.JPG",
  "/images/IMG_8867.JPG",
  "/images/IMG_8907.JPG",
];

export default function GallerySection() {
  const [lightbox, setLightbox] = useState<number | null>(null);

  const prev = () =>
    setLightbox((i) => (i === null ? null : (i - 1 + GALLERY.length) % GALLERY.length));
  const next = () =>
    setLightbox((i) => (i === null ? null : (i + 1) % GALLERY.length));

  return (
    <section id="gallery" className="py-24 bg-charcoal">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="label-tag text-maroon mb-3">Photo Gallery</p>
          <h2 className="section-heading text-cream mb-4">A Feast for the Eyes</h2>
          <p className="section-subheading text-cream/60 mx-auto text-center">
            Every plate at Umami Street is crafted to look as good as it tastes.
            Take a peek inside our world of bold colors and beautiful food.
          </p>
        </div>

        {/* Grid */}
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
          {GALLERY.map((src, i) => (
            <div
              key={src}
              className="relative overflow-hidden cursor-pointer group break-inside-avoid"
              onClick={() => setLightbox(i)}
            >
              <Image
                src={src}
                alt={`Gallery ${i + 1}`}
                width={400}
                height={300}
                className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/30 transition-colors" />
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 bg-charcoal/95 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-6 right-6 text-cream hover:text-maroon"
            onClick={() => setLightbox(null)}
          >
            <X size={32} />
          </button>
          <button
            className="absolute left-4 text-cream hover:text-maroon p-2"
            onClick={(e) => { e.stopPropagation(); prev(); }}
          >
            <ChevronLeft size={40} />
          </button>
          <div
            className="relative w-full max-w-3xl max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={GALLERY[lightbox]}
              alt="Gallery"
              width={900}
              height={700}
              className="object-contain w-full h-full max-h-[80vh]"
            />
          </div>
          <button
            className="absolute right-4 text-cream hover:text-maroon p-2"
            onClick={(e) => { e.stopPropagation(); next(); }}
          >
            <ChevronRight size={40} />
          </button>
          <p className="absolute bottom-6 text-cream/50 text-sm">
            {lightbox + 1} / {GALLERY.length}
          </p>
        </div>
      )}
    </section>
  );
}
