"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Calendar } from "lucide-react";

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image_url: string;
  category: string;
  published_at: string;
};

export default function BlogSection() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/blog-posts")
      .then((r) => r.json())
      .then((data) => setPosts(data.slice(0, 3)))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="blog" className="py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <p className="label-tag mb-3">News & Events</p>
            <h2 className="section-heading text-charcoal">What&apos;s New at Umami Street</h2>
          </div>
          <p className="section-subheading text-stone md:text-right max-w-md">
            Stay in the loop with our latest menu drops, promos, events, and stories
            straight from the kitchen.
          </p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white shadow-sm animate-pulse">
                <div className="h-52 bg-stone/20" />
                <div className="p-6 space-y-3">
                  <div className="h-3 bg-stone/20 rounded w-24" />
                  <div className="h-5 bg-stone/20 rounded w-full" />
                  <div className="h-4 bg-stone/10 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 text-stone">
            <p>No posts published yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article
                key={post.id}
                className="group bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative h-52 overflow-hidden bg-stone/10">
                  {post.cover_image_url ? (
                    <Image
                      src={post.cover_image_url}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-stone/20 flex items-center justify-center">
                      <span className="text-stone/40 text-sm">No image</span>
                    </div>
                  )}
                  {post.category && (
                    <span className="absolute top-3 left-3 bg-maroon text-cream text-xs font-bold px-2 py-1 uppercase tracking-wide">
                      {post.category}
                    </span>
                  )}
                </div>
                <div className="p-6">
                  {post.published_at && (
                    <div className="flex items-center gap-3 text-stone text-xs mb-3">
                      <Calendar size={12} />
                      <span>
                        {new Date(post.published_at).toLocaleDateString("en-PH", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                  <h3
                    className="font-bold text-charcoal text-lg leading-snug mb-3 group-hover:text-maroon transition-colors"
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    {post.title}
                  </h3>
                  <p className="text-stone text-sm leading-relaxed mb-5">
                    {post.excerpt}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
