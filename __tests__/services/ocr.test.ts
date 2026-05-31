import { parseTicketText } from '../../src/services/ocr';

describe('parseTicketText', () => {
  test('extracts store name from known store', () => {
    const text = 'MEDIAMARKT ESPANA\nNIF: A62385729\nFECHA: 15/03/2025\nSAMSUNG TV 55" 599,99€';
    const result = parseTicketText(text);
    expect(result.store_name).toBe('MediaMarkt');
  });

  test('extracts date in dd/mm/yyyy format', () => {
    const text = 'TIENDA X\nFECHA: 25/12/2024\nProducto 10,00€';
    const result = parseTicketText(text);
    expect(result.purchase_date).toBe('2024-12-25');
  });

  test('extracts date in dd-mm-yyyy format', () => {
    const text = 'TIENDA X\n28-02-2025\nProducto 10,00€';
    const result = parseTicketText(text);
    expect(result.purchase_date).toBe('2025-02-28');
  });

  test('extracts items with prices', () => {
    const text = 'TIENDA\nFECHA: 01/01/2025\nAuriculares Sony 49,99€\nFunda movil 12,50€';
    const result = parseTicketText(text);
    expect(result.items.length).toBe(2);
    expect(result.items[0]).toEqual({ name: 'Auriculares Sony', price: 49.99 });
    expect(result.items[1]).toEqual({ name: 'Funda movil', price: 12.5 });
  });

  test('extracts CIF', () => {
    const text = 'MEDIAMARKT\nCIF: A62385729\nFECHA: 01/01/2025';
    const result = parseTicketText(text);
    expect(result.cif).toBe('A62385729');
  });

  test('returns null fields when nothing found', () => {
    const text = 'some random text without useful data';
    const result = parseTicketText(text);
    expect(result.store_name).toBeNull();
    expect(result.purchase_date).toBeNull();
    expect(result.items).toEqual([]);
    expect(result.cif).toBeNull();
    expect(result.raw_text).toBe(text);
  });
});
