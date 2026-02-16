import { useWindowDimensions } from 'react-native';

const TABLET_BREAKPOINT = 768;

export function useIsTablet(): boolean {
  const { width } = useWindowDimensions();
  return width >= TABLET_BREAKPOINT;
}
