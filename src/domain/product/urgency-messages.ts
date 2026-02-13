import { isExpired, isExpiringSoon } from './model';
import type { Product } from './model';

/**
 * Urgency levels for product expiry (H2.4).
 *
 * - 'ok': Product is fresh, no urgency
 * - 'use_soon': Product expires in 1-2 days
 * - 'use_today': Product expires today (within 24 hours)
 * - 'wouldnt_trust': Product has expired
 */
export type UrgencyLevel = 'ok' | 'use_soon' | 'use_today' | 'wouldnt_trust';

/**
 * Urgency information with i18n message key.
 */
export interface UrgencyInfo {
  level: UrgencyLevel;
  messageKey: string;
}

/**
 * Calculates the number of days until a product expires.
 *
 * @param product - The product to check
 * @returns Number of days (0 = expires today, negative = expired, null = no date)
 *
 * @example
 * ```typescript
 * daysUntilExpiry(product) // => 2 (expires in 2 days)
 * daysUntilExpiry(product) // => 0 (expires today)
 * daysUntilExpiry(product) // => -1 (expired yesterday)
 * daysUntilExpiry(product) // => null (no expiry date)
 * ```
 */
export function daysUntilExpiry(product: Product): number | null {
  const date = product.expiryDate ?? product.estimatedExpiryDate;
  if (!date) return null;

  // Normalize both dates to start of day (midnight) for accurate day comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiryDay = new Date(date);
  expiryDay.setHours(0, 0, 0, 0);

  const diffMs = expiryDay.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Determines the urgency level of a product based on its expiry date.
 *
 * Business rules (H2.4):
 * - Expired → 'wouldnt_trust'
 * - Expires today (0 days) → 'use_today'
 * - Expires in 1-2 days → 'use_soon'
 * - Expires in 3+ days or no date → 'ok'
 *
 * @param product - The product to evaluate
 * @returns Urgency level
 *
 * @example
 * ```typescript
 * getUrgencyLevel(expiredProduct) // => 'wouldnt_trust'
 * getUrgencyLevel(todayProduct) // => 'use_today'
 * getUrgencyLevel(tomorrowProduct) // => 'use_soon'
 * getUrgencyLevel(freshProduct) // => 'ok'
 * ```
 */
export function getUrgencyLevel(product: Product): UrgencyLevel {
  // No expiry date → no urgency
  const date = product.expiryDate ?? product.estimatedExpiryDate;
  if (!date) return 'ok';

  // Expired → don't trust it
  if (isExpired(product)) return 'wouldnt_trust';

  // Calculate days until expiry
  const days = daysUntilExpiry(product);
  if (days === null) return 'ok';

  // Expires today → use today
  if (days === 0) return 'use_today';

  // Expires in 1-2 days → use soon
  if (isExpiringSoon(product)) return 'use_soon';

  // Otherwise, all good
  return 'ok';
}

/**
 * Gets urgency information including i18n message key.
 *
 * The message key follows the pattern: `product.urgency.{level}`
 * These keys should be translated in i18n files with human-friendly messages.
 *
 * @param product - The product to evaluate
 * @returns Urgency info with level and message key
 *
 * @example
 * ```typescript
 * getUrgencyInfo(product)
 * // => { level: 'use_soon', messageKey: 'product.urgency.use_soon' }
 * // Translates to: "Use soon" (EN) / "Úsalo pronto" (ES)
 * ```
 */
export function getUrgencyInfo(product: Product): UrgencyInfo {
  const level = getUrgencyLevel(product);
  return {
    level,
    messageKey: `product.urgency.${level}`,
  };
}
