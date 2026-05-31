import { ProductCategory } from '../types';

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  electronica: 'Electronica',
  electrodomesticos: 'Electrodomesticos',
  ropa: 'Ropa y calzado',
  muebles: 'Muebles y hogar',
  vehiculos: 'Vehiculos',
  otros: 'Otros',
};

export const CATEGORY_ICONS: Record<ProductCategory, string> = {
  electronica: 'laptop',
  electrodomesticos: 'washing-machine',
  ropa: 'tshirt-crew',
  muebles: 'sofa',
  vehiculos: 'car',
  otros: 'package-variant',
};

export const CATEGORIES = Object.keys(CATEGORY_LABELS) as ProductCategory[];
