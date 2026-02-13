import type { Product } from '../model';
import type { ProductStatus } from '../value-objects';

/**
 * Use case for updating a product's lifecycle status (H2.1).
 *
 * Business rules:
 * - All status transitions are allowed (4x4 matrix)
 * - Transitions can be reversed (e.g., finished → opened)
 * - No validation needed (domain model allows all transitions)
 *
 * @example
 * ```typescript
 * // Mark product as opened
 * await updateStatus.execute('product-id', 'opened');
 *
 * // Mark product as finished
 * await updateStatus.execute('product-id', 'finished');
 *
 * // Reverse transition (finished → opened)
 * await updateStatus.execute('product-id', 'opened');
 * ```
 */
export interface UpdateProductStatusUseCase {
  /**
   * Updates a product's status.
   *
   * @param id - Product identifier
   * @param status - New lifecycle status
   * @returns Updated product
   * @throws {ProductError} If product not found
   */
  execute(id: string, status: ProductStatus): Promise<Product>;
}
