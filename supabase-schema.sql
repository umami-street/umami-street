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
  order_number TEXT UNIQUE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  payment_method TEXT DEFAULT '',
  payment_reference TEXT DEFAULT '',
  status TEXT DEFAULT 'pending_payment',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
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

-- Public insert orders + public read for order tracking (filtered by order_number + email in app layer)
CREATE POLICY "Public insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read orders for tracking" ON orders FOR SELECT USING (true);

-- Auth users (admin) can do everything
CREATE POLICY "Admin all categories" ON menu_categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin all items" ON menu_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin all gallery" ON gallery_images FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin all blogs" ON blog_posts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin all orders" ON orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin all partners" ON partners FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin all site_content" ON site_content FOR ALL USING (auth.role() = 'authenticated');

-- ─────────────────────────────────────────────
-- Seed: Real Umami Street Menu
-- ─────────────────────────────────────────────
-- Run this block to seed the real menu (clears placeholder data first)
DO $$
DECLARE
  cat_bestsellers UUID;
  cat_wings       UUID;
  cat_rice        UUID;
  cat_takoyaki    UUID;
  cat_drinks      UUID;
  cat_sides       UUID;
BEGIN
  DELETE FROM menu_items;
  DELETE FROM menu_categories;

  INSERT INTO menu_categories (name, description, display_order) VALUES
    ('Best Sellers', 'Our most-loved items — the ones that keep our regulars coming back.', 0)
  RETURNING id INTO cat_bestsellers;

  INSERT INTO menu_categories (name, description, display_order) VALUES
    ('Chicken Wings', 'Choose from 6 amazing flavors: Honey Garlic, Buffalo, Yangnyeom, Garlic Parmesan, Snow Cheese, BBQ.', 1)
  RETURNING id INTO cat_wings;

  INSERT INTO menu_categories (name, description, display_order) VALUES
    ('Rice Meals & Combos', 'Complete, satisfying plates with rice and your choice of protein.', 2)
  RETURNING id INTO cat_rice;

  INSERT INTO menu_categories (name, description, display_order) VALUES
    ('Takoyaki', 'Japanese-style balls in 3 flavors. Available in 4, 8, or 12 pcs.', 3)
  RETURNING id INTO cat_takoyaki;

  INSERT INTO menu_categories (name, description, display_order) VALUES
    ('Drinks', 'Signature milk teas, fruit teas, and classic drinks to complete your meal.', 4)
  RETURNING id INTO cat_drinks;

  INSERT INTO menu_categories (name, description, display_order) VALUES
    ('Noodles, Fries & More', 'Sides and snacks to round out your order.', 5)
  RETURNING id INTO cat_sides;

  -- Best Sellers
  INSERT INTO menu_items (category_id, name, description, price, is_featured, display_order) VALUES
    (cat_bestsellers, '6 Pcs Wings', 'Choose up to 2 flavors: Honey Garlic, Buffalo, Yangnyeom, Garlic Parmesan, Snow Cheese, BBQ', 199.00, true, 0),
    (cat_bestsellers, 'Beef Bulgogi + Rice', 'Marinated Korean-style beef bulgogi served with steamed rice', 149.00, true, 1),
    (cat_bestsellers, 'Kyoto Matcha Milk Tea', '16oz ₱85 · 22oz ₱95', 85.00, true, 2);

  -- Chicken Wings
  INSERT INTO menu_items (category_id, name, description, price, is_featured, display_order) VALUES
    (cat_wings, '6 Pcs Wings', 'Choose up to 2 flavors', 199.00, false, 0),
    (cat_wings, '12 Pcs Wings', 'Choose up to 4 flavors', 379.00, false, 1),
    (cat_wings, '24 Pcs Wings', 'All 6 flavors available', 749.00, false, 2);

  -- Rice Meals & Combos
  INSERT INTO menu_items (category_id, name, description, price, is_featured, display_order) VALUES
    (cat_rice, '3 Wings + Rice', '3 pcs wings with your choice of flavor, served with steamed rice', 129.00, false, 0),
    (cat_rice, 'Beef Bulgogi + Rice', 'Marinated Korean-style beef bulgogi served with steamed rice', 149.00, true, 1),
    (cat_rice, '3 Wings + Rice + Drink', 'Combo: 3 wings, steamed rice, and Coke or water', 149.00, false, 2),
    (cat_rice, '3 Wings + Rice + Fries + Drink', 'Full combo: 3 wings, rice, fries, and Coke or water', 199.00, false, 3);

  -- Takoyaki
  INSERT INTO menu_items (category_id, name, description, price, is_featured, display_order) VALUES
    (cat_takoyaki, 'Veggie Takoyaki', '4 pcs ₱79 · 8 pcs ₱129 · 12 pcs ₱179', 79.00, false, 0),
    (cat_takoyaki, 'Cheese Bomb Takoyaki', '4 pcs ₱89 · 8 pcs ₱149 · 12 pcs ₱199', 89.00, false, 1),
    (cat_takoyaki, 'Octobits Takoyaki', '4 pcs ₱89 · 8 pcs ₱149 · 12 pcs ₱199', 89.00, true, 2);

  -- Drinks
  INSERT INTO menu_items (category_id, name, description, price, is_featured, display_order) VALUES
    (cat_drinks, 'Osaka Melon Cloud', 'Signature milk tea · 16oz ₱75 · 22oz ₱85', 75.00, false, 0),
    (cat_drinks, 'Kyoto Matcha', 'Signature milk tea · 16oz ₱85 · 22oz ₱95', 85.00, true, 1),
    (cat_drinks, 'Tokyo Sunset', 'Signature milk tea · 16oz ₱75 · 22oz ₱85', 75.00, false, 2),
    (cat_drinks, 'Nara Green Glow', 'Signature milk tea · 16oz ₱75 · 22oz ₱85', 75.00, false, 3),
    (cat_drinks, 'Fruit Tea', 'Lychee, Honey Peach, Strawberry, Green Apple, Mango, Passion Fruit, Blueberry · 16oz ₱55 · 22oz ₱65', 55.00, false, 4),
    (cat_drinks, 'Coke', '330ml can', 30.00, false, 5),
    (cat_drinks, 'Bottled Water', '500ml', 25.00, false, 6);

  -- Noodles, Fries & More
  INSERT INTO menu_items (category_id, name, description, price, is_featured, display_order) VALUES
    (cat_sides, 'HK Fried Noodles', 'Plain ₱55 · +Chicken Siomai +₱15/pc · +Beef Siomai +₱18/pc', 55.00, false, 0),
    (cat_sides, 'Regular Fries', 'Crispy golden fries', 59.00, false, 1),
    (cat_sides, 'Flavored Fries', 'Cheese, BBQ, Sour Cream, or Chili BBQ', 79.00, false, 2),
    (cat_sides, 'Extra Rice', 'Add steamed rice to any order', 25.00, false, 3),
    (cat_sides, 'Extra Pearl / Jelly', 'Add-on for milk tea orders · Pearl ₱15 · Jelly ₱15', 15.00, false, 4);
END $$;

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

-- ─────────────────────────────────────────────
-- Migration: Orders table — new payment + tracking columns
-- Run this if you already created the orders table without these columns
-- ─────────────────────────────────────────────
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number TEXT UNIQUE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_reference TEXT DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
-- Update status default for new orders
ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'pending_payment';
-- Add public read policy for order tracking (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='orders' AND policyname='Public read orders for tracking'
  ) THEN
    CREATE POLICY "Public read orders for tracking" ON orders FOR SELECT USING (true);
  END IF;
END $$;
