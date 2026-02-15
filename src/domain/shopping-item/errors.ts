export type ShoppingItemErrorCode = 'name_empty' | 'not_found' | 'already_exists';

export class ShoppingItemError extends Error {
  constructor(
    public readonly code: ShoppingItemErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'ShoppingItemError';
  }

  static nameEmpty(): ShoppingItemError {
    return new ShoppingItemError('name_empty', 'Shopping item name cannot be empty');
  }

  static notFound(id: string): ShoppingItemError {
    return new ShoppingItemError('not_found', `Shopping item with id ${id} not found`);
  }

  static alreadyExists(): ShoppingItemError {
    return new ShoppingItemError('already_exists', 'Shopping item already exists');
  }
}
