export interface DeleteShoppingItemUseCase {
  execute(id: string): Promise<void>;
}
