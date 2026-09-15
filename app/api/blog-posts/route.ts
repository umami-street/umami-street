import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const all = searchParams.get("all") === "true";

  try {
    const supabase = await createClient();
    let query = supabase.from("blog_posts").select("*").order("published_at", { ascending: false });
    if (!all) query = query.eq("is_published", true);
    const { data } = await query;
    return NextResponse.json(data ?? []);
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
    const supabase = await createClient();
    await supabase.from("blog_posts").insert(post);
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
    const supabase = await createClient();
    await supabase.from("blog_posts").update(updates).eq("id", id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const supabase = await createClient();
    await supabase.from("blog_posts").delete().eq("id", id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
