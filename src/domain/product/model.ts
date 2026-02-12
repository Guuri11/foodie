import { ProductError } from './errors';
import type { ProductLocation, ProductOutcome, ProductStatus } from './value-objects';

export interface Product {
  id: string;
  name: string;
  status: ProductStatus;
  location?: ProductLocation;
  quantity?: string;
  expiryDate?: Date;
  estimatedExpiryDate?: Date;
  outcome?: ProductOutcome;
  createdAt: Date;
  updatedAt: Date;
}

const EXPIRING_SOON_DAYS = 2;

export function createProduct(params: {
  id: string;
  name: string;
  status?: ProductStatus;
  location?: ProductLocation;
  quantity?: string;
  expiryDate?: Date;
  estimatedExpiryDate?: Date;
  outcome?: ProductOutcome;
  createdAt?: Date;
  updatedAt?: Date;
}): Product {
  const trimmedName = params.name.trim();
  if (!trimmedName) {
    throw ProductError.nameEmpty();
  }

  const now = new Date();

  return {
    id: params.id,
    name: trimmedName,
    status: params.status ?? 'new',
    location: params.location,
    quantity: params.quantity,
    expiryDate: params.expiryDate,
    estimatedExpiryDate: params.estimatedExpiryDate,
    outcome: params.outcome,
    createdAt: params.createdAt ?? now,
    updatedAt: params.updatedAt ?? now,
  };
}

export function isExpiringSoon(product: Product): boolean {
  const date = product.expiryDate ?? product.estimatedExpiryDate;
  if (!date) return false;
  const daysUntilExpiry = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return daysUntilExpiry <= EXPIRING_SOON_DAYS && daysUntilExpiry >= 0;
}

export function isExpired(product: Product): boolean {
  const date = product.expiryDate ?? product.estimatedExpiryDate;
  if (!date) return false;
  return date.getTime() < Date.now();
}

export function isActive(product: Product): boolean {
  return product.status !== 'finished';
}
