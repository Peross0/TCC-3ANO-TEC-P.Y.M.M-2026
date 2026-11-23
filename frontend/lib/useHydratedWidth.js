import { useEffect, useState } from 'react';
import { useWindowDimensions } from 'react-native';

export function useHydratedWidth() {
  const { width } = useWindowDimensions();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated ? width : 0;
}
