import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const rnBiometrics = new ReactNativeBiometrics();
const PASSCODE_KEY = '@cashflow_passcode';

export type BiometricType = 'FaceID' | 'TouchID' | 'Biometrics' | null;

class AuthService {
  private static instance: AuthService;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async checkBiometricAvailability(): Promise<{
    available: boolean;
    biometryType: BiometricType;
  }> {
    try {
      const { available, biometryType } =
        await rnBiometrics.isSensorAvailable();
      let type: BiometricType = null;

      if (available) {
        switch (biometryType) {
          case BiometryTypes.FaceID:
            type = 'FaceID';
            break;
          case BiometryTypes.TouchID:
            type = 'TouchID';
            break;
          case BiometryTypes.Biometrics:
            type = 'Biometrics';
            break;
        }
      }

      return { available, biometryType: type };
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return { available: false, biometryType: null };
    }
  }

  async authenticateWithBiometrics(promptMessage: string): Promise<boolean> {
    try {
      const { success } = await rnBiometrics.simplePrompt({
        promptMessage,
        cancelButtonText: 'Cancel',
      });
      return success;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return false;
    }
  }

  async savePasscode(passcode: string): Promise<void> {
    try {
      await AsyncStorage.setItem(PASSCODE_KEY, passcode);
    } catch (error) {
      console.error('Error saving passcode:', error);
      throw error;
    }
  }

  async getPasscode(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(PASSCODE_KEY);
    } catch (error) {
      console.error('Error getting passcode:', error);
      return null;
    }
  }

  async verifyPasscode(input: string): Promise<boolean> {
    const stored = await this.getPasscode();
    return stored === input;
  }

  async hasPasscode(): Promise<boolean> {
    const passcode = await this.getPasscode();
    return passcode !== null;
  }

  async clearPasscode(): Promise<void> {
    try {
      await AsyncStorage.removeItem(PASSCODE_KEY);
    } catch (error) {
      console.error('Error clearing passcode:', error);
    }
  }
}

export const authService = AuthService.getInstance();
export default authService;
