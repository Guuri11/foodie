import type { ProductLocation, ProductStatus } from '../value-objects';

/**
 * Response from expiry estimation service.
 */
export interface ExpiryEstimation {
  /**
   * Estimated expiry date, or null if unable to estimate.
   */
  date: Date | null;

  /**
   * Confidence level of the estimation.
   * - 'high': Based on reliable data or well-known product categories
   * - 'medium': Reasonable guess based on general category
   * - 'low': Uncertain estimation
   * - 'none': Unable to estimate
   */
  confidence: 'high' | 'medium' | 'low' | 'none';
}

/**
 * Service port for estimating product expiry dates.
 *
 * This is a domain interface (port) that will be implemented by
 * infrastructure adapters (e.g., OpenAI, local database, etc.).
 *
 * The service considers:
 * - Product name and category
 * - Current lifecycle status (new/opened/almost_empty)
 * - Storage location (fridge/freezer/pantry)
 *
 * @example
 * ```typescript
 * const estimation = await estimator.estimateExpiryDate(
 *   'Milk',
 *   'opened',
 *   'fridge'
 * );
 * // { date: Date('2025-02-18'), confidence: 'high' }
 * ```
 */
export interface ExpiryEstimatorService {
  /**
   * Estimates the expiry date for a product based on its characteristics.
   *
   * @param productName - Name of the product (e.g., "milk", "chicken breast")
   * @param status - Current lifecycle status
   * @param location - Storage location (affects shelf life)
   * @returns Estimation with date and confidence level
   *
   * @remarks
   * - Returns null date if unable to estimate
   * - Never throws errors (fails gracefully)
   * - Opened products typically have shorter estimates than new products
   * - Freezer location significantly extends shelf life
   */
  estimateExpiryDate(
    productName: string,
    status: ProductStatus,
    location?: ProductLocation
  ): Promise<ExpiryEstimation>;
}
