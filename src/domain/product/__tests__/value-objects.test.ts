import {
  PRODUCT_LOCATIONS,
  PRODUCT_OUTCOMES,
  PRODUCT_STATUSES,
  type ProductLocation,
  type ProductOutcome,
  type ProductStatus,
} from '../value-objects';

describe('Product Value Objects', () => {
  describe('ProductStatus', () => {
    it('should_include_all_valid_statuses', () => {
      const expected: ProductStatus[] = ['new', 'opened', 'almost_empty', 'finished'];
      expect(PRODUCT_STATUSES).toEqual(expected);
    });
  });

  describe('ProductLocation', () => {
    it('should_include_all_valid_locations', () => {
      const expected: ProductLocation[] = ['fridge', 'pantry', 'freezer'];
      expect(PRODUCT_LOCATIONS).toEqual(expected);
    });
  });

  describe('ProductOutcome', () => {
    it('should_include_all_valid_outcomes', () => {
      const expected: ProductOutcome[] = ['used', 'thrown_away'];
      expect(PRODUCT_OUTCOMES).toEqual(expected);
    });
  });
});
