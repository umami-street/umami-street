"use client";
import { useState } from "react";
import Image from "next/image";

type MenuItem = {
  name: string;
  desc: string;
  price: string;
  image: string;
  featured?: boolean;
};

type Category = {
  id: string;
  label: string;
  description: string;
  cover: string;
  items: MenuItem[];
};

const MENU: Category[] = [
  {
    id: "bestsellers",
    label: "Best Sellers",
    description: "Our most-loved dishes — the ones that keep our regulars coming back.",
    cover: "/images/best-seller.webp",
    items: [
      { name: "Umami Signature Bowl", desc: "Rice, grilled chicken, egg, pickled veggies & house umami sauce", price: "₱159", image: "/images/img_8853.webp", featured: true },
      { name: "Street Grilled Liempo", desc: "Marinated pork belly grilled over charcoal, served with garlic rice", price: "₱179", image: "/images/img_8867.webp", featured: true },
      { name: "Crispy Chicken Cutlet", desc: "Breaded chicken thigh fillet, Japanese-style with katsu sauce", price: "₱149", image: "/images/img_8907.webp" },
      { name: "Gawa-Gawa Sisig", desc: "Sizzling chopped pork sisig with egg and calamansi", price: "₱155", image: "/images/img_8544.webp" },
    ],
  },
  {
    id: "grilled",
    label: "Grilled & Chicken",
    description: "Slow-marinated and grilled to perfection — bold smoke, tender meat.",
    cover: "/images/chick2-umas.webp",
    items: [
      { name: "Charcoal Grilled Chicken", desc: "Half chicken marinated in our signature blend, grilled low & slow", price: "₱189", image: "/images/img_8524.webp", featured: true },
      { name: "BBQ Pork Skewers (5 pcs)", desc: "Sweet and savory pork on bamboo sticks, street-style", price: "₱135", image: "/images/img_8525.webp" },
      { name: "Chicken Inasal", desc: "Visayan-style grilled chicken basted with annatto and lemongrass", price: "₱169", image: "/images/img_8766.webp" },
      { name: "Grilled Liempo Solo", desc: "Pork belly slab grilled with garlic & soy marinade", price: "₱145", image: "/images/img_8824.webp" },
    ],
  },
  {
    id: "rice-meals",
    label: "Rice Meals",
    description: "Complete, satisfying plates that hit every flavor note.",
    cover: "/images/rice-meal-ums.webp",
    items: [
      { name: "Garlic Fried Rice Combo", desc: "Garlic sinangag with your choice of ulam and fried egg", price: "₱129", image: "/images/img_8547.webp", featured: true },
      { name: "Adobo Rice Bowl", desc: "Classic chicken adobo on steamed rice with pickled cucumber", price: "₱139", image: "/images/img_8414.webp" },
      { name: "Sinigang na Hipon Set", desc: "Shrimp sinigang with vegetables, served with steamed rice", price: "₱185", image: "/images/img_8829.webp" },
      { name: "Kare-Kare Bowl", desc: "Oxtail kare-kare with bagoong, served with garlic rice", price: "₱199", image: "/images/img_8831.webp" },
    ],
  },
  {
    id: "drinks",
    label: "Drinks",
    description: "Refreshing beverages to pair with your meal — fresh and flavorful.",
    cover: "/images/drinks-oms.webp",
    items: [
      { name: "Calamansi Soda", desc: "Fresh calamansi juice topped with sparkling water and mint", price: "₱69", image: "/images/cw1.webp", featured: true },
      { name: "Mango Shake", desc: "Blended fresh Philippine mango, creamy and chilled", price: "₱79", image: "/images/cw1.webp" },
      { name: "Iced Salted Caramel Latte", desc: "Cold brewed coffee with house salted caramel syrup and oat milk", price: "₱89", image: "/images/cw1.webp" },
      { name: "Pandan Lemonade", desc: "House-made pandan syrup with fresh lemon and sparkling water", price: "₱75", image: "/images/cw1.webp" },
    ],
  },
  {
    id: "specials",
    label: "Specials",
    description: "Chef's rotating selection of seasonal and limited offerings.",
    cover: "/images/taks-oms.webp",
    items: [
      { name: "Umami Street Tacos (3 pcs)", desc: "Soft corn tortilla with braised beef, pickled onions, and salsa verde", price: "₱169", image: "/images/img_8853.webp", featured: true },
      { name: "Crispy Tokwa't Baboy", desc: "Fried tofu and pork ears in vinegar-soy dressing with chili", price: "₱125", image: "/images/img_8867.webp" },
      { name: "Kinilaw na Isda", desc: "Fresh fish cured in calamansi, coconut milk, ginger and chilies", price: "₱145", image: "/images/img_8907.webp" },
      { name: "Loaded Fries", desc: "Crispy fries topped with cheese sauce, bacon bits, and spring onions", price: "₱115", image: "/images/img_8544.webp" },
    ],
  },
];

export default function MenuSection() {
  const [active, setActive] = useState("bestsellers");
  const category = MENU.find((c) => c.id === active)!;

  return (
    <section id="menu" className="py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="label-tag mb-3">Our Menu</p>
          <h2 className="section-heading text-charcoal mb-4">What&apos;s on the Menu?</h2>
          <p className="section-subheading text-stone mx-auto text-center">
            From grilled street favorites to hearty rice meals and refreshing
            drinks — there&apos;s something for every craving at Umami Street.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {MENU.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActive(cat.id)}
              className={`px-5 py-2.5 text-sm font-semibold uppercase tracking-wide transition-all border ${
                active === cat.id
                  ? "bg-maroon text-cream border-maroon"
                  : "border-stone/40 text-stone hover:border-maroon hover:text-maroon"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Category Description */}
        <div className="text-center mb-10">
          <p className="text-stone italic">{category.description}</p>
        </div>

        {/* Items Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {category.items.map((item) => (
            <div
              key={item.name}
              className="bg-white group overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative h-52 overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {item.featured && (
                  <span className="absolute top-3 left-3 bg-maroon text-cream text-xs font-bold px-2 py-1 uppercase tracking-wide">
                    Bestseller
                  </span>
                )}
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h4
                    className="font-bold text-charcoal text-base leading-tight"
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    {item.name}
                  </h4>
                  <span className="text-maroon font-bold text-sm shrink-0">
                    {item.price}
                  </span>
                </div>
                <p className="text-stone text-xs leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <a href="#order" className="btn-primary">
            Order Now
          </a>
        </div>
      </div>
    </section>
  );
}
