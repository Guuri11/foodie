import { ProductError } from '../errors';
import {
  createProduct,
  isActive,
  isExpired,
  isExpiringSoon,
  sortByUrgency,
  updateProduct,
} from '../model';

describe('Product Model', () => {
  describe('Creating a product', () => {
    it('should_create_product_with_valid_name', () => {
      const product = createProduct({ id: '1', name: 'Milk' });

      expect(product.id).toBe('1');
      expect(product.name).toBe('Milk');
    });

    it('should_reject_product_with_empty_name', () => {
      expect(() => createProduct({ id: '1', name: '' })).toThrow(ProductError);

      try {
        createProduct({ id: '1', name: '' });
      } catch (e) {
        expect(e).toBeInstanceOf(ProductError);
        expect((e as ProductError).code).toBe('name_empty');
      }
    });

    it('should_reject_product_with_whitespace_only_name', () => {
      expect(() => createProduct({ id: '1', name: '   ' })).toThrow(ProductError);
    });

    it('should_trim_product_name', () => {
      const product = createProduct({ id: '1', name: '  Milk  ' });
      expect(product.name).toBe('Milk');
    });

    it('should_create_product_with_default_status_new', () => {
      const product = createProduct({ id: '1', name: 'Milk' });
      expect(product.status).toBe('new');
    });

    it('should_not_require_location_or_quantity', () => {
      const product = createProduct({ id: '1', name: 'Milk' });

      expect(product.location).toBeUndefined();
      expect(product.quantity).toBeUndefined();
    });

    it('should_set_created_at_and_updated_at', () => {
      const before = new Date();
      const product = createProduct({ id: '1', name: 'Milk' });
      const after = new Date();

      expect(product.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(product.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(product.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(product.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should_allow_all_status_transitions', () => {
      const statuses = ['new', 'opened', 'almost_empty', 'finished'] as const;

      for (const status of statuses) {
        const product = createProduct({ id: '1', name: 'Milk', status });
        expect(product.status).toBe(status);
      }
    });

    it('should_create_product_with_all_optional_fields', () => {
      const expiryDate = new Date('2025-12-31');
      const estimatedExpiryDate = new Date('2025-12-25');

      const product = createProduct({
        id: '1',
        name: 'Milk',
        status: 'opened',
        location: 'fridge',
        quantity: '1L',
        expiryDate,
        estimatedExpiryDate,
        outcome: 'used',
      });

      expect(product.location).toBe('fridge');
      expect(product.quantity).toBe('1L');
      expect(product.expiryDate).toBe(expiryDate);
      expect(product.estimatedExpiryDate).toBe(estimatedExpiryDate);
      expect(product.outcome).toBe('used');
    });
  });

  describe('Expiry logic', () => {
    it('should_detect_expiring_soon_when_2_days_remain', () => {
      const twoDaysFromNow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
      const product = createProduct({
        id: '1',
        name: 'Milk',
        expiryDate: twoDaysFromNow,
      });

      expect(isExpiringSoon(product)).toBe(true);
    });

    it('should_detect_expiring_soon_when_1_day_remains', () => {
      const oneDayFromNow = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
      const product = createProduct({
        id: '1',
        name: 'Milk',
        expiryDate: oneDayFromNow,
      });

      expect(isExpiringSoon(product)).toBe(true);
    });

    it('should_not_detect_expiring_soon_when_5_days_remain', () => {
      const fiveDaysFromNow = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
      const product = createProduct({
        id: '1',
        name: 'Rice',
        expiryDate: fiveDaysFromNow,
      });

      expect(isExpiringSoon(product)).toBe(false);
    });

    it('should_not_detect_expiring_soon_when_no_expiry_date', () => {
      const product = createProduct({ id: '1', name: 'Salt' });

      expect(isExpiringSoon(product)).toBe(false);
    });

    it('should_use_estimated_expiry_date_when_no_expiry_date', () => {
      const twoDaysFromNow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
      const product = createProduct({
        id: '1',
        name: 'Milk',
        estimatedExpiryDate: twoDaysFromNow,
      });

      expect(isExpiringSoon(product)).toBe(true);
    });

    it('should_detect_expired_when_date_passed', () => {
      const yesterday = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
      const product = createProduct({
        id: '1',
        name: 'Yogurt',
        expiryDate: yesterday,
      });

      expect(isExpired(product)).toBe(true);
    });

    it('should_not_detect_expired_when_date_in_future', () => {
      const tomorrow = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
      const product = createProduct({
        id: '1',
        name: 'Milk',
        expiryDate: tomorrow,
      });

      expect(isExpired(product)).toBe(false);
    });

    it('should_not_detect_expired_when_no_expiry_date', () => {
      const product = createProduct({ id: '1', name: 'Salt' });

      expect(isExpired(product)).toBe(false);
    });
  });

  describe('Active status', () => {
    it('should_be_active_when_status_is_new', () => {
      const product = createProduct({ id: '1', name: 'Milk', status: 'new' });
      expect(isActive(product)).toBe(true);
    });

    it('should_be_active_when_status_is_opened', () => {
      const product = createProduct({ id: '1', name: 'Milk', status: 'opened' });
      expect(isActive(product)).toBe(true);
    });

    it('should_be_active_when_status_is_almost_empty', () => {
      const product = createProduct({ id: '1', name: 'Milk', status: 'almost_empty' });
      expect(isActive(product)).toBe(true);
    });

    it('should_not_be_active_when_status_is_finished', () => {
      const product = createProduct({ id: '1', name: 'Milk', status: 'finished' });
      expect(isActive(product)).toBe(false);
    });
  });

  describe('Urgency sorting', () => {
    it('should_sort_expired_products_first', () => {
      const yesterday = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const fresh = createProduct({ id: '1', name: 'Rice', status: 'new', expiryDate: nextWeek });
      const expired = createProduct({
        id: '2',
        name: 'Yogurt',
        status: 'opened',
        expiryDate: yesterday,
      });

      const sorted = sortByUrgency([fresh, expired]);

      expect(sorted[0].name).toBe('Yogurt');
      expect(sorted[1].name).toBe('Rice');
    });

    it('should_sort_expiring_soon_before_almost_empty', () => {
      const tomorrow = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);

      const almostEmpty = createProduct({ id: '1', name: 'Oil', status: 'almost_empty' });
      const expiringSoon = createProduct({
        id: '2',
        name: 'Milk',
        status: 'opened',
        expiryDate: tomorrow,
      });

      const sorted = sortByUrgency([almostEmpty, expiringSoon]);

      expect(sorted[0].name).toBe('Milk');
      expect(sorted[1].name).toBe('Oil');
    });

    it('should_sort_almost_empty_before_opened', () => {
      const almostEmpty = createProduct({ id: '1', name: 'Oil', status: 'almost_empty' });
      const opened = createProduct({ id: '2', name: 'Rice', status: 'opened' });

      const sorted = sortByUrgency([opened, almostEmpty]);

      expect(sorted[0].name).toBe('Oil');
      expect(sorted[1].name).toBe('Rice');
    });

    it('should_sort_opened_before_new', () => {
      const newProduct = createProduct({ id: '1', name: 'Pasta', status: 'new' });
      const opened = createProduct({ id: '2', name: 'Rice', status: 'opened' });

      const sorted = sortByUrgency([newProduct, opened]);

      expect(sorted[0].name).toBe('Rice');
      expect(sorted[1].name).toBe('Pasta');
    });

    it('should_sort_full_urgency_order_correctly', () => {
      const yesterday = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
      const tomorrow = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);

      const newProduct = createProduct({ id: '1', name: 'Pasta', status: 'new' });
      const opened = createProduct({ id: '2', name: 'Rice', status: 'opened' });
      const almostEmpty = createProduct({ id: '3', name: 'Oil', status: 'almost_empty' });
      const expiringSoon = createProduct({
        id: '4',
        name: 'Milk',
        status: 'opened',
        expiryDate: tomorrow,
      });
      const expired = createProduct({
        id: '5',
        name: 'Yogurt',
        status: 'opened',
        expiryDate: yesterday,
      });

      const sorted = sortByUrgency([newProduct, opened, almostEmpty, expiringSoon, expired]);

      expect(sorted.map((p) => p.name)).toEqual(['Yogurt', 'Milk', 'Oil', 'Rice', 'Pasta']);
    });

    it('should_not_mutate_original_array', () => {
      const products = [
        createProduct({ id: '1', name: 'Pasta', status: 'new' }),
        createProduct({ id: '2', name: 'Oil', status: 'almost_empty' }),
      ];

      const sorted = sortByUrgency(products);

      expect(products[0].name).toBe('Pasta');
      expect(sorted[0].name).toBe('Oil');
    });
  });

  describe('Updating a product', () => {
    it('should_update_location_when_set', () => {
      const product = createProduct({ id: '1', name: 'Milk' });
      const updated = updateProduct(product, { location: 'fridge' });
      expect(updated.location).toBe('fridge');
    });

    it('should_update_quantity_when_set', () => {
      const product = createProduct({ id: '1', name: 'Milk' });
      const updated = updateProduct(product, { quantity: '1 L' });
      expect(updated.quantity).toBe('1 L');
    });

    it('should_clear_location_when_set_to_undefined', () => {
      const product = createProduct({ id: '1', name: 'Milk', location: 'fridge' });
      const updated = updateProduct(product, { location: undefined });
      expect(updated.location).toBeUndefined();
    });

    it('should_refresh_updatedAt_on_update', () => {
      const past = new Date('2020-01-01');
      const product = createProduct({ id: '1', name: 'Milk', updatedAt: past });
      const updated = updateProduct(product, { location: 'fridge' });
      expect(updated.updatedAt.getTime()).toBeGreaterThan(past.getTime());
    });

    it('should_preserve_unchanged_fields', () => {
      const product = createProduct({ id: '1', name: 'Milk', status: 'opened' });
      const updated = updateProduct(product, { location: 'fridge' });
      expect(updated.name).toBe('Milk');
      expect(updated.status).toBe('opened');
      expect(updated.id).toBe('1');
      expect(updated.createdAt).toEqual(product.createdAt);
    });
  });
});
