import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Product } from '@domain/product/model';

import { ProductRepositoryLocal } from '../product-repository-local';

// AsyncStorage is auto-mocked by jest-expo

describe('ProductRepositoryLocal', () => {
  let repository: ProductRepositoryLocal;
  const now = new Date();

  const milk: Product = {
    id: '1',
    name: 'Milk',
    status: 'opened',
    location: 'fridge',
    createdAt: now,
    updatedAt: now,
  };

  const rice: Product = {
    id: '2',
    name: 'Rice',
    status: 'new',
    location: 'pantry',
    createdAt: now,
    updatedAt: now,
  };

  const finishedYogurt: Product = {
    id: '3',
    name: 'Yogurt',
    status: 'finished',
    outcome: 'used',
    createdAt: now,
    updatedAt: now,
  };

  beforeEach(async () => {
    await AsyncStorage.clear();
    repository = new ProductRepositoryLocal();
  });

  it('should_return_empty_array_when_storage_empty', async () => {
    // Given the storage is empty
    // When we get all products
    const products = await repository.getAll();

    // Then an empty array is returned
    expect(products).toEqual([]);
  });

  it('should_persist_and_retrieve_product', async () => {
    // Given a product to save
    // When we save and retrieve it
    await repository.save(milk);
    const products = await repository.getAll();

    // Then the product is returned correctly
    expect(products).toHaveLength(1);
    expect(products[0].id).toBe('1');
    expect(products[0].name).toBe('Milk');
    expect(products[0].status).toBe('opened');
    expect(products[0].location).toBe('fridge');
  });

  it('should_retrieve_product_by_id', async () => {
    // Given products exist
    await repository.save(milk);
    await repository.save(rice);

    // When we get by ID
    const found = await repository.getById('1');

    // Then the correct product is returned
    expect(found).not.toBeNull();
    expect(found!.name).toBe('Milk');
  });

  it('should_return_null_when_product_not_found', async () => {
    // Given no matching product
    const found = await repository.getById('nonexistent');

    // Then null is returned
    expect(found).toBeNull();
  });

  it('should_update_existing_product', async () => {
    // Given a saved product
    await repository.save(milk);

    // When we update it
    const updatedMilk: Product = { ...milk, status: 'almost_empty' };
    await repository.save(updatedMilk);
    const products = await repository.getAll();

    // Then the product is updated, not duplicated
    expect(products).toHaveLength(1);
    expect(products[0].status).toBe('almost_empty');
  });

  it('should_delete_product', async () => {
    // Given saved products
    await repository.save(milk);
    await repository.save(rice);

    // When we delete one
    await repository.delete('1');
    const products = await repository.getAll();

    // Then only the other remains
    expect(products).toHaveLength(1);
    expect(products[0].id).toBe('2');
  });

  it('should_filter_active_products', async () => {
    // Given a mix of active and finished products
    await repository.save(milk);
    await repository.save(rice);
    await repository.save(finishedYogurt);

    // When we get active products
    const activeProducts = await repository.getActiveProducts();

    // Then only non-finished products are returned
    expect(activeProducts).toHaveLength(2);
    expect(activeProducts.map((p) => p.name)).toEqual(['Milk', 'Rice']);
  });

  it('should_preserve_dates_through_serialization', async () => {
    // Given a product with dates
    const expiryDate = new Date('2025-12-31T10:00:00.000Z');
    const productWithDates: Product = {
      ...milk,
      expiryDate,
      estimatedExpiryDate: expiryDate,
    };

    // When we save and retrieve it
    await repository.save(productWithDates);
    const products = await repository.getAll();

    // Then dates are preserved
    expect(products[0].expiryDate).toEqual(expiryDate);
    expect(products[0].estimatedExpiryDate).toEqual(expiryDate);
    expect(products[0].createdAt).toEqual(now);
  });
});
