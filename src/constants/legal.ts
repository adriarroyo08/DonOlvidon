export const WARRANTY_LAW = {
  newProductMonths: 36,
  secondHandMonths: 12,
  sellerBurdenYears: 2,
  consumerBurdenYear: 3,
  rights: [
    'Reparacion del producto',
    'Sustitucion del producto',
    'Rebaja del precio',
    'Resolucion del contrato (devolucion)',
  ],
  legalText:
    'Desde el 1 de enero de 2022, la garantia legal en Espana es de 3 anos para productos nuevos y 1 ano para productos de segunda mano (Real Decreto-ley 7/2021).',
  links: {
    boe: 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-20555',
    ocu: 'https://www.ocu.org/consumo-familia/derechos-consumidor/consejos/garantias',
  },
} as const;
