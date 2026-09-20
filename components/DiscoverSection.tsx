import Image from "next/image";

const usp = [
  {
    icon: "🔥",
    title: "Bold & Authentic Flavors",
    desc: "Every dish is crafted using fresh ingredients and traditional techniques that honor the roots of Asian street food culture.",
  },
  {
    icon: "🍜",
    title: "Street Food Elevated",
    desc: "We take classic street-side favorites and elevate them with quality cuts, house-made sauces, and generous portions.",
  },
  {
    icon: "❤️",
    title: "Made with Heart",
    desc: "From our kitchen to your table — every meal is prepared with care, consistency, and a whole lot of love.",
  },
];

export default function DiscoverSection() {
  return (
    <section id="about" className="py-24 bg-charcoal text-cream">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="label-tag text-maroon mb-3">Our Story</p>
          <h2 className="section-heading text-cream mb-5">
            Discover Umami Street
          </h2>
          <p className="section-subheading text-cream/60 mx-auto text-center">
            Umami Street was born from a love of bold, unapologetic flavors. We
            believe every meal should be an experience — hearty, satisfying, and
            worth every bite. Our menu draws inspiration from the vibrant street
            food scene, served in a welcoming space that feels like home.
          </p>
        </div>

        {/* USP Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {usp.map((item) => (
            <div
              key={item.title}
              className="border border-stone/20 p-8 hover:border-maroon transition-colors group"
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3
                className="text-xl font-bold text-cream mb-3"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                {item.title}
              </h3>
              <p className="text-cream/60 leading-relaxed text-sm">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Featured Image Row */}
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <div className="relative h-80 md:h-[480px] overflow-hidden">
            <Image
              src="/images/img_8829.webp"
              alt="Umami Street food"
              fill
              className="object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>
          <div className="space-y-6">
            <p className="label-tag text-maroon">What Makes Us Different</p>
            <h3
              className="text-3xl font-bold text-cream leading-tight"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              A Menu Built Around the Umami Experience
            </h3>
            <p className="text-cream/60 leading-relaxed">
              Umami — the fifth taste — is the deep, savory richness that makes
              food unforgettable. Every item on our menu is designed to hit that
              note. From our marinated grilled meats to our signature sauces, we
              chase that perfect depth of flavor in everything we make.
            </p>
            <p className="text-cream/60 leading-relaxed">
              Whether you&apos;re grabbing a quick solo meal or sharing plates with
              the whole crew, Umami Street has something for every craving and
              every occasion.
            </p>
            <button
              onClick={() => {
                document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
                window.history.pushState(null, "", "/menu");
              }}
              className="btn-primary inline-block"
            >
              See Our Menu
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
