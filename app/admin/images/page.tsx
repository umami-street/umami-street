"use client";
import { useState, useRef } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";

type SiteSection = {
  key: string;
  label: string;
  description: string;
  currentSrc: string;
};

const SECTIONS: SiteSection[] = [
  { key: "hero_1", label: "Hero Slide 1", description: "Main hero carousel image 1", currentSrc: "/images/IMG_8414.JPG" },
  { key: "hero_2", label: "Hero Slide 2", description: "Main hero carousel image 2", currentSrc: "/images/IMG_8524.JPG" },
  { key: "hero_3", label: "Hero Slide 3", description: "Main hero carousel image 3", currentSrc: "/images/IMG_8831.JPG" },
  { key: "discover_feature", label: "About Section", description: "Image in the Discover / About section", currentSrc: "/images/IMG_8829.JPG" },
  { key: "cta_bg", label: "Order CTA Background", description: "Background image for the Order Now section", currentSrc: "/images/IMG_8829.JPG" },
  { key: "logo", label: "Restaurant Logo", description: "Logo used in navbar and footer", currentSrc: "/images/umami-logo.png" },
];

function UploadCard({ section }: { section: SiteSection }) {
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    setStatus("idle");

    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const path = `site/${section.key}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("site-images")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("site-images")
        .getPublicUrl(path);

      await supabase.from("site_content").upsert({
        section: section.key,
        content: { image_url: publicUrl },
        updated_at: new Date().toISOString(),
      }, { onConflict: "section" });

      setStatus("success");
    } catch (err) {
      console.error(err);
      setStatus("error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white shadow-sm overflow-hidden">
      <div className="relative h-48 bg-stone/10">
        <Image
          src={preview || section.currentSrc}
          alt={section.label}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-5">
        <h3 className="font-bold text-charcoal text-sm mb-1">{section.label}</h3>
        <p className="text-stone text-xs mb-4">{section.description}</p>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
        />

        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 btn-primary text-xs !py-2 !px-4 disabled:opacity-50"
        >
          <Upload size={14} />
          {uploading ? "Uploading..." : "Replace Image"}
        </button>

        {status === "success" && (
          <p className="flex items-center gap-1.5 text-green-700 text-xs mt-3">
            <CheckCircle size={13} /> Image updated successfully
          </p>
        )}
        {status === "error" && (
          <p className="flex items-center gap-1.5 text-maroon text-xs mt-3">
            <AlertCircle size={13} /> Upload failed. Check Supabase storage bucket.
          </p>
        )}
      </div>
    </div>
  );
}

export default function ImagesPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1
          className="text-3xl font-bold text-charcoal"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Site Images
        </h1>
        <p className="text-stone mt-1">
          Replace images across the website. Uploads go to Supabase Storage.
        </p>
      </div>

      <div className="bg-tan/10 border border-tan/30 px-5 py-4 mb-8 text-sm text-charcoal">
        <strong>Note:</strong> Make sure you&apos;ve created a Supabase storage bucket called{" "}
        <code className="bg-white px-1 py-0.5 text-xs rounded">site-images</code> with public read access before uploading.
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {SECTIONS.map((section) => (
          <UploadCard key={section.key} section={section} />
        ))}
      </div>
    </div>
  );
}
