import { StatusBar } from 'expo-status-bar';
import { useTruecaller } from 'expo-truecaller';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BackendExchangeStatus } from './src/components/BackendExchangeStatus';
import { TruecallerButton } from './src/components/TruecallerButton';
import { VerificationResultCard } from './src/components/VerificationResultCard';
import { BACKEND_URL } from './src/constants/config';

export default function App() {
  const {
    isCheckingAvailability,
    isTruecallerUsable,
    isVerifying,
    result,
    requestVerification,
    clearCredentials,
  } = useTruecaller({
    customization: {
      buttonColor: '#0087FF',
      buttonTextColor: '#FFFFFF',
      loginTextPrefix: 'toContinue',
      ctaText: 'continue',
      buttonShape: 'rounded',
      footerType: 'skip',
      consentHeading: 'logInTo',
      verifyMode: 'allUsers',
      dismissOption: 'crossButton',
      consentMode: 'bottomSheet',
      enhancedBottomSheet: true,
    },
    onResult: (result) => {
      if (result.status === 'success' && result.platform === 'android') {
        exchangeWithBackend(result.authorizationCode, result.codeVerifier);
      }
    },
  });

  const [isExchanging, setIsExchanging] = useState(false);
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [exchangeError, setExchangeError] = useState<string | null>(null);

  const exchangeWithBackend = async (authorizationCode: string, codeVerifier: string) => {
    setIsExchanging(true);
    setProfile(null);
    setExchangeError(null);
    try {
      const response = await fetch(`${BACKEND_URL}/auth/truecaller/exchange`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorizationCode, codeVerifier }),
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.error ?? `Backend returned ${response.status}`);
      }
      setProfile(body.profile);
    } catch (error) {
      setExchangeError(error instanceof Error ? error.message : 'Exchange failed');
    } finally {
      setIsExchanging(false);
    }
  };

  const handleContinueWithTruecaller = () => {
    requestVerification({
      scopes: ['profile', 'phone'],
      theme: 'light',
      language: 'en',
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <View style={styles.content}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Verify your number to continue</Text>

        <TruecallerButton
          isCheckingAvailability={isCheckingAvailability}
          isTruecallerUsable={isTruecallerUsable}
          isVerifying={isVerifying}
          onPress={handleContinueWithTruecaller}
        />

        {result && <VerificationResultCard result={result} />}

        <BackendExchangeStatus
          isExchanging={isExchanging}
          profile={profile}
          exchangeError={exchangeError}
        />

        <Pressable
          style={({ pressed }) => [styles.clearButton, pressed && styles.buttonPressed]}
          onPress={clearCredentials}>
          <Text style={styles.clearButtonText}>Clear Credentials</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    color: '#666',
    marginBottom: 40,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  clearButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '500',
  },
});
