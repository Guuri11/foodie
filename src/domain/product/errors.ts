export type ProductErrorCode =
  | 'name_empty'
  | 'not_found'
  | 'invalid_status'
  | 'already_finished'
  | 'outcome_requires_finished_status';

export class ProductError extends Error {
  constructor(
    public readonly code: ProductErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'ProductError';
  }

  static validation(code: ProductErrorCode, message: string): ProductError {
    return new ProductError(code, message);
  }

  static nameEmpty(): ProductError {
    return ProductError.validation('name_empty', 'Product name cannot be empty');
  }

  static notFound(id: string): ProductError {
    return new ProductError('not_found', `Product with id ${id} not found`);
  }

  static outcomeRequiresFinishedStatus(): ProductError {
    return new ProductError(
      'outcome_requires_finished_status',
      'Outcome can only be set when product status is finished'
    );
  }
}
