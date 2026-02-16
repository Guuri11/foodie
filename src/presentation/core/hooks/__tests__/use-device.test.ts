import { useWindowDimensions } from 'react-native';
import { renderHook } from '@testing-library/react-native';

import { useIsTablet } from '../use-device';

jest.mock('react-native', () => ({
  useWindowDimensions: jest.fn(),
}));

const mockUseWindowDimensions = useWindowDimensions as jest.MockedFunction<
  typeof useWindowDimensions
>;

describe('useIsTablet', () => {
  it('should_return_false_when_width_below_768', () => {
    // Given a mobile-sized screen
    mockUseWindowDimensions.mockReturnValue({ width: 375, height: 812, scale: 2, fontScale: 1 });

    // When checking if tablet
    const { result } = renderHook(() => useIsTablet());

    // Then it returns false (mobile)
    expect(result.current).toBe(false);
  });

  it('should_return_true_when_width_at_768', () => {
    // Given a screen at the tablet breakpoint
    mockUseWindowDimensions.mockReturnValue({ width: 768, height: 1024, scale: 2, fontScale: 1 });

    // When checking if tablet
    const { result } = renderHook(() => useIsTablet());

    // Then it returns true (tablet)
    expect(result.current).toBe(true);
  });

  it('should_return_true_when_width_above_768', () => {
    // Given a large tablet screen
    mockUseWindowDimensions.mockReturnValue({ width: 1024, height: 768, scale: 2, fontScale: 1 });

    // When checking if tablet
    const { result } = renderHook(() => useIsTablet());

    // Then it returns true (tablet)
    expect(result.current).toBe(true);
  });
});
