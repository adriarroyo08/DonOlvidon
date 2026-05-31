import { calculateWarrantyEndDate, getWarrantyStatus } from '../../src/services/database';

describe('database utilities', () => {
  test('calculateWarrantyEndDate adds months correctly', () => {
    expect(calculateWarrantyEndDate('2024-01-15', 36)).toBe('2027-01-15');
    expect(calculateWarrantyEndDate('2023-06-01', 12)).toBe('2024-06-01');
  });

  test('getWarrantyStatus returns correct status', () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    const past = new Date();
    past.setFullYear(past.getFullYear() - 1);

    expect(getWarrantyStatus(future.toISOString().split('T')[0])).toBe('active');
    expect(getWarrantyStatus(past.toISOString().split('T')[0])).toBe('expired');
  });
});
