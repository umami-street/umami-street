"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase";

type Category = { id: string; name: string; description: string | null };
type MenuItem = {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number | string;
  image_url: string | null;
  is_featured: boolean;
  is_available: boolean;
};

// Real Umami Street menu — shown while DB loads and as fallback
const FALLBACK: { categories: Category[]; items: MenuItem[] } = {
  categories: [
    { id: "bestsellers", name: "Best Sellers", description: "Our most-loved items — the ones that keep our regulars coming back." },
    { id: "wings", name: "Chicken Wings", description: "Choose from 6 amazing flavors: Honey Garlic, Buffalo, Yangnyeom, Garlic Parmesan, Snow Cheese, BBQ." },
    { id: "rice-meals", name: "Rice Meals & Combos", description: "Complete, satisfying plates with rice and your choice of protein." },
    { id: "takoyaki", name: "Takoyaki", description: "Japanese-style balls in 3 flavors. Available in 4, 8, or 12 pcs." },
    { id: "drinks", name: "Drinks", description: "Signature milk teas, fruit teas, and classic drinks to complete your meal." },
    { id: "sides", name: "Noodles, Fries & More", description: "Sides and snacks to round out your order." },
  ],
  items: [
    // Best Sellers
    { id: "bs1", category_id: "bestsellers", name: "6 Pcs Wings", description: "Choose up to 2 flavors: Honey Garlic, Buffalo, Yangnyeom, Garlic Parmesan, Snow Cheese, BBQ", price: 199, image_url: null, is_featured: true, is_available: true },
    { id: "bs2", category_id: "bestsellers", name: "Beef Bulgogi + Rice", description: "Marinated Korean-style beef bulgogi served with steamed rice", price: 149, image_url: null, is_featured: true, is_available: true },
    { id: "bs3", category_id: "bestsellers", name: "Kyoto Matcha Milk Tea", description: "16oz ₱85 · 22oz ₱95", price: 85, image_url: null, is_featured: true, is_available: true },
    // Chicken Wings
    { id: "w1", category_id: "wings", name: "6 Pcs Wings", description: "Choose up to 2 flavors", price: 199, image_url: null, is_featured: false, is_available: true },
    { id: "w2", category_id: "wings", name: "12 Pcs Wings", description: "Choose up to 4 flavors", price: 379, image_url: null, is_featured: false, is_available: true },
    { id: "w3", category_id: "wings", name: "24 Pcs Wings", description: "All 6 flavors available", price: 749, image_url: null, is_featured: false, is_available: true },
    // Rice Meals & Combos
    { id: "rm1", category_id: "rice-meals", name: "3 Wings + Rice", description: "3 pcs wings with your choice of flavor, served with steamed rice", price: 129, image_url: null, is_featured: false, is_available: true },
    { id: "rm2", category_id: "rice-meals", name: "Beef Bulgogi + Rice", description: "Marinated Korean-style beef bulgogi served with steamed rice", price: 149, image_url: null, is_featured: true, is_available: true },
    { id: "rm3", category_id: "rice-meals", name: "3 Wings + Rice + Drink", description: "Combo: 3 wings, steamed rice, and Coke or water", price: 149, image_url: null, is_featured: false, is_available: true },
    { id: "rm4", category_id: "rice-meals", name: "3 Wings + Rice + Fries + Drink", description: "Full combo: 3 wings, rice, fries, and Coke or water", price: 199, image_url: null, is_featured: false, is_available: true },
    // Takoyaki
    { id: "t1", category_id: "takoyaki", name: "Veggie Takoyaki", description: "4 pcs ₱79 · 8 pcs ₱129 · 12 pcs ₱179", price: 79, image_url: null, is_featured: false, is_available: true },
    { id: "t2", category_id: "takoyaki", name: "Cheese Bomb Takoyaki", description: "4 pcs ₱89 · 8 pcs ₱149 · 12 pcs ₱199", price: 89, image_url: null, is_featured: false, is_available: true },
    { id: "t3", category_id: "takoyaki", name: "Octobits Takoyaki", description: "4 pcs ₱89 · 8 pcs ₱149 · 12 pcs ₱199", price: 89, image_url: null, is_featured: true, is_available: true },
    // Drinks
    { id: "d1", category_id: "drinks", name: "Osaka Melon Cloud", description: "Signature milk tea · 16oz ₱75 · 22oz ₱85", price: 75, image_url: null, is_featured: false, is_available: true },
    { id: "d2", category_id: "drinks", name: "Kyoto Matcha", description: "Signature milk tea · 16oz ₱85 · 22oz ₱95", price: 85, image_url: null, is_featured: true, is_available: true },
    { id: "d3", category_id: "drinks", name: "Tokyo Sunset", description: "Signature milk tea · 16oz ₱75 · 22oz ₱85", price: 75, image_url: null, is_featured: false, is_available: true },
    { id: "d4", category_id: "drinks", name: "Nara Green Glow", description: "Signature milk tea · 16oz ₱75 · 22oz ₱85", price: 75, image_url: null, is_featured: false, is_available: true },
    { id: "d5", category_id: "drinks", name: "Fruit Tea", description: "Lychee, Honey Peach, Strawberry, Green Apple, Mango, Passion Fruit, Blueberry · 16oz ₱55 · 22oz ₱65", price: 55, image_url: null, is_featured: false, is_available: true },
    { id: "d6", category_id: "drinks", name: "Coke", description: "330ml can", price: 30, image_url: null, is_featured: false, is_available: true },
    { id: "d7", category_id: "drinks", name: "Bottled Water", description: "500ml", price: 25, image_url: null, is_featured: false, is_available: true },
    // Noodles, Fries & More
    { id: "s1", category_id: "sides", name: "HK Fried Noodles", description: "Plain ₱55 · +Chicken Siomai +₱15/pc · +Beef Siomai +₱18/pc", price: 55, image_url: null, is_featured: false, is_available: true },
    { id: "s2", category_id: "sides", name: "Regular Fries", description: "Crispy golden fries", price: 59, image_url: null, is_featured: false, is_available: true },
    { id: "s3", category_id: "sides", name: "Flavored Fries", description: "Cheese, BBQ, Sour Cream, or Chili BBQ", price: 79, image_url: null, is_featured: false, is_available: true },
    { id: "s4", category_id: "sides", name: "Extra Rice", description: "Add steamed rice to any order", price: 25, image_url: null, is_featured: false, is_available: true },
    { id: "s5", category_id: "sides", name: "Extra Pearl / Jelly", description: "Add-on for milk tea orders · Pearl ₱15 · Jelly ₱15", price: 15, image_url: null, is_featured: false, is_available: true },
  ],
};

function fmtPrice(price: number | string): string {
  const n = typeof price === "string" ? parseFloat(price) : price;
  return `₱${Number.isInteger(n) ? n : n.toFixed(2)}`;
}

function MenuPlaceholder({ name }: { name: string }) {
  return (
    <div className="w-full h-full bg-gradient-to-br from-maroon/20 to-charcoal/60 flex items-center justify-center">
      <span
        className="text-6xl font-black text-cream/10 select-none"
        style={{ fontFamily: "var(--font-playfair)" }}
      >
        {name.charAt(0)}
      </span>
    </div>
  );
}

export default function MenuSection() {
  const [categories, setCategories] = useState<Category[]>(FALLBACK.categories);
  const [items, setItems] = useState<MenuItem[]>(FALLBACK.items);
  const [active, setActive] = useState(FALLBACK.categories[0].id);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const [{ data: cats }, { data: menuItems }] = await Promise.all([
        supabase
          .from("menu_categories")
          .select("id,name,description")
          .eq("is_active", true)
          .order("display_order"),
        supabase
          .from("menu_items")
          .select("id,category_id,name,description,price,image_url,is_featured,is_available")
          .eq("is_available", true)
          .order("display_order"),
      ]);
      if (cats && cats.length > 0) {
        setCategories(cats);
        setActive(cats[0].id);
      }
      if (menuItems && menuItems.length > 0) {
        setItems(menuItems);
      }
    })();
  }, []);

  const category = categories.find((c) => c.id === active) ?? categories[0];
  const visibleItems = items.filter((i) => i.category_id === active);

  return (
    <section id="menu" className="py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="label-tag mb-3">Our Menu</p>
          <h2 className="section-heading text-charcoal mb-4">What&apos;s on the Menu?</h2>
          <p className="section-subheading text-stone mx-auto text-center">
            From crispy wings and rice meals to takoyaki, signature drinks, and more —
            there&apos;s something for every craving at Umami Street.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActive(cat.id)}
              className={`px-5 py-2.5 text-sm font-semibold uppercase tracking-wide transition-all border ${
                active === cat.id
                  ? "bg-maroon text-cream border-maroon"
                  : "border-stone/40 text-stone hover:border-maroon hover:text-maroon"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Category Description */}
        {category?.description && (
          <div className="text-center mb-10">
            <p className="text-stone italic">{category.description}</p>
          </div>
        )}

        {/* Items Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {visibleItems.map((item) => (
            <div
              key={item.id}
              className="bg-white group overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative h-52 overflow-hidden bg-charcoal/10">
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <MenuPlaceholder name={item.name} />
                )}
                {item.is_featured && (
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
                    {fmtPrice(item.price)}
                  </span>
                </div>
                {item.description && (
                  <p className="text-stone text-xs leading-relaxed">{item.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={() => document.getElementById("order")?.scrollIntoView({ behavior: "smooth" })}
            className="btn-primary"
          >
            Order Now
          </button>
        </div>
      </div>
    </section>
  );
}
