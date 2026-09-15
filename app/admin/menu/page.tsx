"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase";
import { Plus, Trash2, Edit2, Upload, X, Check } from "lucide-react";

type Category = { id: string; name: string; description: string; image_url: string; display_order: number };
type MenuItem = { id: string; category_id: string; name: string; description: string; price: number; image_url: string; is_available: boolean; is_featured: boolean };

export default function MenuPage() {
  const supabase = createClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
  const [showItemForm, setShowItemForm] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [cats, menuItems] = await Promise.all([
      supabase.from("menu_categories").select("*").order("display_order"),
      supabase.from("menu_items").select("*").order("display_order"),
    ]);
    const catData = cats.data ?? [];
    setCategories(catData);
    setItems(menuItems.data ?? []);
    if (catData.length && !activeCategory) setActiveCategory(catData[0].id);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const filteredItems = items.filter((i) => i.category_id === activeCategory);

  const handleImageUpload = async (file: File, folder: string) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${folder}/${Date.now()}.${ext}`;
    await supabase.storage.from("menu-images").upload(path, file, { upsert: true });
    const { data: { publicUrl } } = supabase.storage.from("menu-images").getPublicUrl(path);
    setUploading(false);
    return publicUrl;
  };

  const saveItem = async () => {
    if (!editingItem?.name || !activeCategory) return;
    const data = { ...editingItem, category_id: activeCategory };
    if (editingItem.id) {
      await supabase.from("menu_items").update(data).eq("id", editingItem.id);
    } else {
      await supabase.from("menu_items").insert({ ...data, display_order: filteredItems.length });
    }
    setShowItemForm(false);
    setEditingItem(null);
    await loadData();
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Delete this menu item?")) return;
    await supabase.from("menu_items").delete().eq("id", id);
    await loadData();
  };

  if (loading) return <div className="p-8 text-stone">Loading menu data...</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-charcoal" style={{ fontFamily: "var(--font-playfair)" }}>
            Menu Management
          </h1>
          <p className="text-stone mt-1">Add, edit, or remove menu items and categories.</p>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="bg-white p-12 text-center text-stone shadow-sm">
          <p className="mb-4">No menu categories yet. Create your Supabase tables first using the schema provided.</p>
          <p className="text-xs text-stone/60">Run <code>supabase-schema.sql</code> in your Supabase SQL editor.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Categories sidebar */}
          <div className="bg-white shadow-sm p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-stone mb-4">Categories</p>
            <div className="space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full text-left px-3 py-2.5 text-sm font-medium transition-colors ${
                    activeCategory === cat.id ? "bg-maroon text-cream" : "text-charcoal hover:bg-cream/50"
                  }`}
                >
                  {cat.name}
                  <span className="ml-1 text-xs opacity-60">
                    ({items.filter((i) => i.category_id === cat.id).length})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Items */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-charcoal">
                {categories.find((c) => c.id === activeCategory)?.name}
              </p>
              <button
                onClick={() => { setEditingItem({ is_available: true, is_featured: false }); setShowItemForm(true); }}
                className="btn-primary text-xs !py-2 !px-4 flex items-center gap-2"
              >
                <Plus size={14} /> Add Item
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {filteredItems.map((item) => (
                <div key={item.id} className="bg-white shadow-sm overflow-hidden">
                  <div className="relative h-40">
                    {item.image_url ? (
                      <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-cream flex items-center justify-center text-stone/30 text-3xl">🍜</div>
                    )}
                    {item.is_featured && (
                      <span className="absolute top-2 left-2 bg-maroon text-cream text-xs px-2 py-0.5">Bestseller</span>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-bold text-charcoal text-sm">{item.name}</p>
                      <p className="text-maroon font-bold text-sm">₱{item.price}</p>
                    </div>
                    <p className="text-stone text-xs leading-relaxed mb-4">{item.description}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditingItem(item); setShowItemForm(true); }}
                        className="flex items-center gap-1.5 text-xs border border-stone/30 px-3 py-1.5 hover:border-maroon hover:text-maroon transition-colors"
                      >
                        <Edit2 size={12} /> Edit
                      </button>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="flex items-center gap-1.5 text-xs border border-stone/30 px-3 py-1.5 hover:border-maroon hover:text-maroon transition-colors"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Item Form Modal */}
      {showItemForm && editingItem && (
        <div className="fixed inset-0 bg-charcoal/70 z-50 flex items-center justify-center p-4">
          <div className="bg-cream w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="bg-charcoal text-cream px-6 py-4 flex items-center justify-between">
              <p className="font-bold">{editingItem.id ? "Edit Item" : "New Menu Item"}</p>
              <button onClick={() => { setShowItemForm(false); setEditingItem(null); }}>
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-1">Name *</label>
                <input
                  type="text"
                  value={editingItem.name ?? ""}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full border border-stone/40 bg-white px-4 py-2.5 text-sm"
                  placeholder="Umami Signature Bowl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-1">Description</label>
                <textarea
                  value={editingItem.description ?? ""}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  rows={3}
                  className="w-full border border-stone/40 bg-white px-4 py-2.5 text-sm resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-1">Price (₱) *</label>
                <input
                  type="number"
                  value={editingItem.price ?? ""}
                  onChange={(e) => setEditingItem({ ...editingItem, price: Number(e.target.value) })}
                  className="w-full border border-stone/40 bg-white px-4 py-2.5 text-sm"
                  placeholder="159"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-1">Image</label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const url = await handleImageUpload(f, "items");
                    setEditingItem({ ...editingItem, image_url: url });
                  }}
                  className="hidden"
                />
                <div className="flex items-center gap-3">
                  {editingItem.image_url && (
                    <div className="relative w-16 h-16">
                      <Image src={editingItem.image_url} alt="" fill className="object-cover" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="btn-outline text-xs !py-2 !px-4 flex items-center gap-2"
                  >
                    <Upload size={13} />
                    {uploading ? "Uploading..." : "Upload Image"}
                  </button>
                </div>
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.is_featured ?? false}
                    onChange={(e) => setEditingItem({ ...editingItem, is_featured: e.target.checked })}
                    className="w-4 h-4 accent-maroon"
                  />
                  Mark as Bestseller
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.is_available ?? true}
                    onChange={(e) => setEditingItem({ ...editingItem, is_available: e.target.checked })}
                    className="w-4 h-4 accent-maroon"
                  />
                  Available
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setShowItemForm(false); setEditingItem(null); }} className="btn-outline flex-1 text-center text-sm">
                  Cancel
                </button>
                <button onClick={saveItem} className="btn-primary flex-1 text-center flex items-center justify-center gap-2 text-sm">
                  <Check size={15} />
                  Save Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
