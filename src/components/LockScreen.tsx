import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Vibration,
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useAppTheme } from '../theme/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { authService, BiometricType } from '../services/authService';
import triggerHaptic from '../utils/haptics';

interface LockScreenProps {
  onUnlock: () => void;
  mode: 'unlock' | 'setup' | 'confirm';
  onSetupComplete?: (passcode: string) => void;
}

const PIN_LENGTH = 4;
const KEYPAD = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'biometric',
  '0',
  'delete',
];

export default function LockScreen({
  onUnlock,
  mode,
  onSetupComplete,
}: LockScreenProps) {
  const { colors: theme } = useAppTheme();
  const { t } = useTranslation();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState('');
  const [biometricType, setBiometricType] = useState<BiometricType>(null);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  const shakeX = useSharedValue(0);

  useEffect(() => {
    checkBiometrics();
  }, []);

  const checkBiometrics = async () => {
    const { available, biometryType } =
      await authService.checkBiometricAvailability();
    setBiometricAvailable(available);
    setBiometricType(biometryType);

    // Auto-trigger biometric auth on unlock mode
    if (mode === 'unlock' && available) {
      attemptBiometricAuth();
    }
  };

  const attemptBiometricAuth = async () => {
    const promptMessage =
      biometricType === 'FaceID'
        ? t('lock.faceIdPrompt')
        : t('lock.touchIdPrompt');

    const success = await authService.authenticateWithBiometrics(
      promptMessage || 'Authenticate to unlock',
    );

    if (success) {
      onUnlock();
    }
  };

  const shakeAnimation = useCallback(() => {
    shakeX.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );
    triggerHaptic('error');
  }, [shakeX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const handleKeyPress = async (key: string) => {
    triggerHaptic('light');
    if (key === 'delete') {
      if (isConfirming) {
        setConfirmPin(prev => prev.slice(0, -1));
      } else {
        setPin(prev => prev.slice(0, -1));
      }
      setError('');
      return;
    }

    if (key === '') return;

    const currentPin = isConfirming ? confirmPin : pin;
    if (currentPin.length >= PIN_LENGTH) return;

    const newPin = currentPin + key;

    if (isConfirming) {
      setConfirmPin(newPin);
      if (newPin.length === PIN_LENGTH) {
        // Verify confirmation matches
        if (newPin === pin) {
          onSetupComplete?.(newPin);
        } else {
          shakeAnimation();
          setError(t('lock.pinMismatch') || 'PINs do not match');
          setTimeout(() => {
            setConfirmPin('');
            setIsConfirming(false);
            setPin('');
          }, 1000);
        }
      }
    } else {
      setPin(newPin);
      if (newPin.length === PIN_LENGTH) {
        if (mode === 'setup') {
          // Move to confirmation
          setIsConfirming(true);
          setError('');
        } else if (mode === 'unlock') {
          // Verify PIN
          const isValid = await authService.verifyPasscode(newPin);
          if (isValid) {
            onUnlock();
          } else {
            shakeAnimation();
            setError(t('lock.wrongPin') || 'Wrong PIN');
            setTimeout(() => setPin(''), 500);
          }
        }
      }
    }
  };

  const getTitle = () => {
    if (mode === 'setup') {
      return isConfirming
        ? t('lock.confirmPin') || 'Confirm PIN'
        : t('lock.createPin') || 'Create PIN';
    }
    return t('lock.enterPin') || 'Enter PIN';
  };

  const getSubtitle = () => {
    if (mode === 'setup') {
      return isConfirming
        ? t('lock.reenterPin') || 'Re-enter your 4-digit PIN'
        : t('lock.choosePin') || 'Choose a 4-digit PIN';
    }
    return t('lock.enterPinToUnlock') || 'Enter your PIN to unlock';
  };

  const currentPinDisplay = isConfirming ? confirmPin : pin;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          {getTitle()}
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {getSubtitle()}
        </Text>
      </View>

      <Animated.View style={[styles.dotsContainer, animatedStyle]}>
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor:
                  i < currentPinDisplay.length ? theme.primary : theme.border,
              },
            ]}
          />
        ))}
      </Animated.View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <View style={styles.errorPlaceholder} />
      )}

      <View style={styles.keypad}>
        {KEYPAD.map((key, index) => {
          // Biometric button - only show if available
          if (key === 'biometric') {
            if (!biometricAvailable) {
              return (
                <View
                  key={index}
                  style={[styles.key, { backgroundColor: 'transparent' }]}
                />
              );
            }
            return (
              <Pressable
                key={index}
                onPress={attemptBiometricAuth}
                style={({ pressed }) => [
                  styles.key,
                  {
                    backgroundColor: pressed ? theme.border : theme.surface,
                  },
                ]}
              >
                <Text style={[styles.biometricIcon, { color: theme.primary }]}>
                  {biometricType === 'FaceID' ? '👤' : '👆'}
                </Text>
              </Pressable>
            );
          }

          return (
            <Pressable
              key={index}
              onPress={() => handleKeyPress(key)}
              style={({ pressed }) => [
                styles.key,
                {
                  backgroundColor:
                    key === ''
                      ? 'transparent'
                      : pressed
                      ? theme.border
                      : theme.surface,
                  opacity: key === '' ? 0 : 1,
                },
              ]}
              disabled={key === ''}
            >
              {key === 'delete' ? (
                <Text style={[styles.keyText, { color: theme.textPrimary }]}>
                  ⌫
                </Text>
              ) : (
                <Text style={[styles.keyText, { color: theme.textPrimary }]}>
                  {key}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    height: 20,
    marginBottom: 24,
  },
  errorPlaceholder: {
    height: 20,
    marginBottom: 24,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: 320,
    gap: 20,
  },
  key: {
    width: 85,
    height: 85,
    borderRadius: 42.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyText: {
    fontSize: 32,
    fontWeight: '500',
  },
  biometricIcon: {
    fontSize: 32,
    fontWeight: '400',
  },
});
