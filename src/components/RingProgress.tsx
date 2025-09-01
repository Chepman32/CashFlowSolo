import React from 'react';
import { View, Text, StyleSheet, UIManager, Platform } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

export default function RingProgress({
  size = 120,
  strokeWidth = 14,
  progress = 0,
  color = '#3B82F6',
  trackColor = '#E5E7EB',
  children,
}: {
  size?: number;
  strokeWidth?: number;
  progress?: number; // 0..1
  color?: string;
  trackColor?: string;
  children?: React.ReactNode;
}) {
  const clamped = Math.max(0, Math.min(1, progress ?? 0));
  const radius = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * radius;
  const dashOffset = c * (1 - clamped);

  // If react-native-svg isn't linked (iOS pods not installed yet),
  // avoid rendering <Svg> to prevent the red "Unimplemented component" error.
  const hasSvg = !!(UIManager as any)?.getViewManagerConfig?.('RNSVGSvgView');

  if (!hasSvg) {
    return (
      <View style={{ width: size, height: size }}>
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: trackColor,
          }}
        />
        <View style={StyleSheet.absoluteFillObject}>
          <View style={styles.center}>{children}</View>
        </View>
      </View>
    );
  }

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${c}`}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={StyleSheet.absoluteFillObject}>
        <View style={styles.center}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
