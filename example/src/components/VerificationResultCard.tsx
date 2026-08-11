import { TruecallerVerificationResult } from 'expo-truecaller';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  result: TruecallerVerificationResult;
};

export function VerificationResultCard({ result }: Props) {
  return (
    <View style={styles.resultBox}>
      {result.status === 'success' && result.platform === 'android' && (
        <>
          <Text style={styles.resultTitle}>Verified ✓ (Android)</Text>
          <Text style={styles.resultDetail}>
            authorizationCode: {result.authorizationCode.slice(0, 12)}…
          </Text>
          <Text style={styles.resultDetail}>scopes: {result.scopesGranted.join(', ')}</Text>
        </>
      )}
      {result.status === 'success' && result.platform === 'ios' && (
        <>
          <Text style={styles.resultTitle}>Verified ✓ (iOS)</Text>
          <Text style={styles.resultDetail}>
            {result.profile.firstName} {result.profile.lastName}
          </Text>
          <Text style={styles.resultDetail}>{result.profile.phoneNumber}</Text>
          <Text style={styles.resultDetail}>
            verification material:{' '}
            {result.profile.verification ? 'present (forward to your backend to verify)' : 'absent'}
          </Text>
        </>
      )}
      {result.status === 'failure' && (
        <>
          <Text style={styles.resultTitleError}>Verification failed</Text>
          <Text style={styles.resultDetail}>{result.error}</Text>
          {result.errorMessage && <Text style={styles.resultDetail}>{result.errorMessage}</Text>}
        </>
      )}
      {result.status === 'dismissed' && (
        <>
          <Text style={styles.resultTitle}>Verification dismissed</Text>
          {result.errorMessage && <Text style={styles.resultDetail}>{result.errorMessage}</Text>}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  resultBox: {
    marginTop: 32,
    width: '100%',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  resultTitleError: {
    fontSize: 16,
    fontWeight: '600',
    color: '#d32f2f',
    marginBottom: 4,
  },
  resultDetail: {
    fontSize: 13,
    color: '#555',
  },
});
