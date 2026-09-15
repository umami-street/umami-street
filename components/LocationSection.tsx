import { MapPin, Clock, Phone, Mail } from "lucide-react";

const BRANCHES = [
  {
    name: "Umami Street – Molino",
    address: "Molino, Naic, Cavite",
    hours: "12:00 PM – 12:00 AM",
    mapsUrl: "https://maps.app.goo.gl/umamistreet-molino",
  },
  {
    name: "Umami Street – Sapa",
    address: "#116 Brgy. Sapa, Naic, Cavite",
    hours: "12:00 PM – 12:00 AM",
    mapsUrl: "https://maps.app.goo.gl/umamistreet-sapa",
  },
];

export default function LocationSection() {
  return (
    <section id="location" className="py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="label-tag mb-3">Find Us</p>
          <h2 className="section-heading text-charcoal mb-4">Find an Umami Street Near You</h2>
          <p className="section-subheading text-stone mx-auto text-center">
            Visit us at either of our Naic, Cavite locations. Open daily for dine-in,
            takeout, and advance orders.
          </p>
        </div>

        {/* Map */}
        <div className="overflow-hidden shadow-lg mb-14">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d7733.105769179523!2d120.7722384!3d14.2792778!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33bd8700316ee209%3A0x367eae58692eaefc!2sUmami%20Street!5e0!3m2!1sen!2sph!4v1788959572448!5m2!1sen!2sph"
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            title="Umami Street Location"
          />
        </div>

        {/* Two branches */}
        <div className="grid md:grid-cols-2 gap-8 mb-14">
          {BRANCHES.map((branch) => (
            <div key={branch.name} className="bg-white border border-stone/20 p-8">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-10 h-10 bg-maroon flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin size={18} className="text-cream" />
                </div>
                <div>
                  <h3
                    className="text-xl font-bold text-charcoal mb-1"
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    {branch.name}
                  </h3>
                  <p className="text-stone text-sm">{branch.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-6 text-stone text-sm">
                <Clock size={15} className="text-maroon shrink-0" />
                <span>Open daily • {branch.hours}</span>
              </div>
              <p className="text-stone/60 text-xs mb-5">
                Dine-in • Takeout • Advance Orders
              </p>
              <a
                href={branch.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-sm"
              >
                Get Directions
              </a>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div>
          <h3
              className="text-2xl font-bold text-charcoal mb-6"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Get in Touch
            </h3>
            <div className="space-y-5">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-maroon flex items-center justify-center shrink-0">
                  <Phone size={18} className="text-cream" />
                </div>
                <div>
                  <p className="font-semibold text-charcoal">Store Number</p>
                  <a
                    href="tel:+639910079097"
                    className="text-stone text-sm mt-1 hover:text-maroon transition-colors"
                  >
                    0991 007 9097
                  </a>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-maroon flex items-center justify-center shrink-0">
                  <Mail size={18} className="text-cream" />
                </div>
                <div>
                  <p className="font-semibold text-charcoal">Email</p>
                  <a
                    href="mailto:hello.umamistreet@gmail.com"
                    className="text-stone text-sm mt-1 hover:text-maroon transition-colors"
                  >
                    hello.umamistreet@gmail.com
                  </a>
                </div>
              </div>
            </div>

            <div className="border-t border-stone/20 pt-8 mt-8">
              <p className="font-semibold text-charcoal mb-3">Follow Us</p>
              <div className="flex gap-3 mt-4">
                <a
                  href="https://facebook.com/umamistreet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 border border-stone/30 text-stone text-sm hover:border-maroon hover:text-maroon transition-colors"
                >
                  Facebook
                </a>
                <a
                  href="https://instagram.com/umamistreet.ph"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 border border-stone/30 text-stone text-sm hover:border-maroon hover:text-maroon transition-colors"
                >
                  Instagram
                </a>
                <a
                  href="https://tiktok.com/@umamistreet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 border border-stone/30 text-stone text-sm hover:border-maroon hover:text-maroon transition-colors"
                >
                  TikTok
                </a>
              </div>
            </div>
        </div>
      </div>
    </section>
  );
}
