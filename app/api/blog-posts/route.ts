import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const FILE = path.join(process.cwd(), "data", "blog-posts.json");

function readPosts() {
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8") || "[]");
  } catch {
    return [];
  }
}

function writePosts(posts: unknown[]) {
  fs.writeFileSync(FILE, JSON.stringify(posts, null, 2));
}

const supabaseConfigured = () =>
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project");

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const all = searchParams.get("all") === "true";

  try {
    if (supabaseConfigured()) {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      let query = supabase.from("blog_posts").select("*").order("published_at", { ascending: false });
      if (!all) query = query.eq("is_published", true);
      const { data } = await query;
      return NextResponse.json(data ?? []);
    }

    const posts = readPosts();
    const result = all ? posts : posts.filter((p: { is_published: boolean }) => p.is_published);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const post = {
      id: crypto.randomUUID(),
      ...body,
      created_at: new Date().toISOString(),
      published_at: body.is_published ? new Date().toISOString() : null,
    };

    if (supabaseConfigured()) {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      await supabase.from("blog_posts").insert(post);
    } else {
      const posts = readPosts();
      posts.unshift(post);
      writePosts(posts);
    }

    return NextResponse.json({ success: true, post });
  } catch {
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (updates.is_published && !updates.published_at) {
      updates.published_at = new Date().toISOString();
    }
    if (!updates.is_published) {
      updates.published_at = null;
    }

    if (supabaseConfigured()) {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      await supabase.from("blog_posts").update(updates).eq("id", id);
    } else {
      const posts = readPosts();
      const updated = posts.map((p: { id: string }) => p.id === id ? { ...p, ...updates } : p);
      writePosts(updated);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (supabaseConfigured()) {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      await supabase.from("blog_posts").delete().eq("id", id);
    } else {
      const posts = readPosts();
      writePosts(posts.filter((p: { id: string }) => p.id !== id));
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
