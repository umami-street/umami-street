"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase";
import { Plus, Edit2, Trash2, X, Check, Upload, Eye, EyeOff } from "lucide-react";

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  category: string;
  is_published: boolean;
  published_at: string;
  created_at: string;
};

const EMPTY: Partial<Post> = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  cover_image_url: "",
  category: "news",
  is_published: false,
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const isSupabaseConfigured = () =>
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project");

export default function BlogsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Post> | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [coverMode, setCoverMode] = useState<"upload" | "url">("url");
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/blog-posts?all=true");
      const data = await res.json();
      setPosts(data);
    } catch {
      setPosts([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    if (!isSupabaseConfigured()) {
      alert("Image upload requires Supabase Storage. Please enter a URL instead.");
      return;
    }
    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const filePath = `blog/${Date.now()}.${ext}`;
    await supabase.storage.from("blog-images").upload(filePath, file, { upsert: true });
    const { data: { publicUrl } } = supabase.storage.from("blog-images").getPublicUrl(filePath);
    setEditing({ ...editing, cover_image_url: publicUrl });
    setUploading(false);
  };

  const save = async () => {
    if (!editing?.title) return;
    setSaving(true);
    const payload = {
      ...editing,
      slug: editing.slug || slugify(editing.title || ""),
    };

    try {
      if (editing.id) {
        await fetch("/api/blog-posts", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/blog-posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      setShowForm(false);
      setEditing(null);
      await load();
    } catch {
      alert("Failed to save post. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const deletePost = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    await fetch("/api/blog-posts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await load();
  };

  const togglePublish = async (post: Post) => {
    await fetch("/api/blog-posts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: post.id,
        is_published: !post.is_published,
        published_at: !post.is_published ? new Date().toISOString() : null,
      }),
    });
    await load();
  };

  const openNew = () => {
    setEditing(EMPTY);
    setCoverMode("url");
    setShowForm(true);
  };

  const openEdit = (post: Post) => {
    setEditing(post);
    setCoverMode("url");
    setShowForm(true);
  };

  if (loading) return <div className="p-8 text-stone">Loading posts...</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-charcoal" style={{ fontFamily: "var(--font-playfair)" }}>
            Blog Posts
          </h1>
          <p className="text-stone mt-1">Create and manage news, events, and stories.</p>
        </div>
        <button onClick={openNew} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Post
        </button>
      </div>

      {posts.length === 0 ? (
        <div className="bg-white p-12 text-center text-stone shadow-sm">
          No blog posts yet. Create your first post to get started.
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="bg-white shadow-sm flex gap-4 p-4 items-center">
              {post.cover_image_url && (
                <div className="relative w-20 h-16 shrink-0">
                  <Image src={post.cover_image_url} alt={post.title} fill className="object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 font-semibold rounded-full ${
                    post.is_published ? "bg-green-100 text-green-700" : "bg-stone/20 text-stone"
                  }`}>
                    {post.is_published ? "Published" : "Draft"}
                  </span>
                  <span className="text-xs text-stone border border-stone/30 px-2 py-0.5 capitalize">
                    {post.category}
                  </span>
                </div>
                <h3 className="font-bold text-charcoal text-sm truncate">{post.title}</h3>
                <p className="text-stone text-xs truncate">{post.excerpt}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => togglePublish(post)}
                  className="p-2 text-stone hover:text-maroon transition-colors"
                  title={post.is_published ? "Unpublish" : "Publish"}
                >
                  {post.is_published ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  onClick={() => openEdit(post)}
                  className="p-2 text-stone hover:text-maroon transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => deletePost(post.id)}
                  className="p-2 text-stone hover:text-red-600 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Form Modal */}
      {showForm && editing && (
        <div className="fixed inset-0 bg-charcoal/70 z-50 flex items-center justify-center p-4">
          <div className="bg-cream w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-charcoal text-cream px-6 py-4 flex items-center justify-between sticky top-0 z-10">
              <p className="font-bold" style={{ fontFamily: "var(--font-playfair)" }}>
                {editing.id ? "Edit Post" : "New Blog Post"}
              </p>
              <button onClick={() => { setShowForm(false); setEditing(null); }}>
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-1">Title *</label>
                <input
                  type="text"
                  value={editing.title ?? ""}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value, slug: slugify(e.target.value) })}
                  className="w-full border border-stone/40 bg-white px-4 py-2.5 text-sm"
                  placeholder="Our New Summer Menu Is Here"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-1">URL Slug</label>
                <input
                  type="text"
                  value={editing.slug ?? ""}
                  onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                  className="w-full border border-stone/40 bg-white px-4 py-2.5 text-sm font-mono"
                  placeholder="our-new-summer-menu"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-1">Category</label>
                <select
                  value={editing.category ?? "news"}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                  className="w-full border border-stone/40 bg-white px-4 py-2.5 text-sm"
                >
                  <option value="news">News</option>
                  <option value="event">Event</option>
                  <option value="promo">Promo</option>
                  <option value="story">Story</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-1">Excerpt</label>
                <textarea
                  value={editing.excerpt ?? ""}
                  onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })}
                  rows={2}
                  className="w-full border border-stone/40 bg-white px-4 py-2.5 text-sm resize-none"
                  placeholder="Short summary shown in the blog listing..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-1">Content</label>
                <textarea
                  value={editing.content ?? ""}
                  onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                  rows={8}
                  className="w-full border border-stone/40 bg-white px-4 py-2.5 text-sm resize-y font-mono text-xs"
                  placeholder="Full post content (HTML supported)..."
                />
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-2">Cover Image</label>
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setCoverMode("url")}
                    className={`px-3 py-1.5 text-xs font-semibold border transition-colors ${
                      coverMode === "url" ? "bg-charcoal text-cream border-charcoal" : "border-stone/30 text-stone"
                    }`}
                  >
                    Enter URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setCoverMode("upload")}
                    className={`px-3 py-1.5 text-xs font-semibold border transition-colors ${
                      coverMode === "upload" ? "bg-charcoal text-cream border-charcoal" : "border-stone/30 text-stone"
                    }`}
                  >
                    Upload File
                  </button>
                </div>

                {coverMode === "url" ? (
                  <input
                    type="text"
                    value={editing.cover_image_url ?? ""}
                    onChange={(e) => setEditing({ ...editing, cover_image_url: e.target.value })}
                    className="w-full border border-stone/40 bg-white px-4 py-2.5 text-sm"
                    placeholder="/images/my-photo.jpg or https://..."
                  />
                ) : (
                  <div className="flex items-center gap-4">
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                      className="btn-outline text-xs !py-2 !px-4 flex items-center gap-2"
                    >
                      <Upload size={13} />
                      {uploading ? "Uploading..." : "Upload Cover"}
                    </button>
                    <p className="text-stone/60 text-xs">Requires Supabase Storage</p>
                  </div>
                )}

                {editing.cover_image_url && (
                  <div className="relative w-32 h-20 mt-3 border border-stone/20">
                    <Image src={editing.cover_image_url} alt="Cover preview" fill className="object-cover" />
                  </div>
                )}
              </div>

              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={editing.is_published ?? false}
                  onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })}
                  className="w-4 h-4 accent-maroon"
                />
                Publish immediately (visible on the website)
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setShowForm(false); setEditing(null); }}
                  className="btn-outline flex-1 text-center text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={save}
                  disabled={saving}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  <Check size={15} /> {saving ? "Saving..." : "Save Post"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
