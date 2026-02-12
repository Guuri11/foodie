export type ProductStatus = 'new' | 'opened' | 'almost_empty' | 'finished';

export type ProductLocation = 'fridge' | 'pantry' | 'freezer';

export type ProductOutcome = 'used' | 'thrown_away';

export const PRODUCT_STATUSES: ProductStatus[] = ['new', 'opened', 'almost_empty', 'finished'];

export const PRODUCT_LOCATIONS: ProductLocation[] = ['fridge', 'pantry', 'freezer'];

export const PRODUCT_OUTCOMES: ProductOutcome[] = ['used', 'thrown_away'];
