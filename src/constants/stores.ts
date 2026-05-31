export interface StoreInfo {
  name: string;
  aliases: string[];
  cif?: string;
}

export const SPANISH_STORES: StoreInfo[] = [
  { name: 'El Corte Ingles', aliases: ['ECI', 'ELCORTEINGLES', 'EL CORTE INGLES'], cif: 'A28017895' },
  { name: 'MediaMarkt', aliases: ['MEDIA MARKT', 'MEDIAMARKT'], cif: 'A62385729' },
  { name: 'FNAC', aliases: ['FNAC ESPANA'], cif: 'A80500200' },
  { name: 'PCComponentes', aliases: ['PCC', 'PCCOMPONENTES', 'PC COMPONENTES'], cif: 'B73347494' },
  { name: 'Amazon', aliases: ['AMAZON EU', 'AMAZON.ES', 'AMZN'], cif: 'W0184081H' },
  { name: 'Carrefour', aliases: ['CARREFOUR HIPERMERCADO', 'CARREFOUR SA'], cif: 'A28425270' },
  { name: 'Leroy Merlin', aliases: ['LEROY MERLIN ESPANA', 'LEROYMERLIN'], cif: 'A81573479' },
  { name: 'IKEA', aliases: ['IKEA IBERICA'], cif: 'A60643510' },
  { name: 'Decathlon', aliases: ['DECATHLON ESPANA'], cif: 'A79935607' },
  { name: 'Zara', aliases: ['INDITEX', 'ZARA ESPANA'], cif: 'A15075062' },
  { name: 'Worten', aliases: ['WORTEN ESPANA'], cif: 'A84551328' },
  { name: 'Alcampo', aliases: ['ALCAMPO SA'], cif: 'A28581882' },
  { name: 'Lidl', aliases: ['LIDL SUPERMERCADOS'], cif: 'A60195278' },
  { name: 'Mercadona', aliases: ['MERCADONA SA'], cif: 'A46103834' },
  { name: 'Conforama', aliases: ['CONFORAMA ESPANA'], cif: 'A28414522' },
  { name: 'Apple Store', aliases: ['APPLE RETAIL SPAIN', 'APPLE STORE'], cif: 'B84621653' },
  { name: 'Samsung Store', aliases: ['SAMSUNG ELECTRONICS'], cif: 'B82387572' },
  { name: 'Xiaomi Store', aliases: ['XIAOMI TECHNOLOGY'], cif: 'B88110916' },
];

export function findStore(text: string): StoreInfo | null {
  const upper = text.toUpperCase();
  for (const store of SPANISH_STORES) {
    if (upper.includes(store.name.toUpperCase())) return store;
    for (const alias of store.aliases) {
      if (upper.includes(alias)) return store;
    }
    if (store.cif && upper.includes(store.cif)) return store;
  }
  return null;
}
