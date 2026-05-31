export type ProductCategory =
  | 'electronica'
  | 'electrodomesticos'
  | 'ropa'
  | 'muebles'
  | 'vehiculos'
  | 'otros';

export type ProductStatus = 'active' | 'expired' | 'claimed';

export interface Product {
  id: string;
  user_id: string;
  family_id: string | null;
  name: string;
  brand: string;
  model: string;
  category: ProductCategory;
  barcode: string | null;
  purchase_date: string; // ISO date
  warranty_months: number;
  warranty_end_date: string; // ISO date
  store_name: string;
  purchase_price: number | null;
  notes: string | null;
  status: ProductStatus;
  is_second_hand: boolean;
  created_at: string;
}

export interface Receipt {
  id: string;
  product_id: string;
  storage_path: string;
  ocr_text: string | null;
  created_at: string;
}

export interface NotificationLog {
  id: string;
  user_id: string;
  product_id: string;
  type: 'push_30d' | 'push_7d' | 'push_1d';
  sent_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  notify_30d: boolean;
  notify_7d: boolean;
  notify_1d: boolean;
  created_at: string;
}

export interface OCRResult {
  store_name: string | null;
  purchase_date: string | null;
  items: Array<{ name: string; price: number }>;
  cif: string | null;
  raw_text: string;
}
