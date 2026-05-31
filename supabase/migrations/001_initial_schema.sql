-- Users profile (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  notify_30d BOOLEAN NOT NULL DEFAULT TRUE,
  notify_7d BOOLEAN NOT NULL DEFAULT TRUE,
  notify_1d BOOLEAN NOT NULL DEFAULT TRUE,
  push_token TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Products
CREATE TYPE product_category AS ENUM (
  'electronica', 'electrodomesticos', 'ropa', 'muebles', 'vehiculos', 'otros'
);
CREATE TYPE product_status AS ENUM ('active', 'expired', 'claimed');

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  family_id UUID,
  name TEXT NOT NULL,
  brand TEXT NOT NULL DEFAULT '',
  model TEXT NOT NULL DEFAULT '',
  category product_category NOT NULL DEFAULT 'otros',
  barcode TEXT,
  purchase_date DATE NOT NULL,
  warranty_months INTEGER NOT NULL DEFAULT 36,
  warranty_end_date DATE GENERATED ALWAYS AS (purchase_date + (warranty_months || ' months')::INTERVAL) STORED,
  store_name TEXT NOT NULL DEFAULT '',
  purchase_price DECIMAL,
  notes TEXT,
  is_second_hand BOOLEAN NOT NULL DEFAULT FALSE,
  status product_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_user ON products(user_id);
CREATE INDEX idx_products_warranty_end ON products(warranty_end_date);
CREATE INDEX idx_products_status ON products(status);

-- Receipts
CREATE TABLE public.receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  ocr_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_receipts_product ON receipts(product_id);

-- Notifications log
CREATE TYPE notification_type AS ENUM ('push_30d', 'push_7d', 'push_1d');

CREATE TABLE public.notifications_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications_log(user_id);
CREATE UNIQUE INDEX idx_notifications_dedup ON notifications_log(user_id, product_id, type);

-- RLS Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications_log ENABLE ROW LEVEL SECURITY;

-- Users: own row only
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Products: own products only
CREATE POLICY "Users can view own products"
  ON public.products FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own products"
  ON public.products FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own products"
  ON public.products FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own products"
  ON public.products FOR DELETE USING (auth.uid() = user_id);

-- Receipts: via product ownership
CREATE POLICY "Users can view own receipts"
  ON public.receipts FOR SELECT
  USING (EXISTS (SELECT 1 FROM products WHERE products.id = receipts.product_id AND products.user_id = auth.uid()));
CREATE POLICY "Users can insert own receipts"
  ON public.receipts FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM products WHERE products.id = receipts.product_id AND products.user_id = auth.uid()));
CREATE POLICY "Users can delete own receipts"
  ON public.receipts FOR DELETE
  USING (EXISTS (SELECT 1 FROM products WHERE products.id = receipts.product_id AND products.user_id = auth.uid()));

-- Notifications: own only
CREATE POLICY "Users can view own notifications"
  ON public.notifications_log FOR SELECT USING (auth.uid() = user_id);

-- Storage bucket for receipts
INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', false);

CREATE POLICY "Users can upload receipts"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'receipts' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can view own receipts"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'receipts' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can delete own receipts"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'receipts' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
