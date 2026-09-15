-- ============================================================
-- Umami Street — Supabase Database Schema
-- Run this in your Supabase SQL Editor (project → SQL Editor)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────
-- Site Content (hero images, section content)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section TEXT NOT NULL UNIQUE,
  content JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────
-- Menu Categories
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS menu_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────
-- Menu Items
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES menu_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────
-- Gallery Images
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gallery_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  caption TEXT DEFAULT '',
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────
-- Blog Posts / Events
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  cover_image_url TEXT,
  category TEXT DEFAULT 'news',
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────
-- Orders
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────
-- Catering Inquiries
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS catering_inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  event_type TEXT,
  event_date TEXT,
  location TEXT,
  guest_count TEXT,
  menu_notes TEXT,
  message TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE catering_inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert catering" ON catering_inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin all catering" ON catering_inquiries FOR ALL USING (auth.role() = 'authenticated');

-- ─────────────────────────────────────────────
-- Partners
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS partners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- ─────────────────────────────────────────────
-- Row Level Security — PUBLIC can read
-- ─────────────────────────────────────────────
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Public read categories" ON menu_categories FOR SELECT USING (true);
CREATE POLICY "Public read items" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Public read gallery" ON gallery_images FOR SELECT USING (true);
CREATE POLICY "Public read blogs" ON blog_posts FOR SELECT USING (is_published = true);
CREATE POLICY "Public read partners" ON partners FOR SELECT USING (is_active = true);
CREATE POLICY "Public read site_content" ON site_content FOR SELECT USING (true);

-- Public insert orders
CREATE POLICY "Public insert orders" ON orders FOR INSERT WITH CHECK (true);

-- Auth users (admin) can do everything
CREATE POLICY "Admin all categories" ON menu_categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin all items" ON menu_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin all gallery" ON gallery_images FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin all blogs" ON blog_posts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin all orders" ON orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin all partners" ON partners FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin all site_content" ON site_content FOR ALL USING (auth.role() = 'authenticated');

-- ─────────────────────────────────────────────
-- Seed: Menu Categories
-- ─────────────────────────────────────────────
INSERT INTO menu_categories (name, description, display_order) VALUES
  ('Best Sellers', 'Our most-loved dishes — the ones that keep our regulars coming back.', 0),
  ('Grilled & Chicken', 'Slow-marinated and grilled to perfection — bold smoke, tender meat.', 1),
  ('Rice Meals', 'Complete, satisfying plates that hit every flavor note.', 2),
  ('Drinks', 'Refreshing beverages to pair with your meal — fresh and flavorful.', 3),
  ('Specials', 'Chef''s rotating selection of seasonal and limited offerings.', 4)
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────
-- Storage Buckets (run separately if needed)
-- ─────────────────────────────────────────────
-- In Supabase Dashboard > Storage, create these buckets as PUBLIC:
--   • site-images
--   • menu-images
--   • gallery-images
--   • blog-images

-- ─────────────────────────────────────────────
-- Live Chat
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_name TEXT NOT NULL,
  visitor_email TEXT NOT NULL,
  visitor_contact TEXT,
  concern_type TEXT,
  concern_background TEXT,
  status TEXT DEFAULT 'open',
  unread_count INT DEFAULT 0,
  last_message TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  sender TEXT NOT NULL,
  agent_name TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public insert chat session" ON chat_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read own session" ON chat_sessions FOR SELECT USING (true);
CREATE POLICY "Public insert chat message" ON chat_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read chat messages" ON chat_messages FOR SELECT USING (true);
CREATE POLICY "Admin all chat sessions" ON chat_sessions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin all chat messages" ON chat_messages FOR ALL USING (auth.role() = 'authenticated');

-- ─────────────────────────────────────────────
-- Chat Agent State (single-row heartbeat tracker)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_agent_state (
  id INT PRIMARY KEY DEFAULT 1,
  agent_name TEXT DEFAULT '',
  last_heartbeat TIMESTAMPTZ
);

ALTER TABLE chat_agent_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read agent state" ON chat_agent_state FOR SELECT USING (true);
CREATE POLICY "Admin all agent state" ON chat_agent_state FOR ALL USING (auth.role() = 'authenticated');

INSERT INTO chat_agent_state (id, agent_name, last_heartbeat)
VALUES (1, '', null) ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────
-- Trigger: update session summary on new message
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_session_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_sessions
  SET
    last_message = LEFT(NEW.message, 80),
    updated_at   = NOW(),
    unread_count = CASE
      WHEN NEW.sender = 'visitor' THEN COALESCE(unread_count, 0) + 1
      ELSE COALESCE(unread_count, 0)
    END
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_chat_message_insert
  AFTER INSERT ON chat_messages
  FOR EACH ROW EXECUTE FUNCTION update_session_on_message();
