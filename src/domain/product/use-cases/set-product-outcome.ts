import type { Product } from '../model';
import type { ProductOutcome } from '../value-objects';

/**
 * Use case for setting a product's outcome when finished (H2.5).
 *
 * Business rules:
 * - Outcome can only be set when status is 'finished'
 * - Valid outcomes: 'used' (consumed/cooked) or 'thrown_away'
 * - Can be cleared by passing `null`
 * - Tracks food waste and cooking behavior
 *
 * @example
 * ```typescript
 * // Mark product as used (consumed)
 * await setOutcome.execute('product-id', 'used');
 *
 * // Mark product as thrown away (waste)
 * await setOutcome.execute('product-id', 'thrown_away');
 *
 * // Clear outcome
 * await setOutcome.execute('product-id', null);
 * ```
 */
export interface SetProductOutcomeUseCase {
  /**
   * Sets the outcome for a finished product.
   *
   * @param id - Product identifier
   * @param outcome - Outcome ('used' | 'thrown_away' | null)
   * @returns Updated product
   * @throws {ProductError} If product not found
   * @throws {ProductError} If product status is not 'finished'
   */
  execute(id: string, outcome: ProductOutcome | null): Promise<Product>;
}
