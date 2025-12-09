import { Dimensions, Platform, ScaledSize } from 'react-native';
import { useState, useEffect } from 'react';

const { width, height } = Dimensions.get('window');

// Device type detection
export const isTablet = (): boolean => {
  const aspectRatio = height / width;
  const isLargeScreen = Math.min(width, height) >= 600;
  // Tablets typically have aspect ratio closer to 1 (more square)
  const hasTabletAspectRatio = aspectRatio < 1.6 && aspectRatio > 0.625;
  return isLargeScreen || hasTabletAspectRatio;
};

export const isIPad = (): boolean => {
  return Platform.OS === 'ios' && isTablet();
};

export const isLandscape = (): boolean => {
  return width > height;
};

// Responsive scaling utilities
export const getDeviceType = (): 'phone' | 'tablet' => {
  return isTablet() ? 'tablet' : 'phone';
};

// Scale factor for responsive sizing
export const getScaleFactor = (): number => {
  if (isTablet()) {
    return isLandscape() ? 1.3 : 1.2;
  }
  return 1;
};

// Responsive value helper - returns different values for phone vs tablet
export function responsive<T>(phoneValue: T, tabletValue: T): T {
  return isTablet() ? tabletValue : phoneValue;
}

// Hook for responsive dimensions that updates on orientation change
export function useDeviceOrientation() {
  const [dimensions, setDimensions] = useState(() => Dimensions.get('window'));
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(() =>
    dimensions.width > dimensions.height ? 'landscape' : 'portrait',
  );

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
      setOrientation(window.width > window.height ? 'landscape' : 'portrait');
    });

    return () => subscription.remove();
  }, []);

  return {
    width: dimensions.width,
    height: dimensions.height,
    orientation,
    isLandscape: orientation === 'landscape',
    isPortrait: orientation === 'portrait',
    isTablet: isTablet(),
    isIPad: isIPad(),
  };
}

// Hook for responsive values that update on dimension changes
export function useResponsive<T>(phoneValue: T, tabletValue: T): T {
  const { isTablet: tablet } = useDeviceOrientation();
  return tablet ? tabletValue : phoneValue;
}

// Grid column calculator for iPad layouts
export function getGridColumns(): number {
  const { width: screenWidth } = Dimensions.get('window');
  if (screenWidth >= 1024) return 4; // iPad Pro landscape
  if (screenWidth >= 768) return 3; // iPad portrait / landscape
  if (screenWidth >= 600) return 2; // Large phones / small tablets
  return 1; // Phones
}

// Content width for centered layouts on large screens
export function getContentMaxWidth(): number | undefined {
  if (!isTablet()) return undefined;
  const { width: screenWidth } = Dimensions.get('window');
  // Cap content width on very large screens for better readability
  if (screenWidth >= 1024) return 900;
  if (screenWidth >= 768) return screenWidth * 0.9;
  return undefined;
}

// Padding scale for iPad
export function getResponsivePadding(basePadding: number): number {
  return isTablet() ? basePadding * 1.5 : basePadding;
}

// Font scale for iPad
export function getResponsiveFontSize(baseFontSize: number): number {
  if (!isTablet()) return baseFontSize;
  // Scale up fonts slightly on iPad for better readability
  return Math.round(baseFontSize * 1.15);
}
