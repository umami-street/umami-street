const PARTNERS = [
  { name: "FoodPanda", abbr: "FP" },
  { name: "Grab Food", abbr: "GF" },
  { name: "SM Malls", abbr: "SM" },
  { name: "Lazada Fresh", abbr: "LF" },
  { name: "BPI Family", abbr: "BPI" },
  { name: "GCash", abbr: "GC" },
];

export default function PartnersSection() {
  return (
    <section className="py-16 bg-cream border-t border-stone/20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-10">
          <p className="label-tag mb-2">Our Partners</p>
          <h2 className="section-heading text-charcoal text-2xl mb-3">Trusted by the Best</h2>
          <p className="section-subheading text-stone mx-auto text-center text-sm">
            We are proud to collaborate with brands that share our commitment to
            quality and community.
          </p>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-6">
          {PARTNERS.map((p) => (
            <div
              key={p.name}
              className="flex items-center justify-center w-36 h-20 border border-stone/30 bg-white hover:border-maroon transition-colors group"
              title={p.name}
            >
              <div className="text-center">
                <p
                  className="font-bold text-xl text-stone/40 group-hover:text-maroon transition-colors"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  {p.abbr}
                </p>
                <p className="text-xs text-stone/50 mt-0.5">{p.name}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-stone/50 text-xs mt-8 italic">
          Partner logo placements — update via the admin console
        </p>
      </div>
    </section>
  );
}
