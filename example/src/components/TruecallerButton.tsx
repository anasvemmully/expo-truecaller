import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  isCheckingAvailability: boolean;
  isTruecallerUsable: boolean;
  isVerifying: boolean;
  onPress: () => void;
};

export function TruecallerButton({
  isCheckingAvailability,
  isTruecallerUsable,
  isVerifying,
  onPress,
}: Props) {
  if (isCheckingAvailability) {
    return <ActivityIndicator style={styles.availabilitySpinner} />;
  }

  if (!isTruecallerUsable) {
    return (
      <Text style={styles.unavailableText}>
        Truecaller isn't available on this device. Fall back to manual verification.
      </Text>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [styles.truecallerButton, pressed && styles.buttonPressed]}
      onPress={onPress}
      disabled={isVerifying}>
      {isVerifying ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <View style={styles.truecallerButtonContent}>
          <Text style={styles.truecallerButtonText}>Continue with</Text>
          <Image
            source={require('../../assets/truecaller-white-no-bg.png')}
            style={styles.truecallerLogo}
            resizeMode="contain"
          />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  availabilitySpinner: {
    marginTop: 8,
  },
  truecallerButton: {
    width: '100%',
    backgroundColor: '#0087ff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  truecallerButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  truecallerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  truecallerLogo: {
    width: 116,
    height: 20,
  },
  unavailableText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
  },
});
