import * as SQLite from 'expo-sqlite';
import { Product, Receipt } from '../types';

let db: SQLite.SQLiteDatabase;

export async function initDatabase(): Promise<void> {
  db = await SQLite.openDatabaseAsync('donolvidon.db');
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      family_id TEXT,
      name TEXT NOT NULL,
      brand TEXT NOT NULL DEFAULT '',
      model TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT 'otros',
      barcode TEXT,
      purchase_date TEXT NOT NULL,
      warranty_months INTEGER NOT NULL DEFAULT 36,
      warranty_end_date TEXT NOT NULL,
      store_name TEXT NOT NULL DEFAULT '',
      purchase_price REAL,
      notes TEXT,
      is_second_hand INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL,
      synced INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS receipts (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      storage_path TEXT NOT NULL,
      ocr_text TEXT,
      created_at TEXT NOT NULL,
      synced INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );
  `);
}

export function calculateWarrantyEndDate(purchaseDate: string, months: number): string {
  const date = new Date(purchaseDate);
  date.setMonth(date.getMonth() + months);
  return date.toISOString().split('T')[0];
}

export function getWarrantyStatus(endDate: string): 'active' | 'expired' {
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return end >= today ? 'active' : 'expired';
}

export function daysUntilExpiry(endDate: string): number {
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = end.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export async function insertProduct(product: Product): Promise<void> {
  await db.runAsync(
    `INSERT INTO products (id, user_id, family_id, name, brand, model, category, barcode, purchase_date, warranty_months, warranty_end_date, store_name, purchase_price, notes, is_second_hand, status, created_at, synced)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
    [product.id, product.user_id, product.family_id, product.name, product.brand, product.model, product.category, product.barcode, product.purchase_date, product.warranty_months, product.warranty_end_date, product.store_name, product.purchase_price, product.notes, product.is_second_hand ? 1 : 0, product.status, product.created_at]
  );
}

export async function getProducts(userId: string): Promise<Product[]> {
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM products WHERE user_id = ? ORDER BY warranty_end_date ASC',
    [userId]
  );
  return rows.map((r) => ({ ...r, is_second_hand: !!r.is_second_hand }));
}

export async function getProductById(id: string): Promise<Product | null> {
  const row = await db.getFirstAsync<any>('SELECT * FROM products WHERE id = ?', [id]);
  return row ? { ...row, is_second_hand: !!row.is_second_hand } : null;
}

export async function updateProduct(product: Product): Promise<void> {
  await db.runAsync(
    `UPDATE products SET name=?, brand=?, model=?, category=?, barcode=?, purchase_date=?, warranty_months=?, warranty_end_date=?, store_name=?, purchase_price=?, notes=?, is_second_hand=?, status=?, synced=0 WHERE id=? AND user_id=?`,
    [product.name, product.brand, product.model, product.category, product.barcode, product.purchase_date, product.warranty_months, product.warranty_end_date, product.store_name, product.purchase_price, product.notes, product.is_second_hand ? 1 : 0, product.status, product.id, product.user_id]
  );
}

export async function deleteProduct(id: string, userId: string): Promise<void> {
  await db.runAsync('DELETE FROM products WHERE id = ? AND user_id = ?', [id, userId]);
}

export async function getUnsyncedProducts(): Promise<Product[]> {
  const rows = await db.getAllAsync<any>('SELECT * FROM products WHERE synced = 0');
  return rows.map((r) => ({ ...r, is_second_hand: !!r.is_second_hand }));
}

export async function markProductSynced(id: string): Promise<void> {
  await db.runAsync('UPDATE products SET synced = 1 WHERE id = ?', [id]);
}

export async function insertReceipt(receipt: Receipt): Promise<void> {
  await db.runAsync(
    'INSERT INTO receipts (id, product_id, storage_path, ocr_text, created_at, synced) VALUES (?, ?, ?, ?, ?, 0)',
    [receipt.id, receipt.product_id, receipt.storage_path, receipt.ocr_text, receipt.created_at]
  );
}

export async function getReceiptsByProduct(productId: string): Promise<Receipt[]> {
  return db.getAllAsync<Receipt>('SELECT * FROM receipts WHERE product_id = ?', [productId]);
}
