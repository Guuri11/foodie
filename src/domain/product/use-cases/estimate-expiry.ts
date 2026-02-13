import type { Product } from '../model';

/**
 * Use case for estimating and setting a product's expiry date (H2.3).
 *
 * Business rules:
 * - Uses ExpiryEstimatorService (OpenAI) to estimate expiry date
 * - Sets `estimatedExpiryDate` (does NOT override manual `expiryDate`)
 * - Called when:
 *   - Product is created (automatic estimation)
 *   - Product status changes (e.g., opened → shorter shelf life)
 *   - Product location changes (e.g., fridge → longer shelf life)
 * - Fails gracefully (no errors if estimation unavailable)
 *
 * @example
 * ```typescript
 * // Estimate expiry when product is opened
 * await estimateExpiry.execute('product-id');
 *
 * // Result: product.estimatedExpiryDate is updated
 * ```
 */
export interface EstimateExpiryUseCase {
  /**
   * Estimates and updates a product's expiry date.
   *
   * @param id - Product identifier
   * @returns Updated product with estimated expiry date
   * @throws {ProductError} If product not found
   *
   * @remarks
   * - Only updates `estimatedExpiryDate`, never overrides manual `expiryDate`
   * - If estimation fails, `estimatedExpiryDate` is set to null
   * - Considers product name, status, and location for estimation
   */
  execute(id: string): Promise<Product>;
}
