import { ProductError } from '../errors';
import { createProduct, isActive, isExpired, isExpiringSoon } from '../model';

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
});
