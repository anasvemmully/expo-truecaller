import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

type Props = {
  isExchanging: boolean;
  profile: Record<string, unknown> | null;
  exchangeError: string | null;
};

export function BackendExchangeStatus({ isExchanging, profile, exchangeError }: Props) {
  return (
    <>
      {isExchanging && <ActivityIndicator style={styles.spinner} />}

      {profile && (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>Profile from backend ✓</Text>
          <Text style={styles.resultDetail}>{JSON.stringify(profile, null, 2)}</Text>
        </View>
      )}

      {exchangeError && (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitleError}>Backend exchange failed</Text>
          <Text style={styles.resultDetail}>{exchangeError}</Text>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  spinner: {
    marginTop: 8,
  },
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
