import { createProduct } from '../model';
import { daysUntilExpiry, getUrgencyInfo, getUrgencyLevel } from '../urgency-messages';

describe('Urgency Messages (H2.4)', () => {
  describe('getUrgencyLevel', () => {
    it('should_return_ok_when_no_expiry_date', () => {
      // Given a product with no expiry date
      const product = createProduct({ id: '1', name: 'Salt' });

      // When getting urgency level
      const level = getUrgencyLevel(product);

      // Then it should be 'ok'
      expect(level).toBe('ok');
    });

    it('should_return_wouldnt_trust_when_expired_yesterday', () => {
      // Given a product expired yesterday
      const yesterday = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
      const product = createProduct({
        id: '1',
        name: 'Yogurt',
        expiryDate: yesterday,
      });

      // When getting urgency level
      const level = getUrgencyLevel(product);

      // Then it should be 'wouldnt_trust'
      expect(level).toBe('wouldnt_trust');
    });

    it('should_return_use_today_when_expires_today', () => {
      // Given a product expiring today (in a few hours)
      const today = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now
      const product = createProduct({
        id: '1',
        name: 'Milk',
        expiryDate: today,
      });

      // When getting urgency level
      const level = getUrgencyLevel(product);

      // Then it should be 'use_today'
      expect(level).toBe('use_today');
    });

    it('should_return_use_soon_when_expires_in_2_days', () => {
      // Given a product expiring in 2 days
      const twoDaysFromNow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
      const product = createProduct({
        id: '1',
        name: 'Milk',
        expiryDate: twoDaysFromNow,
      });

      // When getting urgency level
      const level = getUrgencyLevel(product);

      // Then it should be 'use_soon'
      expect(level).toBe('use_soon');
    });

    it('should_return_use_soon_when_expires_in_1_day', () => {
      // Given a product expiring in 1 day
      const oneDayFromNow = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
      const product = createProduct({
        id: '1',
        name: 'Chicken',
        expiryDate: oneDayFromNow,
      });

      // When getting urgency level
      const level = getUrgencyLevel(product);

      // Then it should be 'use_soon'
      expect(level).toBe('use_soon');
    });

    it('should_return_ok_when_expires_in_5_days', () => {
      // Given a product expiring in 5 days
      const fiveDaysFromNow = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
      const product = createProduct({
        id: '1',
        name: 'Rice',
        expiryDate: fiveDaysFromNow,
      });

      // When getting urgency level
      const level = getUrgencyLevel(product);

      // Then it should be 'ok'
      expect(level).toBe('ok');
    });

    it('should_prioritize_manual_date_over_estimated', () => {
      // Given a product with both manual and estimated dates
      const yesterday = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const product = createProduct({
        id: '1',
        name: 'Milk',
        expiryDate: yesterday, // Manual date (expired)
        estimatedExpiryDate: nextWeek, // Estimated date (fresh)
      });

      // When getting urgency level
      const level = getUrgencyLevel(product);

      // Then it should use manual date (expired)
      expect(level).toBe('wouldnt_trust');
    });

    it('should_use_estimated_date_when_no_manual_date', () => {
      // Given a product with only estimated date
      const tomorrow = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);

      const product = createProduct({
        id: '1',
        name: 'Milk',
        estimatedExpiryDate: tomorrow,
      });

      // When getting urgency level
      const level = getUrgencyLevel(product);

      // Then it should use estimated date
      expect(level).toBe('use_soon');
    });
  });

  describe('daysUntilExpiry', () => {
    it('should_return_null_when_no_expiry_date', () => {
      // Given a product with no expiry date
      const product = createProduct({ id: '1', name: 'Salt' });

      // When calculating days until expiry
      const days = daysUntilExpiry(product);

      // Then it should return null
      expect(days).toBeNull();
    });

    it('should_return_negative_when_expired', () => {
      // Given a product expired 2 days ago
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      const product = createProduct({
        id: '1',
        name: 'Yogurt',
        expiryDate: twoDaysAgo,
      });

      // When calculating days until expiry
      const days = daysUntilExpiry(product);

      // Then it should return negative number
      expect(days).toBeLessThan(0);
    });

    it('should_return_0_when_expires_today', () => {
      // Given a product expiring today (in a few hours)
      const today = new Date(Date.now() + 2 * 60 * 60 * 1000);
      const product = createProduct({
        id: '1',
        name: 'Milk',
        expiryDate: today,
      });

      // When calculating days until expiry
      const days = daysUntilExpiry(product);

      // Then it should return 0
      expect(days).toBe(0);
    });

    it('should_return_positive_when_expires_in_future', () => {
      // Given a product expiring in 5 days
      const fiveDaysFromNow = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
      const product = createProduct({
        id: '1',
        name: 'Rice',
        expiryDate: fiveDaysFromNow,
      });

      // When calculating days until expiry
      const days = daysUntilExpiry(product);

      // Then it should return positive number
      expect(days).toBeGreaterThanOrEqual(4); // Could be 4 or 5 depending on hours
      expect(days).toBeLessThanOrEqual(5);
    });
  });

  describe('getUrgencyInfo', () => {
    it('should_return_ok_info_when_no_urgency', () => {
      // Given a fresh product
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const product = createProduct({
        id: '1',
        name: 'Rice',
        expiryDate: nextWeek,
      });

      // When getting urgency info
      const info = getUrgencyInfo(product);

      // Then it should return 'ok' level with correct message key
      expect(info.level).toBe('ok');
      expect(info.messageKey).toBe('product.urgency.ok');
    });

    it('should_return_use_soon_info_when_expiring_soon', () => {
      // Given a product expiring in 2 days
      const twoDaysFromNow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
      const product = createProduct({
        id: '1',
        name: 'Milk',
        expiryDate: twoDaysFromNow,
      });

      // When getting urgency info
      const info = getUrgencyInfo(product);

      // Then it should return 'use_soon' level with correct message key
      expect(info.level).toBe('use_soon');
      expect(info.messageKey).toBe('product.urgency.use_soon');
    });

    it('should_return_use_today_info_when_expires_today', () => {
      // Given a product expiring today
      const today = new Date(Date.now() + 2 * 60 * 60 * 1000);
      const product = createProduct({
        id: '1',
        name: 'Chicken',
        expiryDate: today,
      });

      // When getting urgency info
      const info = getUrgencyInfo(product);

      // Then it should return 'use_today' level with correct message key
      expect(info.level).toBe('use_today');
      expect(info.messageKey).toBe('product.urgency.use_today');
    });

    it('should_return_wouldnt_trust_info_when_expired', () => {
      // Given an expired product
      const yesterday = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
      const product = createProduct({
        id: '1',
        name: 'Yogurt',
        expiryDate: yesterday,
      });

      // When getting urgency info
      const info = getUrgencyInfo(product);

      // Then it should return 'wouldnt_trust' level with correct message key
      expect(info.level).toBe('wouldnt_trust');
      expect(info.messageKey).toBe('product.urgency.wouldnt_trust');
    });
  });
});
