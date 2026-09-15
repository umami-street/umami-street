"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase";
import { Upload, Trash2, Plus } from "lucide-react";

type GalleryImage = { id: string; image_url: string; caption: string; display_order: number };

export default function GalleryPage() {
  const supabase = createClient();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("gallery_images").select("*").order("display_order");
    setImages(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    for (const file of files) {
      const ext = file.name.split(".").pop();
      const path = `gallery/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      await supabase.storage.from("gallery-images").upload(path, file, { upsert: true });
      const { data: { publicUrl } } = supabase.storage.from("gallery-images").getPublicUrl(path);
      await supabase.from("gallery_images").insert({
        image_url: publicUrl,
        caption: "",
        display_order: images.length,
      });
    }
    setUploading(false);
    await load();
  };

  const deleteImage = async (id: string, image_url: string) => {
    if (!confirm("Delete this image?")) return;
    await supabase.from("gallery_images").delete().eq("id", id);
    // Try to remove from storage
    const path = image_url.split("/gallery-images/")[1];
    if (path) await supabase.storage.from("gallery-images").remove([path]);
    await load();
  };

  const updateCaption = async (id: string, caption: string) => {
    await supabase.from("gallery_images").update({ caption }).eq("id", id);
  };

  if (loading) return <div className="p-8 text-stone">Loading gallery...</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-charcoal" style={{ fontFamily: "var(--font-playfair)" }}>
            Gallery
          </h1>
          <p className="text-stone mt-1">Upload and manage restaurant photos.</p>
        </div>
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            className="hidden"
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            <Plus size={16} />
            {uploading ? "Uploading..." : "Upload Photos"}
          </button>
        </div>
      </div>

      {images.length === 0 ? (
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-stone/30 p-20 text-center cursor-pointer hover:border-maroon transition-colors group"
        >
          <Upload size={40} className="mx-auto mb-4 text-stone/30 group-hover:text-maroon transition-colors" />
          <p className="text-stone font-medium">Click to upload gallery photos</p>
          <p className="text-stone/50 text-sm mt-1">Supports JPG, PNG, WebP. Multiple files allowed.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img) => (
            <div key={img.id} className="bg-white shadow-sm overflow-hidden group">
              <div className="relative h-44">
                <Image src={img.image_url} alt={img.caption || "Gallery"} fill className="object-cover" />
                <button
                  onClick={() => deleteImage(img.id, img.image_url)}
                  className="absolute top-2 right-2 w-8 h-8 bg-maroon text-cream opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="p-3">
                <input
                  type="text"
                  defaultValue={img.caption}
                  onBlur={(e) => updateCaption(img.id, e.target.value)}
                  placeholder="Add caption..."
                  className="w-full text-xs border-b border-transparent focus:border-stone/40 bg-transparent outline-none text-stone"
                />
              </div>
            </div>
          ))}

          {/* Add more */}
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-stone/30 h-56 flex items-center justify-center cursor-pointer hover:border-maroon transition-colors group"
          >
            <div className="text-center">
              <Plus size={24} className="mx-auto text-stone/30 group-hover:text-maroon mb-2 transition-colors" />
              <p className="text-xs text-stone/50">Add more</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
