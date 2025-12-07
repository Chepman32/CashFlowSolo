import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

// We'll use react-native's Vibration as fallback since expo-haptics might not be installed
import { Vibration } from 'react-native';

let ReactNativeHapticFeedback: any = null;

try {
  ReactNativeHapticFeedback = require('react-native-haptic-feedback').default;
} catch {
  // Not installed, will use Vibration fallback
}

export type HapticType =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'selection'
  | 'success'
  | 'warning'
  | 'error';

export function triggerHaptic(type: HapticType = 'light'): void {
  if (Platform.OS === 'web') return;

  if (ReactNativeHapticFeedback) {
    const options = {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    };

    const typeMap: Record<HapticType, string> = {
      light: 'impactLight',
      medium: 'impactMedium',
      heavy: 'impactHeavy',
      selection: 'selection',
      success: 'notificationSuccess',
      warning: 'notificationWarning',
      error: 'notificationError',
    };

    ReactNativeHapticFeedback.trigger(typeMap[type], options);
  } else {
    // Fallback to basic vibration
    const durationMap: Record<HapticType, number> = {
      light: 10,
      medium: 20,
      heavy: 30,
      selection: 5,
      success: 15,
      warning: 20,
      error: 25,
    };
    Vibration.vibrate(durationMap[type]);
  }
}

export default triggerHaptic;
