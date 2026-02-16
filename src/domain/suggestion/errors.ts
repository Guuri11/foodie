/**
 * Suggestion Domain Errors
 *
 * Defines error types for the suggestion domain.
 * Uses code-style identifiers as per architecture guidelines.
 */

export class SuggestionError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = 'SuggestionError';
    Object.setPrototypeOf(this, SuggestionError.prototype);
  }

  static NotEnoughProducts(): SuggestionError {
    return new SuggestionError(
      'Not enough products to generate suggestions',
      'not_enough_products'
    );
  }

  static GenerationFailed(reason?: string): SuggestionError {
    return new SuggestionError(
      `Failed to generate suggestions${reason ? `: ${reason}` : ''}`,
      'generation_failed'
    );
  }

  static InvalidSuggestion(reason: string): SuggestionError {
    return new SuggestionError(`Invalid suggestion: ${reason}`, 'invalid_suggestion');
  }
}
