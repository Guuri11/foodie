/**
 * Get Suggestions Use Case Interface
 *
 * Contract for retrieving cooking suggestions based on user's pantry.
 * Part of Milestone 3 (H3.1, H3.2, H3.3, H3.4).
 */

import type { Suggestion } from '@domain/suggestion/model';

export interface GetSuggestionsUseCase {
  /**
   * Get cooking suggestions based on current pantry products
   *
   * Business rules:
   * - Returns maximum 3-5 suggestions (never more)
   * - Prioritizes products expiring soon (H3.2)
   * - Returns empty array if not enough products
   * - Should be fast (<1 second for decision making)
   *
   * @param limit Maximum number of suggestions (default: 5)
   * @returns Array of suggestions, sorted by urgency
   * @throws SuggestionError if generation fails
   */
  execute(limit?: number): Promise<Suggestion[]>;
}
