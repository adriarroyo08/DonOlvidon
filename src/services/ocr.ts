import { OCRResult } from '../types';
import { findStore } from '../constants/stores';

export async function recognizeText(imagePath: string): Promise<string> {
  const MlkitOcr = require('react-native-mlkit-ocr').default;
  const result = await MlkitOcr.detectFromUri(imagePath);
  return result.map((block: any) => block.text).join('\n');
}

export function parseTicketText(text: string): OCRResult {
  const result: OCRResult = {
    store_name: null,
    purchase_date: null,
    items: [],
    cif: null,
    raw_text: text,
  };

  // Find store by name or CIF
  const store = findStore(text);
  if (store) {
    result.store_name = store.name;
  }

  // Extract CIF: letter + 8 digits, or 8 digits + letter
  const cifMatch = text.match(/(?:CIF|NIF|N\.I\.F|C\.I\.F)[:\s]*([A-Z]\d{8}|\d{8}[A-Z])/i);
  if (cifMatch) {
    result.cif = cifMatch[1].toUpperCase();
    // Try to find store by CIF if not already found
    if (!result.store_name) {
      const storeFromCif = findStore(result.cif);
      if (storeFromCif) result.store_name = storeFromCif.name;
    }
  }

  // Extract date: dd/mm/yyyy or dd-mm-yyyy
  const dateMatch = text.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
  if (dateMatch) {
    const [, day, month, year] = dateMatch;
    const d = parseInt(day, 10);
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31 && y >= 2000 && y <= 2100) {
      result.purchase_date = `${year}-${month}-${day}`;
    }
  }

  // Extract items with prices: "description price€"
  const lines = text.split('\n');
  const priceRegex = /^(.+?)\s+(\d+[.,]\d{2})\s*€?\s*$/;
  for (const line of lines) {
    const match = line.trim().match(priceRegex);
    if (match) {
      const name = match[1].trim();
      const price = parseFloat(match[2].replace(',', '.'));
      // Skip lines that look like totals, subtotals, tax
      const skipWords = ['TOTAL', 'SUBTOTAL', 'IVA', 'BASE', 'IMPONIBLE', 'DESCUENTO', 'CAMBIO', 'EFECTIVO', 'TARJETA'];
      if (!skipWords.some((w) => name.toUpperCase().includes(w)) && price > 0) {
        result.items.push({ name, price });
      }
    }
  }

  return result;
}

export async function scanReceipt(imagePath: string): Promise<OCRResult> {
  const text = await recognizeText(imagePath);
  return parseTicketText(text);
}
